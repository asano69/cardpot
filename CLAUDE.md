# Overview

- Cardpotは、個人や少人数チームに最適化された汎用カード型ナレッジベースです．
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
- Tailwindを使っており、marginのような親/兄弟レイアウトに影響を及ぼすスタイルは親コンポーネントから使うようにするべき。
- jsxにおいて、return の先頭にコメント（{/*...*/} ）を置く場合は Fragment （<>...</>）で囲まなければならない。


## Tech Stack
### backend
- Go
- PocketBase v0.39+
- reearth/ygo v1.49.5
- blevesearch/bleve

### frontend
- Solid.js v1.9
- Kobalte v0.13+
- Tailwind v4 / CSS Modules
- clauderic/dnd-kit v0.5.0
- CodeMirror6
- yjs
- googlechrome/workbox


## Work in progress
- 10万枚規模のカードに対応できるように、起動時のカードコレクションフルフェッチをやめる。
