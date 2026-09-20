package notation

import "github.com/yuin/goldmark/ast"

var (
	// KindNode is the kind of every inline syntax node (Bold, WikiLink, ...).
	KindNode = ast.NewNodeKind("CardpotNode")
	// KindBlock is the kind of every block node (Title, Paragraph, CodeBlock).
	// It is deliberately NOT ast.KindParagraph: goldmark merges consecutive
	// nodes of that kind into one paragraph, whereas Cardpot treats every
	// source line as its own block.
	KindBlock = ast.NewNodeKind("CardpotBlock")
)

// Node is one inline syntax node. Name is the Lezer node name used by the
// frontend, so a tree can be printed in the same format as Lezer's toString().
type Node struct {
	ast.BaseInline
	Name string
	// From and To are the node's source byte range.
	From, To int
}

func (n *Node) Kind() ast.NodeKind { return KindNode }

func (n *Node) Dump(source []byte, level int) {
	ast.DumpHelper(n, source, level, map[string]string{"Name": n.Name}, nil)
}

// Block is one block node. An empty Name means "produces no node": goldmark
// requires some block to claim every line, so a whitespace-only line is
// claimed by a nameless block that the tree printer skips.
type Block struct {
	ast.BaseBlock
	Name string

	// raw blocks are not inline-parsed by goldmark.
	raw bool
	// declIndent is the indent depth (in runes) of a CodeBlock's declaration line.
	declIndent int
}

func (b *Block) Kind() ast.NodeKind { return KindBlock }

func (b *Block) IsRaw() bool { return b.raw }

func (b *Block) Dump(source []byte, level int) {
	ast.DumpHelper(b, source, level, map[string]string{"Name": b.Name}, nil)
}

func newNode(name string, from, to int) *Node {
	return &Node{Name: name, From: from, To: to}
}

// markedNode builds Name(NameMark, NameMark) for a node whose first and last
// byte are its opening and closing delimiter, e.g. a WikiLink or inline code.
func markedNode(name string, from, to int) *Node {
	n := newNode(name, from, to)
	n.AppendChild(n, newNode(name+"Mark", from, from+1))
	n.AppendChild(n, newNode(name+"Mark", to-1, to))
	return n
}
