import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Équivalent shadcn/ui "Button" porté sur React Native : même logique
// de variantes (cva) que la version web, mais construit avec les
// primitives RN (Pressable/Text) puisque les composants shadcn/ui basés
// sur Radix (web) ne peuvent pas s'exécuter dans Expo.
const buttonVariants = cva("flex-row items-center justify-center rounded-xl", {
  variants: {
    variant: {
      default: "bg-brand active:bg-brand-dark",
      destructive: "bg-red-600 active:bg-red-700",
      outline: "border border-zinc-300 bg-transparent active:bg-zinc-100",
      secondary: "bg-zinc-100 active:bg-zinc-200",
      ghost: "bg-transparent active:bg-zinc-100",
    },
    size: {
      default: "h-12 px-5",
      sm: "h-9 px-3",
      lg: "h-14 px-6",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

const buttonTextVariants = cva("text-base font-semibold text-center", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-zinc-900",
      secondary: "text-zinc-900",
      ghost: "text-zinc-900",
    },
  },
  defaultVariants: { variant: "default" },
});

type ButtonProps = Omit<PressableProps, "children"> &
  VariantProps<typeof buttonVariants> & {
    label?: string;
    loading?: boolean;
    className?: string;
    textClassName?: string;
    children?: ReactNode;
  };

export function Button({
  variant,
  size,
  label,
  loading,
  className,
  textClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), (disabled || loading) && "opacity-50", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "secondary" || variant === "ghost" ? "#18181B" : "#fff"} />
      ) : children ? (
        children
      ) : (
        <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{label}</Text>
      )}
    </Pressable>
  );
}
