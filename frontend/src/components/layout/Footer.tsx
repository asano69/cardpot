import { footerContent } from "@/lib/footerSlot";

// Bottom-of-viewport status bar, symmetric with TopBar: TopBar owns
// the top edge and a per-page actions slot, this owns the bottom edge
// and a per-page status slot (e.g. CardList's "N pages" count). See
// styles/components.css for the actual .footer/.status-bar styling --
// the outer two layers here carry no border/background of their own,
// so an empty slot renders nothing visible instead of a stray bar.
export default function Footer() {
  return (
    <div class="footer">
      <div class="status-bar">{footerContent()}</div>
    </div>
  );
}
