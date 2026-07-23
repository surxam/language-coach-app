import { useEffect, useState } from "react";
import {
  View, Text, Pressable, ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft, UtensilsCrossed, Clock, Check, AlertCircle, BookOpen, Volume2,
  Calendar, Mic, History,
} from "lucide-react-native";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProfileMenu } from "@/components/profile-menu";

const BG      = "#F8F5F7";
const CARD    = "#FFFFFF";
const BRAND   = "#5B55F6";
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
        flexDirection: "row", alignItems: "center", gap: 7,
        backgroundColor: BRAND, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10,
      }}>
        {icon}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", gap: 3, paddingTop: 4 }}>
      {icon}
      <Text style={{ fontSize: 11, fontWeight: "500", color: INACTIVE }}>{label}</Text>
    </Pressable>
  );
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (same(d, today)) return `Aujourd'hui, ${time}`;
  if (same(d, yesterday)) return `Hier, ${time}`;
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}, ${time}`;
}

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [conv, setConv] = useState<api.Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { conversation } = await api.getConversation(Number(id));
        setConv(conversation);
      } catch (err) {
        setError(err instanceof api.ApiError ? err.message : "Impossible de charger cette conversation.");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const cor = conv?.correction;
  const fb  = cor?.feedback;
  const pct = cor ? Math.round(cor.score * 10) : 0;
  const initials = (user?.name || "U").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  const firstName = (user?.name || "").split(" ")[0] || "Alex";

  // Retour garanti vers l'onglet Historique, même si la pile de navigation
  // ne contient pas d'écran précédent (ex : ouverture via un lien direct).
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/history");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header : flèche retour (garantie vers Historique) + avatar */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 54, paddingBottom: 6,
        }}>
          <Pressable hitSlop={10} onPress={goBack}>
            <ChevronLeft size={26} color={TEXT} strokeWidth={2.4} />
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

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={BRAND} />
          </View>
        ) : error || !conv || !cor || !fb ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
              {error || "Aucune correction disponible pour cette conversation."}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}>
            <Text style={{ color: TEXT, fontSize: 23, fontWeight: "800" }}>
              Excellent travail, {firstName} !
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8,
              alignSelf: "flex-start", backgroundColor: "#F1F0F5", borderRadius: 20,
              paddingHorizontal: 12, paddingVertical: 6, marginTop: 10, marginBottom: 16 }}>
              <Calendar size={13} color={MUTED} />
              <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600" }}>
                {dayLabel(conv.startedAt)}
              </Text>
            </View>

            {/* Carte session */}
            <View style={{ backgroundColor: CARD, borderRadius: 18, padding: 18,
              shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 }, marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: "#EEF2FF",
                  alignItems: "center", justifyContent: "center" }}>
                  <UtensilsCrossed size={17} color={BRAND} />
                </View>
                <View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>Thème de la session</Text>
                  <Text style={{ color: TEXT, fontSize: 17, fontWeight: "700" }}>Le {fb.theme}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 40 }}>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Clock size={12} color={MUTED} />
                    <Text style={{ color: MUTED, fontSize: 11 }}>Durée</Text>
                  </View>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: "700", marginTop: 3 }}>
                    {conv.durationMin ?? "—"} min
                  </Text>
                </View>
                <View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>Score{"\n"}Prononciation</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <Check size={13} color={SUCCESS} strokeWidth={3} />
                    <Text style={{ color: SUCCESS, fontSize: 14, fontWeight: "700" }}>
                      {cor.score.toFixed(1)}/10
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Cercle précision globale */}
            <View style={{ backgroundColor: BRAND, borderRadius: 20, padding: 24,
              alignItems: "center", marginBottom: 14 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 7,
                borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center",
                marginBottom: 12 }}>
                <View style={{ position: "absolute", width: 100, height: 100, borderRadius: 50,
                  borderWidth: 7, borderColor: "#fff", borderRightColor: "transparent",
                  borderBottomColor: "transparent",
                  transform: [{ rotate: `${45 + pct * 1.6}deg` }] }} />
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{pct}%</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Précision globale</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                En progression constante
              </Text>
            </View>

            {/* Erreurs corrigées */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertCircle size={16} color={ERR_RED} />
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: "800" }}>Erreurs corrigées</Text>
              </View>
              {fb.errors.length === 0 ? (
                <Text style={{ color: SUCCESS, fontSize: 14 }}>Aucune erreur — excellent travail !</Text>
              ) : fb.errors.map((e, i) => {
                const note = (e as any).note as string | undefined;
                return (
                  <View key={i} style={{ backgroundColor: ERR_BG, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                    <Text style={{ fontSize: 13 }}>
                      <Text style={{ color: ERR_RED, fontWeight: "700" }}>✕ </Text>
                      <Text style={{ color: "#94A3B8", textDecorationLine: "line-through" }}>"{e.wrong}"</Text>
                    </Text>
                    <Text style={{ color: BRAND, fontSize: 14, fontWeight: "700", marginTop: 3 }}>
                      "{e.right}"
                    </Text>
                    {!!note && (
                      <Text style={{ color: MUTED, fontSize: 12, fontStyle: "italic", marginTop: 4 }}>
                        {note}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Nouveaux mots */}
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <BookOpen size={16} color={SUCCESS} />
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: "800" }}>Nouveaux mots appris</Text>
              </View>
              {fb.newWords.length === 0 ? (
                <Text style={{ color: MUTED, fontSize: 14 }}>Aucun nouveau mot cette session.</Text>
              ) : fb.newWords.map((w, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center",
                  justifyContent: "space-between", paddingVertical: 10 }}>
                  <View>
                    <Text style={{ color: TEXT, fontSize: 15, fontWeight: "700" }}>{w.word}</Text>
                    <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{w.translation}</Text>
                  </View>
                  <Volume2 size={16} color="#C7C3CB" />
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Barre de navigation basse (History actif) */}
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
            label="Review" active={false}
            icon={<BookOpen size={20} color={INACTIVE} />}
            onPress={() => router.replace("/review")}
          />
          <NavItem
            label="History" active={true}
            icon={<History size={18} color="#fff" />}
            onPress={() => router.replace("/history")}
          />
        </View>

        <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </View>
  );
}
