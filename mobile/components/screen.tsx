import type { ReactNode } from "react";
import { View, StatusBar, SafeAreaView, type ViewStyle } from "react-native";

type ScreenProps = {
  children: ReactNode;
  backgroundColor?: string;
  /** Style additionnel appliqué au SafeAreaView interne */
  contentStyle?: ViewStyle;
};

/**
 * Wrapper commun à tous les écrans : fond coloré, StatusBar cohérente, SafeAreaView.
 * Extrait des différents écrans (index/history/review) pour éviter la duplication.
 */
export function Screen({ children, backgroundColor = "#F8F5F7", contentStyle }: ScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[{ flex: 1 }, contentStyle]}>{children}</SafeAreaView>
    </View>
  );
}
