import { Modal, View, Text, Pressable, Image, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Award, Bookmark, LogOut } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const BRAND   = "#5B55F6";
const SUCCESS = "#22C55E";
const TEXT    = "#1E1B22";
const MUTED   = "#8A8690";
const RED     = "#EF4444";

export function ProfileMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = (user?.name || "U")
    .split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  const go = (path: string) => { onClose(); router.push(path as any); };
  const onLogout = async () => { onClose(); await logout(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, flexDirection: "row" }}
        onPress={onClose}
      >
        {Platform.OS === "web" ? (
          // Sur web, expo-blur ne fonctionne pas : on utilise le flou CSS natif du navigateur.
          <View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(20,18,24,0.25)",
              // @ts-ignore - propriétés CSS web transmises telles quelles par react-native-web
              backdropFilter: "blur(12px)",
              
            }}
          />
        ) : (
          <BlurView
            intensity={20}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(20,18,24,0.1)",
            }}
          />
        )}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "68%", backgroundColor: "#FCFAFB",
            paddingTop: 30, paddingHorizontal: 40, paddingBottom: 32,
          }}
        >
          {/* Ligne profil : avatar + nom/niveau/streak */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom:45 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
              borderWidth: 2, borderColor: BRAND,
            }}>
              <Text style={{ color: BRAND, fontSize: 17, fontWeight: "800" }}>{initials}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={{ color: TEXT, fontSize: 17, fontWeight: "800" }}>
                {user?.name || "Utilisateur"}
              </Text>
              
              
            </View>
          </View>
          {/* Navigation */}
          <View style={{ gap: 30 }}>
            <Pressable onPress={() => go("/")}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Award size={24} color={TEXT} strokeWidth={1.8} />
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: "500" }}>Pratique</Text>
            </Pressable>

            <Pressable onPress={() => go("/history")}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Bookmark size={24} color={TEXT} strokeWidth={1.8} />
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: "500" }}>Historique</Text>
            </Pressable>
          </View>

          {/* Déconnexion */}
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable onPress={onLogout}
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <LogOut size={20} color={RED} strokeWidth={2.5} />
              <Text style={{ color: RED, fontSize: 19, fontWeight: "500" }}>Deconnexion</Text>
            </Pressable>
          </View>
        </Pressable>
        <View style={{ flex: 1 }} />
      </Pressable>
    </Modal>
  );
}
