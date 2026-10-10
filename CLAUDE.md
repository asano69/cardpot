# Overview

- Cardpotは、個人またはチームに最適化された汎用カード型ナレッジベースです．
- バックエンドはGo、フロントエンドはTypeScriptを使って作られている。設計に柔軟性をもたせるために純粋関数の二重実装は問題ではない。ただし、よくテストし結果が常に同じになるようにする。
- 設計は、docs/architectureを参照する。


## 機能

- 1人から20人までのリアルタイム共同編集
- オフラインモード対応
- 1ポットにつき10万件のノートまで
- 全文検索・ベクトル検索
- カードの簡易的な整理機能
- マルチサーバ連合機能

## Rules

- 後方互換性は維持しなくてよい。
- データベースのマイグレーションはPocketBaseのWEB UIから行うのでマイグレーションコードを作成する必要はない。
- When fixing bugs, add a failing regression test first.
- All errors are user-facing, so messages should be clear.
- Keep functions small and focused.
- Module files should re-export what's needed, hide implementation details.
- 変更内容を Codex形式(Search/Replace形式)で出力してください。
例）
```
mathweb/flask/app.py
<<<<<<< SEARCH
from flask import Flask
=======
import math
from flask import Flask
>>>>>>> REPLACE
```
- ファイルを削除・移動するときはrm・mvコマンドで提示する。
- 全コードを書き直すときは、古いファイルをSearch/Replaceせずに削除して、新規ファイルとして出力する。
例)
internal/parser/links_test.go (new file)
```go
package parser
import (
	"slices"
	"testing"
)
```

- jsxにおいて、return の先頭にコメント（{/*...*/} ）を置く場合は Fragment （<>...</>）で囲まなければならない。


## スタイル規約
- ユーザCSSの対象になるクラスは styles/components/*.css の公開クラスのみ。
- それ以外の内部スタイルはTailwindで書く。公開クラスと同じ要素にTailwindを混ぜない。
- Tailwindを使っており、marginのような親/兄弟レイアウトに影響を及ぼすスタイルは親コンポーネントから使うようにするべき。

1. 公開クラスの一覧を決める (今あるクラスを3分類するだけ。コードは触らない)。
2. 公開クラスの要素から、同じ要素に混ざっているTailwindを外す。例えば .btn を使う要素には flex items-center gap-1.5 を足さず、必要なら内側にラッパーを作るか、.btn 自体に含める。
3. 公開クラスのスタイルをCSS変数経由にする。

## Tech Stack
### backend
- Go 1.26.0 (1.27はライブラリ非対応)
- PocketBase v0.39+
- reearth/ygo v1.49.5
- centrifugal/centrifuge v0.39+
- google/mangle
- blevesearch/bleve

### frontend
- Solid.js v1.9
- yjs
- Dexie.js
- CodeMirror6
- googlechrome/workbox
- Kobalte v0.13+
- clauderic/dnd-kit v0.5.0
- jamiebuilds/tinykeys v4.0+
