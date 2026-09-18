import { For } from "solid-js";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { Check, SunMoon } from "@/lib/icons";
import { currentPreset, setPreset, type ThemePreset } from "@/lib/theme";

interface PresetOption {
  value: ThemePreset;
  label: string;
}

// Add a new preset here once its [data-theme="x"][data-mode="light"/
// "dark"] override blocks exist (see base.css's own comment for the
// pattern; a preset that adds nothing for a given mode can just omit
// that block and fall back to :root's defaults).
const OPTIONS: PresetOption[] = [
  { value: "default", label: "Default" },
  { value: "blue", label: "Blue" },
];

// A single dropdown: a preset now covers both light and dark at once
// (see base.css), so there's no separate light-preset/dark-preset
// choice to make anymore.
export default function ThemePresetToggle() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger aria-label="Choose color theme" class="icon-btn">
        <SunMoon size={22} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-popover outline-none font-sans">
          <For each={OPTIONS}>
            {(option) => (
              <DropdownMenu.Item
                onSelect={() => setPreset(option.value)}
                class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none transition-colors hover:bg-hover-bg data-[highlighted]:bg-hover-bg"
              >
                <span class="flex-1">{option.label}</span>
                {currentPreset() === option.value && <Check size={16} />}
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
