
## 1. `frontend/src/styles/index.css`

Tailwind が宣言していたレイヤー順（`theme, base, components, utilities`）がなくなるので、自前で宣言します。`@import` より前に `@layer` 文を置くのは仕様上問題ありません。
