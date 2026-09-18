import { For } from "solid-js";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { Check, SunMoon } from "@/lib/icons";
import {
  currentLightPreset,
  currentDarkPreset,
  setLightPreset,
  setDarkPreset,
  type ThemePreset,
} from "@/lib/theme";

interface PresetOption {
  value: ThemePreset;
  label: string;
}

// Add a new preset here once its light-*.css/dark-*.css files exist
// (see styles/theme/base.css and lib/theme.ts's ThemePreset type).
// Both dropdowns below share this same option list, since a preset
// name is expected to have a light and a dark half even though
// either can be added independently.
const OPTIONS: PresetOption[] = [
  { value: "default", label: "Default" },
  { value: "blue", label: "Blue" },
];

// Two independent dropdowns -- one for the light-mode preset, one for
// the dark-mode preset (see lib/theme.ts's data-light-theme/
// data-dark-theme attributes). Picking one never affects the other:
// this is a separate axis from ThemeToggle's light/dark/system choice,
// which only decides which of the two is currently displayed.
export default function ThemePresetToggle() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger aria-label="Choose light theme preset" class="icon-btn">
          <SunMoon size={22} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-popover outline-none font-sans">
            <For each={OPTIONS}>
              {(option) => (
                <DropdownMenu.Item
                  onSelect={() => setLightPreset(option.value)}
                  class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none transition-colors hover:bg-hover-bg data-[highlighted]:bg-hover-bg"
                >
                  <span class="flex-1">{option.label} (light)</span>
                  {currentLightPreset() === option.value && <Check size={16} />}
                </DropdownMenu.Item>
              )}
            </For>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenu.Trigger aria-label="Choose dark theme preset" class="icon-btn">
          <SunMoon size={22} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-popover outline-none font-sans">
            <For each={OPTIONS}>
              {(option) => (
                <DropdownMenu.Item
                  onSelect={() => setDarkPreset(option.value)}
                  class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none transition-colors hover:bg-hover-bg data-[highlighted]:bg-hover-bg"
                >
                  <span class="flex-1">{option.label} (dark)</span>
                  {currentDarkPreset() === option.value && <Check size={16} />}
                </DropdownMenu.Item>
              )}
            </For>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </>
  );
}
