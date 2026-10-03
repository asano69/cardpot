# 発リンク抽出の統一とオフライン対応の段階的リファクタ計画

エディタ本文から発リンクをクライアント側で抽出して Solid Store に載せ、UI の楽観的更新とオフライン対応の足がかりにする。そのために、サーバーとクライアントの抽出結果を一致させる。

## 1. 目的と方針

- 抽出規則の正はフロントエンド（`parser/cardpot`）。Go 側（`internal/parser`）は寄せる。
- クライアントは、`ytext` の文字列を標準パーサ（`cardpotSyntaxLanguage.parser.parse`）で直接パースして抽出する。エディタの描画用の木は使わない。
  - 理由: 木の未完成（遅延パース）、IME 保留、remount の影響を受けない。純粋関数としてテストできる。
- ハッシュタグ（`#tag`）もリンクとして扱う。リンク先のタイトルは先頭の `#` を1つ除いた文字列。
- 抽出結果は「開いているカード自身の発リンク」に限る。1 hop / 2 hop や他カードの `linkAlive` はスコープ外。

## 2. 現状の食い違い

| # | 項目 | TS（正） | Go（現状） |
| --- | --- | --- | --- |
| 1 | HashTag | `#` 直前が空白または範囲先頭なら、次の空白までがタグ | 無し |
| 2 | Quote | `>` と直後の空白1つを除いた残りを解析 | 行全体を解析 |
| 3 | Table | 行をタブでセルに分け、セルごとに解析。宣言行 `table:` は解析しない | 行全体を解析。宣言行も解析 |
| 4 | BareUrl | `https://...` を URL として消費する（`[` も含む。`]` と空白で終わる） | 無し。URL 中の `[x]` をリンクにする |
| 5 | URL のスキーム | http/https 以外は URL ではない（`[ftp://x]` は WikiLink） | `://` を含めば URL（ExternalLink） |
| 6 | ラベル付き ExternalLink | ラベルを再帰解析（内側の `[x]` は WikiLink） | 子を持たない |
| 7 | URL 判定の差 | `URL.canParse` | `net/url.Parse` |

## 3. フェーズ

各フェーズの終わりで、`make test` が通り、単独でマージ可能であること。

### Phase 0: 共有フィクスチャとテストの足場

- `testdata/link-extraction.json` を作る。形は次のとおり。

```json
  [{"name": "hashtag after space", "text": "T\n#a b #c", "links": [{"title": "a", "titleLc": "a"}, {"title": "c", "titleLc": "c"}]}]
```

  - `text` は先頭にタイトル行を含む完全な本文。タイトル行はリンクとして数えない。
  - `links` は `wikilink.orderedTargets` と同じ規則の出力。最初の出現順で、`titleLc` により重複排除し、最初の綴りを残す。
- Go のテスト（`internal/wikilink`）が、これを読んで `Parse(text).LinkTitles()` → `orderedTargets` を検証する。
- vitest が同じ JSON を読んで検証する。TS 側の関数は Phase 3 で作るので、それまでは `it.todo`。
- ケースの一覧は、前回挙げたハッシュタグ項目に、表 §2 の 2〜7 を足したもの。
- この時点で Go のテストは意図的に赤になる。赤いケースを `known-failing` として列挙しておき、各フェーズで外していく。

完了条件: フィクスチャがあり、Go が赤いケースの一覧が文書化されている。

### Phase 1: Go パーサを TS に寄せる

1ステップごとにフィクスチャのケースが緑になる順に進める。

1. 命名: `WikiLinkTitles` → `LinkTitles`、`KindWikiLink` はそのまま。呼び出し側（`wikilink.Sync`、`import_test.go`、`parser_test.go`）を追従させる。
2. スキーム: `inferURL` を http/https に限定する（#5）。`url.Parse` が通る文字列でも、TS の `URL.canParse` が通らないケースをフィクスチャに足し、差があれば寄せる（#7）。
3. ラベル付き ExternalLink: ラベル部分を再帰解析する（#6）。URL 側（先頭または末尾トークン）は解析しない。
4. BareUrl: `^https?://[^\s\]]+` を認識して消費する（#4）。`parseAt` に `case 'h'` を足す。
5. HashTag: `parseHashTag` を足す（#1）。直前と直後の判定は rune で行う（全角スペース対策）。インライン範囲の先頭は、行頭、`Decoration` の中身、ラベルの先頭、Quote の中身、Table のセル先頭。
6. Quote: 行頭（インデント後）の `>` と直後の空白1つを除いた残りを解析する（#2）。
7. Table: `table:` 宣言行は解析せず、より深いインデントの行をタブでセルに分けて、セルごとに解析する（#3）。`parseCodeBlock` と同様に `bodyLines` を再利用する。

完了条件: フィクスチャの `known-failing` が空。Go の既存テストが緑。

### Phase 2: 既存データとハッシュタグの UI

- バックフィル: 全カードに `wikilink.Sync(app, id, text)` を流す。`text` は `card_ydocs` から復元する。`import.go` の `replaceContent` と同様に、`LoadDoc` → `crdt.Doc` → `GetText("content")` を使う。`scripts/` に置き、サーバー停止中に実行する。再実行しても何も書かない（`Sync` は冪等）。
- ハッシュタグの UI（今回のスコープに含めるか要確認、§6 参照）:
  - `wikiLinkNavigation`: `HashTag` ノードもクリックで遷移する。タイトルは `#` を除いた文字列。
  - `emptyLinks`: `HashTag` も死んだリンクとして赤くする。
  - `CardDescription`: `hashtag` セグメントも `requestLinkAlive` の対象にする。

完了条件: 導入前のカードのハッシュタグが `card_links` に入っている。UI の対象範囲が決定済み。

### Phase 3: TS の抽出関数

- `frontend/src/lib/models/extractLinks.ts` を追加する（純粋関数）。

```
  extractLinks(text: string): { title: string; titleLc: string }[]
```

  - `cardpotSyntaxLanguage.parser.parse(text)` の木を `iterate` する。
  - 対象は `WikiLink` と `HashTag`。ハッシュタグのタイトルは先頭の `#` を除く。
  - `CodeBlock` 内部とインラインコードは、パーサがノードを作らないので自然に除外される。タイトル行は `Title` ノードなので対象外。
  - `titleToLowerKey` で `titleLc` を作り、空なら捨て、最初の出現順で重複排除する。Go の `orderedTargets` と同じ規則。
- `extractLinks.test.ts` が共有フィクスチャを読んで全ケースを検証する。
- `parseDescription` との重複（`DUMMY_TITLE` の扱い）はしない。`extractLinks` は完全な本文を受け取る。

完了条件: フィクスチャが TS・Go 両方で緑。

### Phase 4: overlay store

- `frontend/src/lib/stores/ownLinksStore.ts` を追加する。
  - `overlay: Record<cardId, OwnLink[]>`（Solid store）。
  - `setOwnLinksOverlay(cardId, links)`: 前回と配列が等しければ書かない。
  - `clearOwnLinksOverlay(cardId)`。
- 導出元: `ExistingCardEditor` が `ytext.observe` を購読し、デバウンスして `extractLinks(ytext.toString())` を呼ぶ。エディタの `EditorView` には依存しない。
  - 初回は同期完了後（IndexedDB 由来の内容がロードされた後）に1回導出する。
  - `onCleanup` でタイマーと購読を解除する。
- overlay の寿命:
  - 開いているカードのみ。カードを閉じたら破棄する。
  - サーバーのエコー（`card_links` の realtime イベントと pull）が overlay と一致したら、そのカードの overlay を破棄して Dexie に戻る。
  - Dexie に導出値は書かない。レプリカはサーバーのミラーのままにする。
- ドラフト（カード未作成）は対象外。作成後に `ExistingCardEditor` が導出する。

完了条件: カードを開いている間、本文のリンクが overlay に反映される。overlay と Dexie の切り替えでちらつかない。

### Phase 5: UI への接続

- `RelatedCards`: `ownLinks` は overlay が存在すればそれを使い、無ければ `related.ownLinks`（Dexie）を使う。
- `linkAlive`: 開いているカードのリンクに限り、「自分以外に1枚リンクしている」を Dexie の件数 ≥ 1（自分を除く）として判定できるようにするかを検討する。まずは入れず、New Links の追従だけで十分かを確認してから決める。

完了条件: 開いたままリンクを追加・削除すると、New Links が追従する。オフラインでも同様に動く。

### Phase 6: ドキュメント更新

- `link-alive-and-related-cards.md` の「開いたままリンクを追加しても更新されない」注記と §3 の既知の不正確さを更新する。
- 本計画の §2 の表を、解消済みとして記録する。

## 4. 変更時の注意

- 規則は TS が正。Go 側を変えたら必ずフィクスチャのケースを足す。TS 側を変えたら Go のテストが赤くなることを確認する。
- 空白判定は ECMAScript の `\s` と一致させる（Go は `isJSSpace`）。バイト単位で判定しない。
- overlay を Dexie に書き込まない。checkpoint の意味が崩れる。

## 5. リスク

| リスク | 対策 |
| --- | --- |
| 抽出結果の食い違いが見える症状になる | Phase 0 のフィクスチャを先に作る |
| 古いサーバーのエコーが overlay を上書きする | overlay を優先し、一致したときだけ破棄する |
| ハッシュタグ導入で既存カードの 2 hop が増える | Phase 2 のバックフィルの前に承認を得る |
| 抽出のパース重複 | 実測で問題になれば `TreeFragment.applyChanges` で増分化する |

## 補足


## 決定事項

1. **overlay の破棄条件**: `titleLc` の順序付き配列が一致したら破棄します。`position` と `target_title` の綴りは比較しません。
   - 順序は `position` 昇順のライブ行から作ります。`readOwnLinks` が既に `position` でソートしているので、そのまま `map` するだけです。
   - 綴りは `orderedTargets` が最初の出現を保持するので、クライアントの導出値とずれても `titleLc` が同じなら実害はありません。`RelatedCards` の New Links に出る見出しだけ、overlay 破棄の瞬間に切り替わる可能性があります。

2. **ハッシュタグの UI は計画に含める**: Phase 2 の「要確認」を外し、必須項目にします。
   - `wikiLinkNavigation`、`emptyLinks`、`CardDescription` の3点です。
   - リンク先タイトルの導出 (`#` を1つ除く) が3か所と `extractLinks` で重複しないよう、小さな共通関数 `hashTagTitle(text)` を `lib/models/` に置くのをお勧めします。

3. **`linkAlive` の「2枚以上」規則**: 変更しません。複数カードで共有されるタグは有効 (青) で表示されます。計画書の §5 のリスクと、`link-alive-and-related-cards.md` の §3 に仕様として明記します。

4. **フィクスチャ**: `testdata/link-extraction.json` に決定です。
   - Go は `internal/wikilink` のテストから `../../testdata/...` で読みます。
   - vitest は `vitest.config.ts` の `environment: "jsdom"` 下でも `node:fs` は使えますが、リポジトリ直下への相対パスは `import.meta.url` から解決するのが安全です。


## 計画書の修正点

次の4か所を直します。

- **§1**: ハッシュタグの UI を方針に追加します。
- **Phase 2**: 「今回のスコープに含めるか要確認」を削除し、`hashTagTitle` の共通化を明記します。
- **Phase 4**: 破棄条件を「`titleLc` の順序付き配列が一致」に確定します。
- **§5 リスク**: 「2 hop が増える」「共有タグが有効になる」を、承認済みの仕様に書き換えます。

