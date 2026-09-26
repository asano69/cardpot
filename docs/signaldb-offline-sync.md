「SignalDBを完全な差分同期可能なローカルレプリカにする」という設計に転換すれば、position順のwindowという制約自体をなくせるので、ご指摘の通りresyncPotで全量再フェッチが原理的に不要になります。

## Stage 1: SignalDBを「キャッシュ」から「完全レプリカ＋checkpoint保持」に変える（UIは無変更）

**目的**：まずネットワーク層だけを差し替え、画面表示ロジックには一切触れない。リスクを最小化した土台作り。

**変更内容**
- `lib/api/replication.ts`（新規）：`/api/pages/{potId}/cards/pull`を`updatedAt`/`id`のcheckpointでループ呼び出しするクライアント。`pullCardsHandler`のコメント通り「返ってきたページがlimitより短ければ完了」というシンプルな終了条件。
- `lib/signaldb/cardsCollection.ts`を拡張：pot単位のカードcollectionに加えて、同じpotの`checkpoint`（`{updatedAt, id}`）を保存する小さなキーだけのcollectionかkey-value的な仕組みを追加。
- pot初回オープン時、既存の`readCache`によるペイントはそのまま残しつつ、バックグラウンドで「checkpointから現在までpullし切る」処理を追加。checkpointがnull（初回同期）なら結果的にフル取得になるが、これは避けようがない（差分の起点が存在しないため）。

**影響範囲**：`cardsById`/`windows`（既存のUI用Solidストア）はまだ触らない。既存の`fetchCardsPage`ベースの表示ロジックと並行して動くだけ。

**確認できること**：pull→SignalDB反映→checkpoint更新、が単体で正しく動くこと。UI側の回帰リスクはほぼゼロ。

---

## Stage 2: UIのデータソースをREST pagingからSignalDBに切り替える

**目的**：ここで初めて「windowという概念」を捨て、SignalDBを唯一のUIソースにする。

**変更内容**
- `cardsStore.ts`の内部実装を書き換え：`fetchCardsPage`によるページ送りをやめ、SignalDBの`collection.find({pot: potId}, {sort: {pin: -1, position: -1, id: 1}, reactive: true})`から直接取得する形に。
- ただし外部に見せるAPI（`potWindow`, `cardsById`, `loadNextCardsPage`など）のシグネチャは変えない方針を推奨。CardItem/CardForm/CardListなど呼び出し側を一斉に書き換えずに済み、変更をこのファイル内に閉じ込められる。
- Centrifugeのリアルタイムイベント（`handleCardEvent`）も、直接Solidストアを書き換えるのではなく、まずSignalDBの該当collectionに`replaceOne`/`removeOne`し、その変化がSignalDBのreactive queryを通じて自動的にUIへ伝播する形にする（`@signaldb/solid`はすでに依存に入っている）。

**影響範囲**：`cardsStore.ts`のみ。外部インターフェースが変わらないので、コンシューマー側の変更は不要。

**注意点**：Stage 1のpull同期がまだ終わっていないpotについては、「ロード中」表示を維持する必要がある（`loaded`フラグの意味を「pull完了」に寄せる）。

---

## Stage 3: `resyncPot`をcheckpoint差分に置き換える（本題）

**目的**：ここでようやく「全量再フェッチをやめる」が実現する。

**なぜ今なら可能か**：SignalDBがそのpotの**全カード**をローカルに持つようになったため、並び替え（position順）はクライアント側で毎回計算し直せる。これまでの「window（上位N件だけ）」方式だと、サーバの`updated`差分だけでは「今の上位N件」を再構成できなかった（他カードとの相対順位が分からないため）が、全件複製なら問題にならない。

**変更内容**
- Centrifugeの`onResync`（履歴切れ検知）で呼んでいた`resyncPot`の中身を、`fetchCardsPage`によるページ再取得から、保存済みcheckpointを使った`pullCards`差分適用に置き換える。
- 差分適用：`pullCards`が返す各レコードについて、`deleted`が立っていればSignalDBから削除、そうでなければ`upsert`。適用後にcheckpointを最新の`(updated, id)`に更新。
- 「久しぶりにオンラインに戻った」ケース（タブを開いたまま長時間オフライン→復帰）も、この同じ経路（保存済みcheckpoint→差分pull→SignalDB反映）で処理できる。ユーザーが要望していた「SignalDBに差分を反映してからハイドレーション」がここで実現する：pull適用が終わるまでは既存のSignalDBの中身（＝多少古いが一貫性のあるデータ）をそのまま表示し続け、適用完了後に新しい状態へ自然に再レンダリングされる（reactive queryなので明示的な「ハイドレーション」処理を書く必要すらない）。

**影響範囲**：`resyncPot`関数のみ。Stage 2で既にSignalDBがUIソースになっているため、この変更はデータ取得経路の差し替えだけで、UIコードには触れない。

---

## Stage 4: 旧ページング経路の削除と整理

**目的**：もう使われなくなった古いコードパスを消して、実装をシンプルに保つ（CLAUDE.mdの方針通り）。

**変更内容**
- `fetchCardsPage`、`PotWindow.total`をREST由来で持つロジック、`PAGE_SIZE`定数など、REST pagingに紐づくコードを削除。
- `readCache`による「まず古いキャッシュを一瞬見せてから上書き」という二段階ペイントも不要になる（SignalDB自体がreactiveにUIへ流れるので、pull完了を待つだけで済む）。関連コメントも整理。


---

## 全体を通しての留意点

- **初回同期（checkpoint未保有）は依然としてフル取得になる**。これは「差分の起点がない」以上避けられません。「2回目以降の再接続」で不要になる、というのが正確な言い方です。
- 1ポット最大10万件（CLAUDE.md記載）を前提とすると、SignalDBが全件をIndexedDBに持つことになるため、初回同期のコストとストレージ使用量は増えます。ここは「シンプルさ」とのトレードオフとして許容するかどうかの判断が要ります。
- 各Stageは独立してmerge可能な粒度にしてあるので、Stage 1だけ入れて様子を見る、Stage 2で問題が出たらStage 3を保留する、といった段階的なロールバックがしやすい構成です。

---

## Stage 2 実装ノート（Stage 3/4 着手前に必読）

実装済み。次のStageを担当する人（自分を含む）が経緯を再確認できるよう、下した設計判断とその理由を残す。

### 1. ページングは「(a) SignalDBをローカルにskip/limitクエリする」を採用

- `windows[potId].ids` という「読み込んだ範囲」の概念、`PAGE_SIZE`によるDOM描画件数の抑制は**そのまま維持**した。
- 変えたのはデータの取得元だけ：`fetchCardsPage`（サーバーへのREST GET）から`queryCardsPage`（`lib/signaldb/cardsCollection.ts`、ローカルのSignalDBコレクションへの`find({}, {sort, skip, limit})`）に置き換えた。
- 理由：1ポット10万件（CLAUDE.md）を想定すると、pull完了後に全件を一気に`ids`へ入れる方式（案b）は無限スクロールを無意味にし、DOM件数が跳ね上がる。案(a)なら既存の無限スクロールUXを一切変えずに済む。
- ソート順は旧`CARDS_SORT`（`-pin,-position,id`）と同じ意味になるよう`{ pin: -1, position: -1, id: 1 }`をSignalDB側にも指定した。**このソート仕様を変えるときはサーバー側`cardApi.ts`のCARDS_SORTとの整合を必ず確認すること**（今のところ二重管理）。

### 2. リアクティブ反映は「SignalDB＝永続層、Solidストア＝表示用ミラー」の単純化方式

- `@signaldb/solid`のreactive `find()`を`cardsById`/`windows`に直結する設計（ドキュメント案の素直な実装）は**採用しなかった**。モジュールトップレベルでのreactiveスコープ管理が複雑になり、シンプルさ重視の方針に反するため。
- 代わりに、`mergeCards`/`dropCard`/`handleCardEvent`など**既存の更新関数はそのまま残し**、その関数の中で「SignalDBへの書き込み（`writeCache`/`deleteFromCache`、fire-and-forget）」と「Solidストアへの反映」を両方行う、という元々の構造をほぼ維持した。
- 結果として、SignalDBコレクションはUIから直接読まれるreactiveな情報源ではなく、`queryCardsPage`/`countCards`という**明示的な関数呼び出しでのみ**読まれる「ページング用のローカルインデックス」という位置づけになった。
- この判断により、外部インターフェース（`potWindow`, `cardsById`, `loadNextCardsPage`, `CardItem`/`CardList`等の呼び出し側）は**一切変更不要**だった。

### 3. 初回表示は「pull完了まで待ってから描画」（stale cacheの即時ペイントは廃止）

- Stage 1にあった「まず古いIndexedDBキャッシュを一瞬見せてから、バックグラウンドでpullする」という二段階ペイントは**廃止**した。
- `readCache`（全件一括読み込み関数）は削除し、`queryCardsPage`/`countCards`に置き換えた。
- `loadNextCardsPage`は、pot初回オープン時に`ensurePotSynced(potId)`（内部で`syncPotReplica`を呼ぶ）の完了を`await`してから最初のページを読むようになった。オフライン時などpullが失敗しても、SignalDBの中身（前回同期時点のもの）はそのまま使われる（`syncPotReplica`内でエラーはログのみで握りつぶし、既存キャッシュは無傷）。
- **これが後続StageへのDependency**: Centrifugeの履歴切れ（`onResync`）時、SignalDBが全件複製として機能するようになったので、`resyncPot`もいずれ「checkpoint差分をSignalDBに適用するだけ」に置き換えられるはず、というのがStage 3の狙い（下記参照）。

### 4. 同時オープンの重複pull防止：`ensurePotSynced`

- 同じpotが短時間に複数回開かれる（例：`loadNextCardsPage`の初回呼び出しと`IntersectionObserver`の初回発火が競合する）ケースに備え、pot単位の同期Promiseを`potSyncPromises: Map<string, Promise<void>>`にキャッシュした。
- 二度目以降の呼び出しは同じPromiseを待つだけで、`pullAll`を二重に発行しない。
- `releasePot`でこのMapのエントリも削除するようにした（再オープン時に必ず新しい同期を始めるため）。

### 5. `resyncPot`は今回のスコープ外（変更なし）

- `resyncPot`は依然として`fetchCardsPage`（REST）ベースのまま。
- **Stage 3で対応すべきこと**：`resyncPot`を「保存済みcheckpointからの差分pull→SignalDB反映→（reactiveでなく）ローカルストアへの再ハイドレーション」に置き換える。具体的には、`syncPotReplica`相当のロジックを再利用しつつ、pull後に`windows[potId].ids`を「今表示している範囲だけ」SignalDBから読み直す形になるはず。
- ユーザーの要望（「ひさしぶりにオンラインになったときはSignalDBに差分反映→SignalDB=>Solid.jsでUIをハイドレーション」）はStage 3のスコープであり、今回はまだ手を付けていない。

### 6. `lib/signaldb/cardsCollection.ts`のAPI変更まとめ

| 旧 | 新 | 備考 |
| --- | --- | --- |
| `readCache(potId)` (全件取得) | `queryCardsPage(potId, skip, limit)` + `countCards(potId)` | ソートは`{pin:-1, position:-1, id:1}`固定 |
| （なし） | `countCards` | `.count()`メソッドを使用（`@signaldb/core`のカーソルに実在することを確認済み） |
| `writeCache`/`deleteFromCache`/`forgetCache`/`readCheckpoint`/`writeCheckpoint` | 変更なし | Stage 1のまま |

### 7. テストの構造

- `cardsStore.test.ts`は`nextPage`（旧・`getList`用）を`nextLocalPage`（`queryCardsPage`/`countCards`用、`loadNextCardsPage`系のテストで使用）と`nextServerPage`（`getList`用、`resyncPot`系のテストで使用）に分離した。
- 「ソフトデリート除外をサーバーに問い合わせている」ことを検証していた旧テスト（`asks the server only for cards that are not deleted`）は、`loadNextCardsPage`がサーバーを呼ばなくなったため削除。ソフトデリート除外の責務は今後`pullCardsHandler`（差分プロトコル）＋`applyPulledRecords`（SignalDBからの削除適用）側にあることを前提にする。

---

## Stage 3 実装ノート

実装済み。Stage 2のときと同じ理由で、経緯と設計判断を残す。

### 1. `resyncPot`はSignalDBへの差分適用＋ローカル再読み込みに置き換えた

- 旧実装は`fetchCardsPage`（REST）でwindowと同じページ数だけ取得し直していた。新実装は`syncPotReplica`が使っていたロジックを`pullAndApplyDiff`として切り出し、`resyncPot`からも呼ぶようにした：保存済みcheckpointからの差分pull → `applyPulledRecords`でSignalDBに適用（deleteは削除、それ以外はupsert）→ checkpoint更新。
- 差分適用が終わった後、windowが今までカバーしていた件数（`win.ids.length`）ぶんを`queryCardsPage(potId, 0, windowSize)`で**1回のクエリ**として読み直す。SignalDBはpotの全カードを保持する完全レプリカなので、ページごとに何度も問い合わせる必要がない。
- `vanished`（もう表示されなくなったカード）の判定はそのまま維持：再読み込みした`items`に含まれないidは、削除されたか、単に並び替えでwindow外に出ただけ。どちらであっても`cardsById`からは削除する（表示用ストアの整合性のため）が、SignalDBの永続キャッシュ側は`deleteFromCache`を呼ばない。永続キャッシュからの削除は`applyPulledRecords`が本当に削除されたカードだけを対象に行うので、二重管理にならない。

### 2. `resyncPot`はもうサーバーに直接アクセスしない

- `fetchCardsPage`（`lib/api/cardApi.ts`）は`resyncPot`から呼ばれなくなった。関数自体はStage 4で削除する予定なので、このコミットでは残してある。
- テスト（`cardsStore.test.ts`）も合わせて更新：`pb.collection("cards").getList`をスパイしていた`getList`と、それを使う`nextServerPage`ヘルパーは不要になったため削除し、代わりに`pullAll`（`../api/replication`）の戻り値をキューする`nextDiff`ヘルパーを追加した。ローカル再読み込みの検証は既存の`nextLocalPage`（`queryCardsPage`/`countCards`用）をそのまま流用している。

### 3. Stage 4への引き継ぎ

- `fetchCardsPage`、`PotWindow.total`のREST由来ロジック（今回のリファクタで実質的に無くなった）、この`docs/signaldb-offline-sync.md`自体の整理はまだ手つかず。Stage 4でまとめて片付ける。
