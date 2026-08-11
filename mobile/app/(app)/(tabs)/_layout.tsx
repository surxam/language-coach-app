import { Tabs } from "expo-router";
import { Mic, BookOpen, History } from "lucide-react-native";
import { TabIcon } from "@/components/tab-icon";

const TAB_BAR_BG = "#FFFFFF";
const INACTIVE   = "#94A3B8";
const BORDER_COL = "#EEF2F6";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopColor: BORDER_COL,
          borderTopWidth: 1,
          height: 78,
          paddingTop: 12,
          paddingBottom: 14,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: { paddingHorizontal: 2 },
        tabBarIconStyle: { width: "100%", alignItems: "center" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Practice",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Practice" focused={focused}
              icon={<Mic size={20} color={INACTIVE} />}
              activeIcon={<Mic size={18} color="#fff" />} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Review" focused={focused}
              icon={<BookOpen size={20} color={INACTIVE} />}
              activeIcon={<BookOpen size={18} color="#fff" />} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="History" focused={focused}
              icon={<History size={20} color={INACTIVE} />}
              activeIcon={<History size={18} color="#fff" />} />
          ),
        }}
      />
    </Tabs>
  );
}
