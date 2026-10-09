import { createSignal, For } from "solid-js";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { Check, ChevronDown } from "@/lib/icons";

interface QuickMenuProps {
  // Heading shown at the top of the opened menu.
  header: string;
  options: string[];
}

// One dropdown of the quick launch bar: the trigger shows the selected
// option, the menu lists all of them. The selection is local and dummy for
// now; nothing reads it yet.
function QuickMenu(props: QuickMenuProps) {
  const [selected, setSelected] = createSignal(props.options[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger class="btn tool-btn flex items-center gap-1">
        {selected()}
        <ChevronDown size={14} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-popover outline-none font-sans">
          <DropdownMenu.GroupLabel class="px-2 py-1 text-xs text-border">
            {props.header}
          </DropdownMenu.GroupLabel>
          <For each={props.options}>
            {(option) => (
              <DropdownMenu.Item
                onSelect={() => setSelected(option)}
                class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none transition-colors hover:bg-hover-bg data-[highlighted]:bg-hover-bg"
              >
                <span class="flex-1">{option}</span>
                {selected() === option && <Check size={16} />}
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}

// Row of dropdown menus above the card grid (display mode, sort, filter),
// right-aligned. Dummy for now: none of the choices affects the grid yet.
export default function QuickLaunch() {
  return (
    <div class="quick-launch">
      <div class="flex-box">
        <QuickMenu header="Display by" options={["Card", "Table"]} />
        <QuickMenu
          header="Sort by"
          options={[
            "Modified",
            "Created",
            "Last visited",
            "Most linked",
            "Most viewed",
            "Title",
          ]}
        />
        <QuickMenu
          header="Filter by"
          options={["All", "yaeda.icon", "test.icon"]}
        />
      </div>
    </div>
  );
}
