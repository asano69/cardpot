import { Image } from "@kobalte/core/image";

import { LogoIcon } from "./Logo";

export interface PotIconProps {
  // URL of the pot's cover image. Undefined falls back to the app's logo.
  src?: string;
}

// The pot's icon, cropped to a circle like the user's avatar (see
// layout/UserMenu.tsx). While the cover is missing, loading or failed,
// Kobalte shows the fallback: the app's logo.
export default function PotIcon(props: PotIconProps) {
  return (
    <Image
      fallbackDelay={0}
      class="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-hover-bg"
    >
      <Image.Img
        src={props.src}
        alt=""
        class="h-full w-full object-cover"
      />
      <Image.Fallback>
        <LogoIcon size={26} />
      </Image.Fallback>
    </Image>
  );
}
