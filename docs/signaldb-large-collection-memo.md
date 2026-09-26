# DeepWiki Q&A with Code Context for Repository: maxnowack/signaldb
## Q1
signalDBのsolidアダプタがあるが、10万件規模のコレクションに対してreactive queryを張ると、購読コストや再計算コストが無視できない可能性がある
### Answer
ご指摘の通りです。`@signaldb/solid` のアダプタ `solidReactivityAdapter` は、購読単位ごとに `createSignal(undefined, { equals: false })` で依存を1つ作り、`notify()` で `rerun()` を呼ぶだけのシンプルな実装です。 signaldb:4-20  つまり通知が来るとクエリ全体が再実行されるため、セレクタが広い(例: `find({})`)場合は10万件規模では再計算コストが無視できません。

---

## コストの構造

- **購読コスト**: `Cursor.fetch()` などがリアクティブスコープ内(`isInScope` = `!!getOwner()`)で呼ばれると、クエリごとに `depend` が呼ばれ dependency が作られます。 signaldb:5-16  依存の粒度は「クエリ単位」なので、購読数自体はクエリ数に比例しますが、1通知あたりの再計算はクエリの結果セット全体に及びます。
- **再計算コスト**: `notify()` は `rerun()` でエフェクトを再実行させ、内部でクエリ再走査が起きます。`{ equals: false }` のため結果が同じでも必ず通知されます。 signaldb:6-13  テストでも変更後に `notify` が呼ばれクエリが再評価される挙動が確認されています。 signaldb:461-474 
- 大量書き込み時は `collection.batch()` が有効で、1万件の insert をまとめても `notify` は最後に1回だけ発火します。 signaldb:507-514 

## 緩和策(コードベース上の公式手段)

| 手段 | 効果 |
|---|---|
| `fieldTracking: true`(`.find()` オプション / `Collection.setFieldTracking`) | アクセスしたフィールド・items が変わった時だけ再実行。大規模データセット向けに明示的に最適化目的で導入されています。 signaldb:83-92 signaldb:113-125  |
| `fields`(projection) | 参照フィールドを絞り、関係ないフィールド変更での再実行を防ぐ。 signaldb:60-64  |
| `createIndex` / `indices` | 10万件のフルスキャンを避ける。テストでは `createIndex('num')` で非インデックス比10%未満の時間を要求しています。 signaldb:660-689  |
| `skip`/`limit` | 返す件数を絞りレンダリング・再計算量を削減。 signaldb:72-81  |
| `batch()` | 一括書き込み時の通知回数を1回に集約。 signaldb:477-515  |

実用上は、10万件のコレクションでは `find({})` のような無条件クエリを避け、セレクタ + インデックス + `fieldTracking` を組み合わせるのが SignalDB 側が想定する使い方です。 signaldb:127-131 

## Notes

- Solid ガイドの例では `<For each={Posts.find(...).fetch()}>` と直接クエリを張っていますが、これは小規模データ向けの簡易例です。 signaldb:81-85 
- なお、アダプタ実装(`src/index.ts`)自体は提供されていますが、`Cursor` / `Collection` のクエリ再評価の内部実装(通知→再走査の経路や selector マッチングの最適化詳細)はインデックス上限のためこのコンテキストでは確認できていません。正確な再計算量を知りたい場合は Devin セッションで `packages/base/core/src/Collection/` と `Cursor` 実装を直接確認することをおすすめします。

Wiki pages you might want to explore:
- [Reactivity System (maxnowack/signaldb)](/wiki/maxnowack/signaldb#4)
- [Changelogs & Release Process (maxnowack/signaldb)](/wiki/maxnowack/signaldb#8.2)
### Citations
**File:** packages/reactivity-adapters/solid/src/index.ts (L4-20)
```typescript
const solidReactivityAdapter = createReactivityAdapter({
  create: () => {
    const [depend, rerun] = createSignal(undefined, { equals: false })
    return {
      depend: () => {
        depend()
      },
      notify: () => {
        rerun()
      },
    }
  },
  isInScope: () => !!getOwner(),
  onDispose: (callback) => {
    onCleanup(callback)
  },
})
```
**File:** packages/base/core/__tests__/Cursor.spec.ts (L461-474)
```typescript
      collection.updateOne({ id: 1 }, { $set: { name: 'item1_modified' } })
      await new Promise((resolve) => {
        setTimeout(resolve, 10)
      })

      expect(notify).toHaveBeenCalled()
      disposal()
      expect(disposal).toHaveBeenCalled()
      collection.updateOne({ id: 1 }, { $set: { name: 'item1_' } })
      await new Promise((resolve) => {
        setTimeout(resolve, 10)
      })
      expect(notify).toHaveBeenCalledTimes(1)
      cursor.cleanup()
```
**File:** packages/base/core/__tests__/Cursor.spec.ts (L477-515)
```typescript
    it('should requery only once after batch operation', () => {
      const depCreation = vi.fn()
      const dep = vi.fn()
      const notify = vi.fn()
      const scopeCheck = vi.fn()

      const reactivity = createReactivityAdapter({
        create() {
          depCreation()
          return {
            depend() {
              dep()
            },
            notify() {
              notify()
            },
          }
        },
        isInScope() {
          scopeCheck()
          return true
        },
      })
      const collection2 = new Collection<{ id: string, name: string }>({
        reactivity,
      })
      const cursor = collection2.find({})
      const result = cursor.fetch()
      expect(result).toHaveLength(0)

      collection2.batch(() => {
        // create items
        for (let i = 0; i < 10_000; i += 1) {
          collection2.insert({ id: i.toString(), name: `John ${i}` })
          expect(notify).toHaveBeenCalledTimes(0)
        }
      })
      expect(notify).toHaveBeenCalled()
    })
```
**File:** docs/queries/index.md (L60-64)
```markdown
::: tip
With the `fields` option you can also control when you query will rerun. If you only query for a field that is not changing, the query will not rerun.

Also see [Field-Level Reactitivity](#field-level-reactivity)
:::
```
**File:** docs/queries/index.md (L72-81)
```markdown
### `skip` and `limit`

To skip or limit the result of a query, use the `skip` or `limit` options. Both options are optional.

```js
collection.find({}, {
  skip: 10,
  limit: 10,
})
```
```
**File:** docs/queries/index.md (L83-92)
```markdown
## Field-Level Reactivity

SignalDB introduces a powerful enhancement to its reactivity system called **Field-Level Reactivity**, which ensures that reactive functions (such as `effect` or `autorun`) only rerun when specific fields accessed in your code are changed. Previously, the reactive system would rerun the query if any field in any item of the result set was modified, regardless of whether those fields were actually used in the code. This led to unnecessary reactivity and potential performance bottlenecks, especially with large datasets.

### Key Features

* **Field-Level Reactivity**: Reactive reruns now occur only when the fields actually accessed by your code are modified, rather than triggering for all changes in the dataset.
* **Item-Level Reactivity**: If a query returns multiple items but you only access fields from specific items, changes in unaccessed items will not trigger a rerun.
* **Automatic Field Tracking**: Instead of manually specifying which fields to track using the `fields` option, SignalDB now automatically tracks fields as you access them. This reduces the chance of developer oversight and simplifies code maintenance.

```
**File:** docs/queries/index.md (L113-125)
```markdown
#### 3. Enable Field Tracking in `.find()` Options

You can enable field tracking on a per-query basis by passing the fieldTracking: true option to the .find() method. When this option is set, reactivity is scoped to the fields you access.

```js
effect(() => {
  const items = someCollection.find({}, { fieldTracking: true }).fetch()
  // Access the fields you care about here
  console.log(items[0].name) // Will rerun only if 'name' field of the 0th item changes
})
```

This behavior optimizes your app’s performance by reducing the number of unnecessary reruns. Instead of rerunning every time any field in any document changes, it only reruns when the relevant fields you’re interacting with are modified.
```
**File:** docs/queries/index.md (L127-131)
```markdown
### Benefits of Automatic Field Tracking

1. Improved Performance: By reducing the scope of reactive reruns to only relevant data, SignalDB minimizes computational overhead and maximizes efficiency, particularly in scenarios where queries return large datasets or where irrelevant fields change frequently.
2. Simplified Code: Developers no longer need to manually specify fields to track. With automatic field tracking, the system handles this for you, allowing you to focus on business logic rather than managing reactivity manually.
3. Reduced Developer Error: Manually tracking fields can be error-prone, especially as queries evolve. Automatic field-level reactivity ensures that your queries remain optimal even as your code changes, making it easier to maintain over time.
```
**File:** packages/base/core/__tests__/Collection.spec.ts (L660-689)
```typescript
    it('should be faster with field indices', () => {
      const col1 = new Collection<{ id: string, name: string, num: number }>({
        indices: [createIndex('num')],
      })
      const col2 = new Collection<{ id: string, name: string, num: number }>()

      Collection.batch(() => {
        // create items
        for (let i = 0; i < 10_000; i += 1) {
          col1.insert({ id: i.toString(), name: 'John', num: i })
          col2.insert({ id: i.toString(), name: 'John', num: i })
        }
      })

      const indexQueryTime = measureTime(() => {
        const item = col1.findOne({ num: 999 })
        expect(item).toEqual({ id: '999', name: 'John', num: 999 })
      })

      const nonIndexQueryTime = measureTime(() => {
        const item = col2.findOne({ num: 999 })
        expect(item).toEqual({ id: '999', name: 'John', num: 999 })
      })

      const percentage = (100 / nonIndexQueryTime) * indexQueryTime
      // eslint-disable-next-line no-console
      console.log('field index performance:', { indexQueryTime, nonIndexQueryTime, percentage })

      // index query should use less than 10% of the time of a non-index query
      expect(percentage).toBeLessThan(10)
```
**File:** docs/guides/solid-js/index.md (L81-85)
```markdown
    <For each={Posts.find({}, { sort: { time: -1 } }).fetch()}>{post => (
      <li>
        {post.title} <span>({post.author})</span>
      </li>
    )}</For>
```
