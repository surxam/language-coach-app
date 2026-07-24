import { useEffect, useState } from "react";
import {
  View, Text, Pressable, ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check, RefreshCw, Menu, UtensilsCrossed, Clock, Users, AlertTriangle,
  Mic, BookOpen, History,
} from "lucide-react-native";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProfileMenu } from "@/components/profile-menu";

const BG      = "#F8F5F7";
const CARD    = "#FFFFFF";
const BRAND   = "#5B55F6";
const BRAND_D = "#4F46E5";
const TEXT    = "#1E1B22";
const MUTED   = "#8A8690";
const SUCCESS = "#22C55E";
const ERR_RED = "#EF4444";
const ERR_BG  = "#F8FAFC";
const INACTIVE = "#94A3B8";
const NAV_BORDER = "#EEF2F6";

function NavItem({ icon, label, active, onPress }: {
  icon: React.ReactNode; label: string; active: boolean; onPress: () => void;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={{
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        backgroundColor: BRAND, borderRadius: 22, marginHorizontal: 6, paddingVertical: 10,
      }}>
        {icon}
        <Text numberOfLines={1} allowFontScaling={false}
          style={{ fontSize: 12, fontWeight: "700", color: "#fff", flexShrink: 1 }}>
          {label}
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", gap: 3, paddingTop: 4 }}>
      {icon}
      <Text numberOfLines={1} allowFontScaling={false}
        style={{ fontSize: 11, fontWeight: "500", color: INACTIVE }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SessionEndedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [conv, setConv] = useState<api.Conversation | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const { conversation } = await api.getConversation(Number(id));
        setConv(conversation);
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  const fb    = conv?.correction?.feedback;
  const score = conv?.correction?.score ?? null;
  const initials = (user?.name || "U").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6,
        }}>
          <Pressable hitSlop={10} onPress={() => setMenuOpen(true)}><Menu size={23} color={TEXT} strokeWidth={2.4} /></Pressable>
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

        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Icône succès + badge niveau */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View style={{
              width: 88, height: 88, borderRadius: 44, backgroundColor: SUCCESS,
              alignItems: "center", justifyContent: "center",
              shadowColor: SUCCESS, shadowOpacity: 0.4, shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 }, elevation: 8, marginBottom: 14,
            }}>
              <Check size={40} color="#fff" strokeWidth={3} />
            </View>
            <View style={{
              backgroundColor: "#DCFCE7", borderRadius: 20,
              paddingHorizontal: 14, paddingVertical: 5, marginBottom: 14,
            }}>
              <Text style={{ color: SUCCESS, fontSize: 12, fontWeight: "700" }}>
                Niveau B2 atteint !
              </Text>
            </View>
            <Text style={{ color: TEXT, fontSize: 25, fontWeight: "800", textAlign: "center" }}>
              Beaux travail !
            </Text>
            <Text style={{ color: MUTED, fontSize: 14, textAlign: "center", marginTop: 8,
              lineHeight: 20, paddingHorizontal: 6 }}>
              Votre discussion sur le thème "{fb?.theme ?? "Session"}" est terminée. Vous avez
              fait preuve d'une excellente fluidité.
            </Text>
          </View>

          {/* Cartes détail session */}
          <View style={{ marginTop: 22, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
              borderRadius: 16, padding: 16, shadowColor: "#0F172A", shadowOpacity: 0.05,
              shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <UtensilsCrossed size={20} color={BRAND} style={{ marginRight: 14 }} />
              <View>
                <Text style={{ color: MUTED, fontSize: 11 }}>Thème</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                  {fb?.theme ?? "—"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
              borderRadius: 16, padding: 16, shadowColor: "#0F172A", shadowOpacity: 0.05,
              shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <Clock size={20} color={TEXT} style={{ marginRight: 14 }} />
              <View>
                <Text style={{ color: MUTED, fontSize: 11 }}>Durée</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                  {conv?.durationMin ?? "—"} min
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
              borderRadius: 16, padding: 16, shadowColor: "#0F172A", shadowOpacity: 0.05,
              shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <Users size={20} color={TEXT} style={{ marginRight: 14 }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>Prononciation</Text>
                  <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                    {score != null ? score.toFixed(1) : "—"}/10
                  </Text>
                </View>
                {score != null && <Check size={16} color={SUCCESS} strokeWidth={3} />}
              </View>
            </View>
          </View>

          {/* Erreurs corrigées */}
          {!!fb?.errors?.length && (
            <View style={{ marginTop: 22 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={15} color={ERR_RED} />
                <Text style={{ color: ERR_RED, fontSize: 13, fontWeight: "800",
                  letterSpacing: 0.4, textTransform: "uppercase" }}>
                  Erreurs clés corrigées
                </Text>
              </View>
              {fb.errors.map((e, i) => (
                <View key={i} style={{
                  backgroundColor: ERR_BG, borderRadius: 14, padding: 14,
                  marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap",
                }}>
                  <Text style={{ color: "#94A3B8", fontSize: 13, textDecorationLine: "line-through" }}>
                    "{e.wrong}"
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 13 }}>→</Text>
                  <Text style={{ color: BRAND, fontSize: 13, fontWeight: "700" }}>
                    "{e.right}"
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Bouton réessayer */}
          <Pressable
            onPress={() => router.replace("/")}
            style={{
              backgroundColor: BRAND,
              borderRadius: 16, height: 56, marginTop: 24,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <RefreshCw size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Réessayer</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/history")} style={{ marginTop: 18, alignItems: "center" }}>
            <Text style={{ color: MUTED, fontSize: 13, textDecorationLine: "underline" }}>
              voir l'historique
            </Text>
          </Pressable>
        </ScrollView>

        {/* Barre de navigation basse (Review actif, comme sur la maquette) */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-around",
          backgroundColor: CARD, borderTopWidth: 1, borderTopColor: NAV_BORDER,
          height: 78, paddingTop: 12, paddingBottom: 14,
        }}>
          <NavItem
            label="Practice" active={false}
            icon={<Mic size={20} color={INACTIVE} />}
            onPress={() => router.replace("/")}
          />
          <NavItem
            label="Review" active={true}
            icon={<BookOpen size={18} color="#fff" />}
            onPress={() => router.replace("/review")}
          />
          <NavItem
            label="History" active={false}
            icon={<History size={20} color={INACTIVE} />}
            onPress={() => router.replace("/history")}
          />
        </View>

        <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </View>
  );
}
