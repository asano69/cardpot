import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Search } from "@kobalte/core/search";
import { Search as SearchIcon } from "@/lib/icons";
import { suggestTitles } from "@/lib/dexie/titleSuggestQuery";
import { titleToLowerKey, titleToSegment } from "@/lib/models/slugify";

export interface TitleSearchProps {
  potId: string;
  potSlug: string;
}

// TopBar's title search: suggests the pot's card titles by titleLc prefix,
// from the same source as the editor's "[" completion (see
// lib/dexie/titleSuggestQuery.ts), and opens the chosen card. Class names
// follow Cosense's navbar (.navbar-form > .search-form > .form-group >
// .dropdown > .form-control, plus .btn-search for the icon).
export default function TitleSearch(props: TitleSearchProps) {
  const navigate = useNavigate();
  const [titles, setTitles] = createSignal<string[]>([]);
  // Identifies the latest query, so a slow answer to an older input is dropped.
  let latest = 0;

  const handleInput = async (value: string) => {
    const request = ++latest;
    if (value.trim() === "") {
      setTitles([]);
      return;
    }
    try {
      const found = await suggestTitles(props.potId, titleToLowerKey(value));
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
