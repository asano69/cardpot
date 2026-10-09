import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Search } from "@kobalte/core/search";
import { Search as SearchIcon } from "@/lib/icons";
import { suggestTitles } from "@/lib/dexie/titleIndex";
import { useHotkeys } from "@/lib/hotkeys";
import { titleToSegment } from "@/lib/models/slugify";

export interface TitleSearchProps {
  potId: string;
  potSlug: string;
  // Called with the text of the input on every change, so the parent can
  // use it (TopBar's "add card" button opens a card with this title).
  onQueryChange?: (value: string) => void;
}

// TopBar's title search: suggests the pot's card titles that contain the typed
// words, from the same source as the editor's "[" completion (see
// lib/dexie/titleIndex.ts), and opens the chosen card. Class names
// follow Cosense's navbar (.navbar-form > .search-form > .form-group >
// .dropdown > .form-control, plus .btn-search for the icon).
export default function TitleSearch(props: TitleSearchProps) {
  const navigate = useNavigate();
  const [titles, setTitles] = createSignal<string[]>([]);
  // Identifies the latest query, so a slow answer to an older input is dropped.
  let latest = 0;

  // This component is only mounted while a pot is open (see TopBar), so the
  // hotkey works on the card list and in the editor, and nowhere else.
  let input: HTMLInputElement | undefined;
  useHotkeys({
    "search.focus": () => {
      input?.focus();
      input?.select();
    },
  });

  const handleInput = async (value: string) => {
    props.onQueryChange?.(value);
    const request = ++latest;
    if (value.trim() === "") {
      setTitles([]);
      return;
    }
    try {
      const found = await suggestTitles(props.potId, value);
      if (request === latest) setTitles(found);
    } catch (err) {
      console.error("[title-search] failed to search:", err);
    }
  };

  const handleChange = (title: string | null) => {
    if (title) navigate(`/${props.potSlug}/${titleToSegment(title)}`);
  };

  return (
    <div class="navbar-form hidden md:block">
      <form
        class="search-form"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search<string>
          class="form-group"
          options={titles()}
          onInputChange={handleInput}
          onChange={handleChange}
          itemComponent={(item) => (
            <Search.Item item={item.item} class="search-item">
              <Search.ItemLabel>{item.item.rawValue}</Search.ItemLabel>
            </Search.Item>
          )}
        >
          {/* The popup is positioned against Search.Control, so it must wrap
              the input. */}
          <Search.Control class="dropdown" aria-label="Search titles">
            <Search.Input
              ref={input}
              class="form-control"
              autocomplete="off"
              spellcheck={false}
            />
            <Search.Indicator class="btn-search">
              <Search.Icon>
                <SearchIcon class="kamon" />
              </Search.Icon>
            </Search.Indicator>
          </Search.Control>
          <Search.Portal>
            <Search.Content
              class="dropdown-menu search-menu"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <Search.Listbox />
              <Search.NoResult class="search-item">No results</Search.NoResult>
            </Search.Content>
          </Search.Portal>
        </Search>
      </form>
    </div>
  );
}
