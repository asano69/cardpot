# Dexie による Cards オフライン同期

Cards のローカルミラーは `frontend/src/lib/dexie/database.ts` の Dexie
データベースである。`cards` テーブルはカード ID を主キーにし、pot ごとの
読み取りと並び替えのために `pot`、`[pot+position]`、`[pot+updated]` を
インデックスとして持つ。pull のチェックポイントは `cardCheckpoints` テーブル
に pot ごとに保存する。

`cardsReplication.ts` は既存の checkpoint pull API と Centrifuge イベントを
処理する。ライブのカードは `bulkPut`、ソフト削除レコードは `bulkDelete` して、
UI に削除済みカードを露出させない。ギャップ検出時は保存済みチェックポイント
から pull を再実行する。

複数タブでは Web Locks API の `cardpot:cards-replication:<potId>` を保持した
タブだけが Centrifuge と pull を実行する。ロックを取れなかったタブは書き込まず、
`liveQuery(() => db.cards.where("pot").equals(potId).toArray())` で同一
オリジンの IndexedDB 更新を読む。リーダータブが閉じると、待機中のタブがロックを
取得して同期を引き継ぐ。
