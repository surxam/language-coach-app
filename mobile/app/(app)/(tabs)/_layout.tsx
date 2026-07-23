import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Mic, BookOpen, History } from "lucide-react-native";

const TAB_BAR_BG = "#FFFFFF";
const ACTIVE_COL = "#6366F1";
const INACTIVE   = "#94A3B8";
const BORDER_COL = "#EEF2F6";

function TabIcon({ icon, activeIcon, label, focused }: {
  icon: React.ReactNode; activeIcon: React.ReactNode; label: string; focused: boolean;
}) {
  if (focused) {
    return (
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 7,
        backgroundColor: ACTIVE_COL, borderRadius: 22,
        paddingHorizontal: 18, paddingVertical: 10,
      }}>
        {activeIcon}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={{ alignItems: "center", gap: 3, paddingTop: 4 }}>
      {icon}
      <Text style={{ fontSize: 11, fontWeight: "500", color: INACTIVE }}>{label}</Text>
    </View>
  );
}

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
