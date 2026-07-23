import { Modal, View, Text, Pressable, Image } from "react-native";
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
        style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(20,18,24,0.4)" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "68%", backgroundColor: "#FCFAFB",
            paddingTop: 56, paddingHorizontal: 20, paddingBottom: 32,
          }}
        >
          {/* Ligne profil : avatar + nom/niveau/streak */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 30 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
              borderWidth: 2, borderColor: BRAND,
            }}>
              <Text style={{ color: BRAND, fontSize: 15, fontWeight: "800" }}>{initials}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={{ color: TEXT, fontSize: 15, fontWeight: "800" }}>
                {user?.name || "Utilisateur"}
              </Text>
              <Text style={{ color: MUTED, fontSize: 13, marginTop: 1 }}>
                B2 - Upper Intermediate
              </Text>
              <View style={{
                alignSelf: "flex-start", marginTop: 6,
                backgroundColor: "#DCFCE7", borderRadius: 20,
                paddingHorizontal: 10, paddingVertical: 3,
              }}>
                <Text style={{ color: SUCCESS, fontSize: 11, fontWeight: "700" }}>
                  12 Day Streak
                </Text>
              </View>
            </View>
          </View>
          {/* Navigation */}
          <View style={{ gap: 22 }}>
            <Pressable onPress={() => go("/")}
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center", gap: 12,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Award size={19} color={TEXT} strokeWidth={1.8} />
              <Text style={{ color: TEXT, fontSize: 15, fontWeight: "500" }}>Pratique</Text>
            </Pressable>

            <Pressable onPress={() => go("/history")}
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center", gap: 12,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Bookmark size={19} color={TEXT} strokeWidth={1.8} />
              <Text style={{ color: TEXT, fontSize: 15, fontWeight: "500" }}>Historique</Text>
            </Pressable>
          </View>

          {/* Déconnexion */}
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable onPress={onLogout}
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center", gap: 9,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <LogOut size={17} color={RED} strokeWidth={1.8} />
              <Text style={{ color: RED, fontSize: 14, fontWeight: "500" }}>Deconnexion</Text>
            </Pressable>
          </View>
        </Pressable>
        <View style={{ flex: 1 }} />
      </Pressable>
    </Modal>
  );
}
