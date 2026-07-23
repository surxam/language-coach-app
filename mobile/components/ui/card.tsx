import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

// Équivalent shadcn/ui "Card" porté sur React Native — utilisé pour les
// blocs blancs arrondis du récap de conversation (thème, erreurs, mots).
export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("rounded-2xl bg-white p-5 shadow-sm", className)}
      style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: TextProps & { className?: string }) {
  return <Text className={cn("text-lg font-semibold text-zinc-900", className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("mt-3 gap-2", className)} {...props} />;
}
