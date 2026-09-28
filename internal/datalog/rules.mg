# link(Pot, Source, Target): card Source links to the title whose titleLc is Target.
# Facts come from the "card_links" collection (see engine.go).
Decl link(Pot, Source, Target).

# card_title(Pot, Card, TitleLc): a live (not soft-deleted) card and its titleLc.
# Links only store the target's titleLc, so this is what resolves them to cards.
Decl card_title(Pot, Card, TitleLc).

# links1hop(A, B): A links to B, or B links to A. B must be an existing card.
links1hop(A, B) :- link(P, A, X), card_title(P, B, X), A != B.
links1hop(A, B) :- link(P, B, X), card_title(P, A, X), A != B.

# links2hop(A, B): A and B, in the same pot, link to the same target.
#   A --> X <-- B   =>   links2hop(A, B)
links2hop(A, B) :- link(P, A, X), link(P, B, X), A != B.
