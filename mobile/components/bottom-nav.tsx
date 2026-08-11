import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Mic, BookOpen, History } from "lucide-react-native";
import { TabIcon } from "@/components/tab-icon";

const CARD = "#FFFFFF";
const NAV_BORDER = "#EEF2F6";
const INACTIVE = "#94A3B8";

type BottomNavProps = {
  active: "practice" | "review" | "history";
};

/**
 * Barre de navigation basse (footer) pour les écrans situés hors du groupe
 * (tabs) d'expo-router (ex: détail d'une conversation), stylée à l'identique
 * de la vraie tab bar (voir app/(app)/(tabs)/_layout.tsx) grâce à TabIcon.
 */
export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: CARD,
        borderTopWidth: 1,
        borderTopColor: NAV_BORDER,
        height: 78,
        paddingTop: 12,
        paddingBottom: 14,
      }}
    >
      <Pressable style={{ flex: 1, alignItems: "center" }} onPress={() => router.replace("/")}>
        <TabIcon
          label="Practice"
          focused={active === "practice"}
          icon={<Mic size={20} color={INACTIVE} />}
          activeIcon={<Mic size={20} color="#fff" />}
        />
      </Pressable>
      <Pressable style={{ flex: 1, alignItems: "center" }} onPress={() => router.replace("/review")}>
        <TabIcon
          label="Review"
          focused={active === "review"}
          icon={<BookOpen size={20} color={INACTIVE} />}
          activeIcon={<BookOpen size={20} color="#fff" />}
        />
      </Pressable>
      <Pressable style={{ flex: 1, alignItems: "center" }} onPress={() => router.replace("/history")}>
        <TabIcon
          label="History"
          focused={active === "history"}
          icon={<History size={20} color={INACTIVE} />}
          activeIcon={<History size={18} color="#fff" />}
        />
      </Pressable>
    </View>
  );
}
