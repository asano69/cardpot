# SignalDB による Cards オフライン同期

Cards のローカルミラーは SignalDB の `Collection<CardRecord>` である。pot ごとに
`frontend/src/lib/signaldb/cardsCollection.ts` が IndexedDB 永続化付き Collection を
作成し、`frontend/src/lib/signaldb/cardsReplication.ts` が既存の checkpoint pull API と
Centrifuge の通知を同期する。サーバー側の replication API と realtime publish の契約は
変更していない。

## アーキテクチャ

```
PocketBase (cards collection, soft-delete)
   │ create/update/delete hook (internal/realtime/register.go)
   ▼
Centrifuge "cards" channel
   │ WebSocket
   ▼
frontend/src/lib/api/realtime.ts (subscribeToCards)
   │ 変更通知 / resync 通知
   ▼
frontend/src/lib/signaldb/cardsReplication.ts
   │ SyncManager.pull / SyncManager.push
   ▼
SignalDB Collection<CardRecord>
   │ IndexedDB persistence + Solid reactivity
   ▼
frontend/src/lib/stores/cardsStore.ts
   │ cardsForPot / cardById / withCardsFlip
   ▼
UI (CardList / CardForm)
```

## コンポーネントの責務

- **`signaldb/cardsCollection.ts`**: `CardRecord` の Collection と、pot ごとの
  pull checkpoint Collection を定義する。いずれも IndexedDB に永続化される。
- **`signaldb/cardsReplication.ts`**: `SyncManager` の pull/push を構成する。
  pull は `/api/pages/{potId}/cards/pull` を `(updatedAt, id)` checkpoint と
  `limit=200` で最後のバッチまで取得し、ソフト削除レコードを Collection の削除変更へ
  変換する。push は更新を `updateCard`、削除を `deleteCard` に送る。
- **`cardsStore.ts`**: pot の同期ライフサイクルを公開する薄い UI 向け facade。
  読み取りは Collection のリアクティブな `find().fetch()` / `findOne()` を直接使い、
  Dexie `liveQuery` の結果を別の Solid store に複製しない。
- **`cardFlip.ts`**: 並び替えアニメーションだけを担う UI 層。`moveCard`、
  `setCardPinned`、`removeCard` は引き続き `withCardsFlip` 内で Collection を変更する。

## 同期フロー

### pot を開く

1. `ensurePotLoaded(potId)` が pot 専用 Collection と replication handle を作る。
2. リーダータブは Web Locks の `cardpot:cards-replication:<potId>` を取得し、
   Centrifuge 購読を開始する。
3. `SyncManager` が最初の pull を実行する。pull の変更が Collection へ適用された後にのみ
   checkpoint を保存するため、取得済みだが未保存の状態でタブを閉じても checkpoint だけが
   先へ進むことはない。
4. UI は Collection を直接読むため、レコードの更新に応じて再評価される。

### リモート更新・再接続

Centrifuge の card イベントまたは resync 通知を受けたリーダーは pull を再実行し、完了後
`BroadcastChannel` で同じ pot を開いている他タブへ通知する。各フォロワータブは通知を受けて
自身の `SyncManager.sync()` を実行する。これにより、SignalDB の IndexedDB 書き込みを別タブの
Collection が自動では購読しない制約を補う。

Centrifuge history で回復できない長いオフライン期間でも、次の同期は永続化された checkpoint
から差分を取得する。checkpoint が存在するのに Collection が空の旧スナップショットは、起動時に
checkpoint を捨てて一度だけフル pull し、復旧する。

### ローカル操作

カードの移動、pin 切替、削除は Collection を先に更新するため、UI には即時に反映される。
`SyncManager` が生成した変更を push し、失敗は replication の `onError` で記録される。新規作成は
既存の作成 API がサーバーへ保存した後、`mergeCards` がローカル Collection に追加する。

## マルチタブと停止

Web Locks により、pot ごとに Centrifuge 購読と通常の pull を実行するリーダーは1タブだけになる。
リーダーが閉じると待機中のフォロワーがロックを取得して引き継ぐ。`releasePot` は購読、
BroadcastChannel、同期を停止し、その pot の Collection handle を UI から外す。

## 旧 Dexie 実装からの変更点

Dexie の `liveQuery`、カード ID map、window state を使った二重の状態管理は廃止した。Collection の
リアクティブクエリを UI が直接読むことで、IndexedDB の全件結果を毎回 Solid store と O(n) で照合する
処理をなくしている。Dexie 依存および `frontend/src/lib/dexie/` は削除済みである。
