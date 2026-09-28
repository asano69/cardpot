# link(Pot, Source, Target): card Source links to the title whose titleLc is Target.
# Facts come from the "card_links" collection (see engine.go).
Decl link(Pot, Source, Target).

# links2hop(A, B): A and B, in the same pot, link to the same target.
#   A --> X <-- B   =>   links2hop(A, B)
links2hop(A, B) :- link(P, A, X), link(P, B, X), A != B.
