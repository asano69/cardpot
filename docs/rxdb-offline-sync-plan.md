# RxDB導入による Cards のオフライン耐性強化 — 実装計画

前提: 現状は `frontend/src/lib/stores/cardsStore.ts` が PocketBase の `getList` ページングと
Centrifuge のリアルタイムイベント (`frontend/src/lib/api/realtime.ts`) を直接扱っている。
この文書はそれを RxDB 経由に置き換える手順を、後戻りしない順番で示す。

## 0. ゴールと非ゴール

**ゴール**
- `cards` コレクションを RxDB (IndexedDB) にローカル複製し、オフラインでも直前の状態を表示できるようにする。
- オンライン復帰時の再同期を RxDB の replication protocol (checkpoint + RESYNC) に完全委譲し、
  `cardsStore.ts` の手書き `resyncPot` を削除する。
- 最終的に Solid Store は RxDB だけを見る。PocketBase の `getList` を直接叩くページング読み取りコードを撤去する。

**非ゴール（今回は変えない）**
- 書き込み経路。`moveCard` / `setCardPinned` / `createCard` / 削除などは今まで通り PocketBase REST API に直接書く。
  RxDB の push handler は実装しない。conflict resolution も考えない。
- Centrifuge の役割。認証・チャンネル設計は変えない。RxDB の `pullStream$` に流し込む配線だけ足す。
- pots コレクション。まず cards だけで検証し、うまくいけば同じパターンを pots にも適用する（この文書のスコープ外）。

## 1. 全体データフロー（移行後）

```
PocketBase (cards) --centrifuge--> pullStream$ --> RxDB replication --> RxDB (IndexedDB)
                                                                            |
                                                                     reactive query
                                                                            v
                                                                       Solid Store
                                                                            v
                                                                           UI
```

- オンライン時: Centrifuge のイベントがそのまま `pullStream$` に流れ、RxDB のローカル状態が更新される。
- オフライン時: Centrifuge が切断されるだけ。Solid Store は RxDB の最後の状態を見続けるので、UI 側のコード変更は不要。
- 再接続時: RxDB の checkpoint 機構が自動的に pull ハンドラを叩き、抜けを埋める。

## 2. バックエンド (Go) — checkpoint 型 pull API

### 2.1 checkpoint の型

```go
// internal/serve/replication.go (new file)
type CardCheckpoint struct {
	UpdatedAt string `json:"updatedAt"` // PocketBase's own ISO8601 "updated" value, verbatim
	ID        string `json:"id"`
}
```

**着手前に必ず確認すること**: PocketBase の `autodate` フィールド (`cards.updated`) が実際に何桁の精度で
文字列比較可能かを確認する (`internal/migrations` のスナップショットにある `autodate` フィールド定義を見て、
実データを `sqlite3 pb_data/data.db "select updated from cards limit 5"` で目視する)。
同一 `updated` の複数件が起こりうる前提でタイブレークに `id` を必ず使う（2.2 のクエリ参照）。

### 2.2 pull ハンドラ

新ルート `GET /api/pages/{pot}/cards/pull` を `internal/serve/handler.go` の `admin` グループ (superuser 認証) に追加する。

```go
// internal/serve/replication.go
// pullCardsHandler returns cards changed after the given checkpoint, oldest
// first, capped at limit. Mirrors links1hop's own (pot, ...) filter pattern.
func pullCardsHandler(e *core.RequestEvent) error {
	potID := e.Request.PathValue("pot")
	updatedAt := e.Request.URL.Query().Get("updatedAt")
	id := e.Request.URL.Query().Get("id")
	limit := 200 // batch size; tune after measuring initial full-sync latency (see 5.1)

	filter := "pot = {:pot}"
	params := dbx.Params{"pot": potID, "limit": limit}
	if updatedAt != "" {
		filter += " && (updated > {:updatedAt} || (updated = {:updatedAt} && id > {:id}))"
		params["updatedAt"] = updatedAt
		params["id"] = id
	}

	records, err := e.App.FindRecordsByFilter("cards", filter, "updated,id", limit, 0, params)
	if err != nil {
		return e.InternalServerError("pull cards", err)
	}
	// includes soft-deleted cards (deleted != "") on purpose -- RxDB needs
	// the delete events too, not just live rows (see 2.3).
	return e.JSON(http.StatusOK, map[string]any{"records": records})
}
```

**重要**: `notDeleted` フィルタをここでは使わない。RxDB のドキュメントには `_deleted` フラグが必要で、
削除されたカードもタームストーン (削除イベント) として一度は pull される必要がある (2.3 参照)。

### 2.3 削除の扱い

`cards` は物理削除ではなく `deleted` (date) フィールドによるソフトデリート。RxDB 側は `_deleted: boolean` を
必須で持つので、変換時に `record.deleted !== "" ? true : false` を `_deleted` にマップするだけでよい。
新しいコレクションや削除の掃除ポリシーは不要 — 既存のソフトデリートがそのまま RxDB のタームストーンとして機能する。

### 2.4 pullStream 用の配信は Centrifuge を流用する（新規実装なし）

`internal/realtime/register.go` の `cardHook` は既に create/update/delete を `cards` チャンネルに publish している。
ペイロードに checkpoint の元になる `updated`/`id` が既に含まれている (`record` 丸ごと) ので、
**バックエンド側の変更はここでは不要**。フロントの adapter 側で checkpoint 形式に変換する (3.3)。

## 3. フロントエンド — RxDB セットアップ

### 3.1 依存追加

```
cd frontend && bun add rxdb rxjs
```

`rxdb` の `RxDBLeaderElectionPlugin` は不要（複数タブ間の一貫性は今回のスコープ外、後回しでよい）。

### 3.2 スキーマ定義

新規ファイル `frontend/src/lib/rxdb/cardsSchema.ts`。`CardRecord` (`frontend/src/lib/models/card.ts`) の
フィールドをほぼそのまま転記する。

```ts
// frontend/src/lib/rxdb/cardsSchema.ts
import type { RxJsonSchema } from "rxdb";

export interface CardRxDoc {
  id: string;
  pot: string;
  title: string;
  description: string;
  image: string;
  position: number;
  pin: boolean;
  updated: string; // used as the replication checkpoint field
}

export const cardsSchema: RxJsonSchema<CardRxDoc> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 40 },
    pot: { type: "string", maxLength: 40 },
    title: { type: "string" },
    description: { type: "string" },
    image: { type: "string" },
    position: { type: "number" },
    pin: { type: "boolean" },
    updated: { type: "string", maxLength: 32 },
  },
  required: ["id", "pot", "title", "position", "updated"],
  indexes: [
    ["pot", "position"], // CardList's sort order
    ["pot", "updated"],  // checkpoint queries / debugging
  ],
};
```

`deleted` (soft-delete) フィールドは RxDB 側では持たない — `_deleted` (RxDB 予約フィールド) がその役割を果たす。

### 3.3 replication アダプタ

新規ファイル `frontend/src/lib/rxdb/cardsReplication.ts`。

```ts
// frontend/src/lib/rxdb/cardsReplication.ts
import { Subject } from "rxjs";
import { replicateRxCollection } from "rxdb/plugins/replication";
import type { RxReplicationPullStreamItem } from "rxdb";
import { subscribeToCards } from "@/lib/api/realtime";
import type { CardCheckpoint } from "./checkpoint"; // { updatedAt: string; id: string }
import type { CardRxDoc } from "./cardsSchema";

// Converts a PocketBase "cards" record (or a delete event) into the shape
// RxDB expects, including the reserved _deleted flag.
function toRxDoc(record: /* CardEvent's record */ any): CardRxDoc & { _deleted: boolean } {
  return {
    id: record.id,
    pot: record.pot,
    title: record.title,
    description: record.description ?? "",
    image: record.image ?? "",
    position: record.position,
    pin: record.pin,
    updated: record.updated,
    _deleted: Boolean(record.deleted),
  };
}

export function startCardsReplication(collection /* RxCollection<CardRxDoc> */, potID: string) {
  const pullStream$ = new Subject<RxReplicationPullStreamItem<CardRxDoc, CardCheckpoint>>();

  const stopSubscription = subscribeToCards(
    (event) => {
      if (event.record.pot !== potID) return; // this collection instance is scoped to one pot
      pullStream$.next({
        documents: [toRxDoc(event.record)],
        checkpoint: { updatedAt: event.record.updated, id: event.record.id },
      });
    },
    () => {
      // A recovery gap was detected (see realtime.ts's onResync contract).
      // RESYNC tells RxDB to re-run the pull handler from its last known
      // checkpoint -- this replaces cardsStore.ts's hand-written resyncPot.
      pullStream$.next("RESYNC");
    },
  );

  const replication = replicateRxCollection<CardRxDoc, CardCheckpoint>({
    collection,
    replicationIdentifier: `cards-${potID}`,
    live: true,
    pull: {
      async handler(checkpoint, batchSize) {
        const params = new URLSearchParams({ limit: String(batchSize) });
        if (checkpoint) {
          params.set("updatedAt", checkpoint.updatedAt);
          params.set("id", checkpoint.id);
        }
        const res = await fetch(`/api/pages/${potID}/cards/pull?${params}`, {
          headers: { Authorization: pb.authStore.token },
        });
        const { records } = await res.json();
        const documents = records.map(toRxDoc);
        const last = documents.at(-1);
        return {
          documents,
          checkpoint: last ? { updatedAt: last.updated, id: last.id } : checkpoint,
        };
      },
      batchSize: 200, // must match the backend's limit constant (2.2)
      stream$: pullStream$.asObservable(),
    },
    // No push handler: writes go through cardApi.ts's REST calls directly (see 4).
  });

  return () => {
    replication.cancel();
    stopSubscription();
  };
}
```

`subscribeToCards` は既存のまま流用する。ここで新規に足すのは「イベントを `pullStream$` の形式に詰め替える」薄い層だけで、
Centrifuge 自体の接続・認証・再接続ロジックには一切触れない。

### 3.4 データベース初期化

新規ファイル `frontend/src/lib/rxdb/database.ts`。1つの `RxDatabase` を全ポット共通で持ち、
コレクションはポットごとではなく `cards` 単一コレクションにして `pot` フィールドでフィルタする
（ポットごとに別コレクションを作ると replication のライフサイクル管理が煩雑になるため、単一コレクション + クエリ側でスコープする方がシンプル）。

```ts
// frontend/src/lib/rxdb/database.ts
import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { cardsSchema } from "./cardsSchema";

addRxPlugin(RxDBQueryBuilderPlugin);

let dbPromise: ReturnType<typeof createRxDatabase> | undefined;

export function getDb() {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: "cardpot",
      storage: getRxStorageDexie(),
    }).then(async (db) => {
      await db.addCollections({ cards: { schema: cardsSchema } });
      return db;
    });
  }
  return dbPromise;
}
```

## 4. `cardsStore.ts` の置き換え（段階的に）

いきなり全部を書き換えず、次の順で進める。各段階の終わりで `bun run test` が通る状態を保つ。

### 段階 A: 併存させて検証する（本番コードパスには入れない）

`startCardsReplication` を呼び、RxDB にデータが実際に溜まることをブラウザの IndexedDB devtools で確認する。
既存の `cardsStore.ts` はまだ何も変えない。ここで 5.1 のレイテンシ実測を行う。

### 段階 B: 読み取りだけ RxDB に切り替える

`cardsStore.ts` の `mergeCards` / `handleCardEvent` / `loadNextCardsPage` を、
RxDB の reactive query (`collection.find({ selector: { pot: potId }, sort: [...] }).$`) を
`createEffect` で購読して `cardsById` / `windows` の Solid store を更新する形に差し替える。

- `loadNextCardsPage` のページングは撤去候補（5.3 参照）。RxDB はローカル IndexedDB なので
  `find({ pot }).sort([["position", "desc"]])` を一括取得しても、1ポット10万件程度なら実用上問題ない見込み。
  ただし 5.1 の実測結果を見てから決める。
- `watchCards` (Centrifuge 購読の起点) は `startCardsReplication` の呼び出しに置き換わる。
- `resyncPot` は削除する（RxDB の RESYNC が肩代わりする）。

### 段階 C: 楽観的更新のチラつき対策

`moveCard` / `setCardPinned` は PocketBase への直接書き込みのまま残す。書き込み直後、
対応する pullStream イベントが RxDB に反映されるまでの間、ローカルの楽観値を上書きしないよう
薄い pending オーバーレイを足す。

```ts
// Sketch: keyed by card id, cleared once the matching pullStream event lands
// (compare by `updated` -- Solid's optimistic write should stamp a
// client-side "pending" value that a later, real `updated` timestamp
// from the server naturally supersedes).
const [pendingOverrides, setPendingOverrides] = createStore<Record<string, Partial<CardRecord>>>({});
```

これは段階 B が安定してから着手する（読み取り経路が RxDB に一本化されていないと、
オーバーレイをどこに当てるべきかが曖昧になるため）。

## 5. 検証すべきリスクと判断基準

### 5.1 初回フルsyncのレイテンシとメモリ

段階 A の時点で、実データ (または `scripts/load_test_cards.py` で生成した10万件) を使って
以下を計測し、記録する。

- 初回 pull が完了するまでの時間（バッチサイズ 200 で何往復か）
- IndexedDB へのバルク insert のブロッキング時間（UI が固まらないか）
- ブラウザのメモリ使用量の増加

閾値: 初回 sync が体感で 3 秒を超える、またはメインスレッドが 500ms 以上ブロックされる場合は、
バッチサイズやバックグラウンド分割 insert を見直す。ここで致命的な問題が出た場合は本移行を見送る。

### 5.2 checkpoint クエリの正しさ

2.1 の精度確認に加えて、`updated` が同一の複数件のケースを意図的に作り（同一トランザクション内で
複数カードを更新するテストなど）、pull が全件を漏れなく返すことをバックエンドのテストで確認する
(`internal/serve/replication_test.go` を新設)。

### 5.3 windowing / ページングコードの削除可否

段階 B の実測で「全件ローカル取得が現実的」と判断できたら、`CardList.tsx` の
`IntersectionObserver` による無限スクロールは「表示件数を絞る UI 都合」として残すか、
仮想スクロールに置き換えるかを別途判断する。この文書のスコープではこれ以上決めない。

## 6. ロールアウト順序（サマリ）

1. バックエンド: checkpoint 型 pull API (`/api/pages/{pot}/cards/pull`) を追加する（pullStream はまだ繋がない）。
2. フロント: RxDB を導入し、スキーマと pull-only replication を試作、5.1 の実測を行う。
3. 問題なければ Centrifuge を `pullStream$` のトランスポートとして接続する（3.3）。
4. `cardsStore.ts` の読み取り経路を RxDB の reactive query に差し替え、ページングコードを削除する（段階 B）。
5. 楽観的更新のオーバーレイ層を追加する（段階 C）。
6. 旧 `resyncPot` を削除する（4 の時点で不要になっているはず。消し忘れがないか確認するだけ）。

## 7. ファイル変更一覧（見通し用）

**新規**
- `internal/serve/replication.go` — pull ハンドラ
- `internal/serve/replication_test.go`
- `frontend/src/lib/rxdb/cardsSchema.ts`
- `frontend/src/lib/rxdb/cardsReplication.ts`
- `frontend/src/lib/rxdb/database.ts`
- `frontend/src/lib/rxdb/checkpoint.ts`

**変更**
- `internal/serve/handler.go` — ルート登録 (`admin.GET("/cards/pull", ...)` 相当を pages グループに追加)
- `frontend/src/lib/stores/cardsStore.ts` — 読み取り経路を RxDB ベースに置き換え、`resyncPot` 削除
- `frontend/src/components/layout/AppShell.tsx` — `watchCards()` の呼び出し元を `startCardsReplication` 系に差し替え
- `frontend/package.json` — `rxdb`, `rxjs` 追加

**削除候補（段階 B/6 の後）**
- `cardsStore.ts` 内のページング (`fetchCardsPage` の呼び出し部分、`PotWindow.loading` の一部)
