import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter, usePathname } from "expo-router";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { X, LogOut } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

// Sidebar sombre reproduisant la maquette : en-tête "Corrections :",
// liste des conversations passées ("Conversation 1", "Conversation 2"...)
// puis bouton rouge "Deconnexion" en bas.
export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [conversations, setConversations] = useState<api.Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { conversations: list } = await api.listConversations();
      // On ne montre dans l'historique que les conversations terminées
      // (celles qui ont une correction associée).
      setConversations(list.filter((c) => c.correction));
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recharge la liste à chaque fois que le drawer redevient visible,
  // pour refléter une conversation qui vient d'être terminée.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goToConversation = (id: number) => {
    props.navigation.closeDrawer();
    router.push(`/conversation/${id}`);
  };

  const onLogout = async () => {
    props.navigation.closeDrawer();
    await logout();
  };

  return (
    <View className="flex-1 bg-sidebar">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-6">
        <Pressable onPress={() => props.navigation.closeDrawer()} hitSlop={12}>
          <X size={26} color="#fff" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-2.5">
        <View className="mb-1 rounded-xl bg-black/20 px-4 py-3">
          <Text className="text-base font-medium text-white">Corrections :</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" className="mt-4" />
        ) : conversations.length === 0 ? (
          <Text className="px-4 py-3 text-sm text-white/60">
            Vos conversations terminées apparaîtront ici.
          </Text>
        ) : (
          conversations.map((conv, idx) => {
            const active = pathname === `/conversation/${conv.id}`;
            return (
              <Pressable
                key={conv.id}
                onPress={() => goToConversation(conv.id)}
                className={`rounded-xl px-4 py-3 ${active ? "bg-black/30" : "bg-black/10 active:bg-black/25"}`}
              >
                <Text className="text-base text-white">
                  Conversation {conversations.length - idx}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View className="px-4 pb-10 pt-3">
        <Pressable
          onPress={onLogout}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-record py-3.5 active:bg-record-dark"
        >
          <LogOut size={18} color="#fff" />
          <Text className="text-base font-semibold text-white">Deconnexion</Text>
        </Pressable>
      </View>
    </View>
  );
}
