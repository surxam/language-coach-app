import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Identique à l'utilitaire `cn` standard de shadcn/ui, utilisé par tous
// les composants `components/ui/*` pour fusionner proprement les classes
// Tailwind (NativeWind) passées en props.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
