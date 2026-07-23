import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

// Équivalent shadcn/ui "Input" porté sur React Native (TextInput natif
// stylé avec NativeWind, même esprit visuel que la version web).
export const Input = forwardRef<TextInput, TextInputProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor="#A1A1AA"
        className={cn(
          "h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
