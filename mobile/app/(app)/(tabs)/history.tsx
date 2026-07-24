import { useCallback, useState } from "react";
import {
  View, Text, ScrollView, Pressable, Alert,
  ActivityIndicator, SafeAreaView, StatusBar,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Trash2, UtensilsCrossed, Plane, Briefcase, HeartPulse, Clock, Menu,
} from "lucide-react-native";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProfileMenu } from "@/components/profile-menu";

const BG      = "#F8F5F7";
const CARD    = "#FFFFFF";
const BRAND   = "#5B55F6";
const TEXT    = "#1E1B22";
const MUTED   = "#8A8690";
const GREEN   = "#22C55E";
const RED     = "#EF4444";

function scoreColor(score: number) {
  return score >= 8.7 ? GREEN : BRAND;
}

function themeStyle(theme: string) {
  const t = theme.toLowerCase();
  if (t.includes("restaurant") || t.includes("food"))
    return { bg: "#4ADE80", icon: <UtensilsCrossed size={17} color="#fff" /> };
  if (t.includes("travel") || t.includes("voyage"))
    return { bg: "#5B55F6", icon: <Plane size={17} color="#fff" /> };
  if (t.includes("work") || t.includes("travail"))
    return { bg: "#1E1B22", icon: <Briefcase size={17} color="#fff" /> };
  if (t.includes("health") || t.includes("santé"))
    return { bg: "#F87171", icon: <HeartPulse size={17} color="#fff" /> };
  return { bg: "#4ADE80", icon: <UtensilsCrossed size={17} color="#fff" /> };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today)) return "AUJOURD'HUI";
  if (same(d, yesterday)) return "HIER";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toUpperCase();
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<api.Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { conversations: list } = await api.listConversations();
      setConversations(list.filter(c => c.correction));
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = useCallback((conv: api.Conversation) => {
    const theme = conv.correction?.feedback?.theme ?? "cette session";
    Alert.alert(
      "Supprimer la conversation",
      `Voulez-vous vraiment supprimer "${theme}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeletingId(conv.id);
            // Suppression optimiste : on retire tout de suite la carte de la liste.
            const previous = conversations;
            setConversations((prev) => prev.filter((c) => c.id !== conv.id));
            try {
              await api.deleteConversation(conv.id);
            } catch {
              // En cas d'échec, on remet la conversation dans la liste.
              setConversations(previous);
              Alert.alert("Erreur", "Impossible de supprimer cette conversation.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, [conversations]);

  const avg = conversations.length
    ? (conversations.reduce((s, c) => s + (c.correction?.score ?? 0), 0) / conversations.length).toFixed(1)
    : "—";

  const groups: { label: string; items: api.Conversation[] }[] = [];
  conversations.forEach(conv => {
    const lbl = dayLabel(conv.startedAt);
    const grp = groups.find(g => g.label === lbl);
    if (grp) grp.items.push(conv); else groups.push({ label: lbl, items: [conv] });
  });

  const initials = (user?.name || "U").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header : identique à index.tsx (menu à gauche, logo au centre, avatar à droite) */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 54, paddingBottom: 6,
        }}>
          <Pressable hitSlop={10} onPress={() => setMenuOpen(true)}>
            <Menu size={23} color={TEXT} strokeWidth={2.4} />
          </Pressable>
          <Text style={{ color: BRAND, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 }}>
            LinguistFlow
          </Text>
          <Pressable onPress={() => setMenuOpen(true)} style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: "#EEF2FF", borderWidth: 2, borderColor: BRAND,
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ color: BRAND, fontSize: 13, fontWeight: "800" }}>{initials}</Text>
          </Pressable>
        </View>

        {/* Titre */}
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
          <Text style={{ color: TEXT, fontSize: 23, fontWeight: "800" }}>Historique des sessions</Text>
          <Text style={{ color: MUTED, fontSize: 13, marginTop: 6, lineHeight: 18 }}>
            Retrouvez et gérez vos conversations passées pour suivre vos progrès.
          </Text>
        </View>

        {conversations.length > 0 && (
          <View style={{ flexDirection: "row", gap: 12, marginHorizontal: 20, marginBottom: 20 }}>
            <View style={{
              flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16,
              shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}>
              <Text style={{ color: GREEN, fontSize: 11, fontWeight: "800",
                letterSpacing: 0.6, marginBottom: 6 }}>
                MOYENNE
              </Text>
              <Text style={{ color: TEXT, fontSize: 24, fontWeight: "800" }}>
                {avg}<Text style={{ color: MUTED, fontSize: 13, fontWeight: "600" }}>/10</Text>
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: "#E5E1FA", borderRadius: 16, padding: 16,
            }}>
              <Text style={{ color: BRAND, fontSize: 11, fontWeight: "800",
                letterSpacing: 0.6, marginBottom: 6 }}>
                SESSIONS
              </Text>
              <Text style={{ color: BRAND, fontSize: 24, fontWeight: "800" }}>
                {conversations.length}
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={BRAND} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <Text style={{ color: TEXT, fontSize: 17, fontWeight: "700", textAlign: "center" }}>
              Pas encore de sessions
            </Text>
            <Text style={{ color: MUTED, fontSize: 14, textAlign: "center", marginTop: 8 }}>
              Démarrez une conversation dans l'onglet Practice !
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}>
            {groups.map(group => (
              <View key={group.label} style={{ marginBottom: 18 }}>
                <Text style={{ color: MUTED, fontSize: 11, fontWeight: "800",
                  letterSpacing: 0.8, marginBottom: 10 }}>
                  {group.label}
                </Text>
                <View style={{ gap: 10 }}>
                  {group.items.map(conv => {
                    const score = conv.correction?.score ?? 0;
                    const theme = conv.correction?.feedback?.theme ?? "Session";
                    const ts = themeStyle(theme);
                    return (
                      <Pressable
                        key={conv.id}
                        onPress={() => router.push(`/conversation/${conv.id}`)}
                        style={{
                          backgroundColor: CARD, borderRadius: 16, padding: 14,
                          flexDirection: "row", alignItems: "center",
                          shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 8,
                          shadowOffset: { width: 0, height: 3 },
                        }}
                      >
                        <View style={{
                          width: 40, height: 40, borderRadius: 12, backgroundColor: ts.bg,
                          alignItems: "center", justifyContent: "center", marginRight: 14,
                        }}>
                          {ts.icon}
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ color: TEXT, fontSize: 15, fontWeight: "700" }}>{theme}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
                            <Clock size={11} color={MUTED} />
                            <Text style={{ color: MUTED, fontSize: 12 }}>
                              {formatTime(conv.startedAt)}{conv.durationMin ? `  ${conv.durationMin} min` : ""}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: "flex-end", marginRight: 12 }}>
                          <Text style={{ fontSize: 14, fontWeight: "800", color: scoreColor(score) }}>
                            {score.toFixed(1)}/10
                          </Text>
                          <Text style={{ color: MUTED, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 }}>
                            SCORE
                          </Text>
                        </View>

                        <Pressable
                          hitSlop={10}
                          disabled={deletingId === conv.id}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDelete(conv);
                          }}
                        >
                          {deletingId === conv.id
                            ? <ActivityIndicator size="small" color={RED} />
                            : <Trash2 size={17} color={RED} />}
                        </Pressable>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </View>
  );
}
