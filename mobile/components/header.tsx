import type { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { Menu } from "lucide-react-native";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/lib/auth-context";

const BRAND = "#5B55F6";
const TEXT = "#1E1B22";

type AppHeaderProps = {
  /** Ouverture du menu profil (déclenchée par l'avatar, et par l'icône gauche si onLeftPress n'est pas fourni) */
  onMenuPress: () => void;
  /** "large" = style utilisé sur l'écran Practice, "default" = History/Review */
  size?: "large" | "default";
  /** Icône affichée à gauche. Par défaut : icône Menu. Passer <ChevronLeft /> pour un écran de détail. */
  leftIcon?: ReactNode;
  /** Action de l'icône gauche. Par défaut : identique à onMenuPress (ouvre le menu profil). */
  onLeftPress?: () => void;
};

/**
 * Header commun : icône (menu ou retour) à gauche, logo au centre, avatar à droite.
 * Extrait de app/(app)/(tabs)/index.tsx pour être partagé entre les écrans.
 */
export function AppHeader({ onMenuPress, size = "default", leftIcon, onLeftPress }: AppHeaderProps) {
  const { user } = useAuth();
  const isLarge = size === "large";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: isLarge ? 24 : 20,
        paddingTop: 54,
        paddingBottom: isLarge ? 0 : 6,
      }}
    >
      <Pressable hitSlop={10} onPress={onLeftPress ?? onMenuPress}>
        {leftIcon ?? <Menu size={23} color={TEXT} strokeWidth={isLarge ? 2.8 : 2.4} />}
      </Pressable>

      <Text
        style={{
          color: BRAND,
          fontSize: isLarge ? 28 : 21,
          fontWeight: "800",
          letterSpacing: isLarge ? -1 : -0.4,
        }}
      >
        LinguistFlow
      </Text>

      <Pressable onPress={onMenuPress}>
        <Avatar
          name={user?.name}
          size={isLarge ? 40 : 38}
          bg={isLarge ? "#D9D4CF" : "#EEF2FF"}
          borderColor={isLarge ? "#262329" : BRAND}
          textColor={isLarge ? "#262329" : BRAND}
        />
      </Pressable>
    </View>
  );
}
