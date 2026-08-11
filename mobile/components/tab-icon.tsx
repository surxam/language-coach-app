import { View, Text } from "react-native";
import type { ReactNode } from "react";

const ACTIVE_COL = "#6366F1";
const INACTIVE = "#94A3B8";

type TabIconProps = {
  icon: ReactNode;
  activeIcon: ReactNode;
  label: string;
  focused: boolean;
};

/**
 * Icône de la barre d'onglets (footer de navigation).
 * Extrait de app/(app)/(tabs)/_layout.tsx pour être réutilisable/testable isolément.
 */
export function TabIcon({ icon, activeIcon, label, focused }: TabIconProps) {
  if (focused) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: ACTIVE_COL,
          borderRadius: 22,
          paddingHorizontal: 14,
          paddingVertical: 10,
          maxWidth: 120,
        }}
      >
        {activeIcon}
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{ fontSize: 12, fontWeight: "700", color: "#fff", flexShrink: 1 }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", gap: 3, paddingTop: 4, width: 64 }}>
      {icon}
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{ fontSize: 11, fontWeight: "500", color: INACTIVE }}
      >
        {label}
      </Text>
    </View>
  );
}
