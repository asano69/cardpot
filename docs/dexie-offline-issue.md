# 10万件規模のpotだと確かに今の設計は遅くる

## 原因

**1. 初回フルsyncのラウンドトリップ数が多い**

`cardsReplication.ts`の`pullPot`は`PULL_BATCH_SIZE = 200`件ずつ、checkpointを進めながら逐次HTTPリクエストします。10万件なら約500往復。ネットワークのRTTが50msでも単純計算で25秒かかります（並列化不可、checkpointが前のレスポンス依存のため）。

**2. `liveQuery`のコールバックが毎回「pot全件」を読み直している**

```ts
const subscription = liveQuery(() =>
  db.cards.where("pot").equals(potId).toArray(),
).subscribe((docs) => { ... });
```

`applyRecords`がIndexedDBに書き込むたびに（つまり500バッチ全部で）このクエリが発火し、`toArray()`で最大10万件をIndexedDBから毎回読み直します。500回 × 平均5万件 ＝ 2500万レコード読み出し相当。ここが体感で一番重い部分だと思われます。

**3. Solid storeの差分計算がO(n)を毎回やっている**

```ts
setCardsById(
  produce((store) => {
    const stillPresent = new Set(docs.map((doc) => doc.id));
    for (const id of Object.keys(store)) { ... }  // storeの全キーを毎回スキャン
    ...
  }),
);
```

これも同じく500回 × 最大10万件のループになり、しかもSolidのreactive storeへの書き込みなので単純なJSオブジェクト操作より重いです。

## 改善案（シンプルさ優先で優先度順）

**a. バッチサイズをサーバ上限（1000）まで上げる**

`PULL_BATCH_SIZE`を200→1000にするだけで、往復回数が500→100に減ります。サーバ側`maxPullLimit`は既に1000なので、フロント側の定数を変えるだけの1行修正です。

**b. 初回replication中はliveQueryの発火を間引く**

RxJSではなくDexieの`liveQuery`なので、単純にsubscribeコールバック内で「initialReplicationが完了するまではSolid storeへの反映をスキップし、完了後に1回だけ全件読む」形にできます。例えば：

```ts
let settled = false;
const subscription = liveQuery(() =>
  db.cards.where("pot").equals(potId).toArray(),
).subscribe((docs) => {
  if (!settled && !initialReplicationDone) return; // 初回同期中は無視
  // ...既存の処理
});
```

ただし「初回同期完了までカードが1件も表示されない」体験になるので、代わりに「最後の書き込みから一定時間（例えば300ms）操作がなければ反映する」というdebounce的な間引きの方が自然です。単純にタイマーで間引くだけなら依存追加なしで書けます。

**c. Object.keys(store)の全スキャンをやめる**

`stillPresent`との差分を取る代わりに、`windows[potId].ids`（既存のSet化したもの）と比較すればpot内の件数分だけのループで済み、store全体（他のpotのカードも含む）を毎回舐める必要がなくなります。

## それでも重い場合

上記a〜cをやってもO(件数)の処理が10万件規模で走ることに変わりはないので、根本的に速くしたいなら「potを開いた瞬間に全件をSolid storeにミラーする」設計自体を見直す必要があります。具体的には：

- 初回表示は先頭N件だけ表示し、残りはバックグラウンドでIndexedDBに溜め続ける（UIは`windows[potId].ids`の一部だけ使う）
- Solid store（`cardsById`）への全件ミラーをやめ、表示に必要な分だけリアクティブクエリで取得する

---

## 解決状況（SignalDB 移行後）

この記録で問題としていた Dexie `liveQuery` の全件再読み込みと、Solid store への O(n) 差分反映は
SignalDB 移行により解消済みです。Cards UI は `Collection.find().fetch()` を直接リアクティブに読み、
Dexie のローカルミラーと二重ステート管理は廃止しました。なお、checkpoint pull はサーバー API との
互換性のため引き続き 200 件単位の逐次取得です。現在の設計は
[`signaldb-offline-sync.md`](./signaldb-offline-sync.md) を参照してください。
