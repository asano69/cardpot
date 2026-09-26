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


この回答は、先ほどの推測を裏付けるだけでなく、実装上の根拠まで示してくれていますね。整理すると、cardpotの設計判断は理にかなっていたと言えます。

## cardpotの選択の正当性

`queryCardsPage`/`countCards` は `{ sort: {...}, skip, limit, reactive: false }` を明示していますが、これは今回の回答が指摘する「10万件規模では `find({})` 系の広いセレクタは再計算コストが無視できない」というリスクを、そもそも**reactiveを使わないことで完全に回避**する選択です。

さらに、cardpotのアクセスパターンを見ると、reactive queryを使ってもあまり恩恵がなかったはずです：

- `queryCardsPage`: `skip`/`limit`はあるが `{}`（無条件セレクタ）→ 回答にある「セレクタ + インデックス + `fieldTracking`」の組み合わせ最適化の恩恵を受けにくい形
- ページング結果は `mergeCards` で毎回Solid storeに書き込まれるので、reactiveで自動追随させても、どのみち `windows[potId].ids` の並び替えや重複排除といった業務ロジックは手動でやる必要がある

つまり、reactive queryを使ったとしても `fieldTracking: true` や `createIndex` を別途チューニングする追加コストが発生するだけで、「明示的な関数呼び出し＋手動でSolid storeに反映」という今の設計より複雑になった可能性が高いです。simplicity重視の方針とも整合します。

## 一方で気に留めておくと良い点

`Collection.setFieldTracking` や `createIndex` は「後から有効化できる最適化」として存在するので、将来的にもし以下のような状況になったら検討の余地はあります：

- `queryCardsPage` のskip/limitクエリ自体が遅くなってきた場合（現状はIndexedDB上の話であり、SignalDB自身のインメモリ走査コストとは別軸の懸念点ですが）
- `position`/`pin` でのソートに `createIndex` を張ることで、フルスキャンを避けたい場合

ただし現状 `reactive: false` で運用している限り、`notify()`/`rerun()` 周りのコスト（今回の回答の本題）はそもそも発生していないので、**今すぐ手を入れる理由はありません**。「reactivityアダプタを使っていないなら `@signaldb/solid` 依存自体が本当に必要か」という以前の指摘は、この観点からもやはり見直す価値がありそうです（テストコード `cardsCollection.test.ts` だけのために依存しているなら、プレーンな `Collection` で書き換えて依存を削れる可能性があります）。

