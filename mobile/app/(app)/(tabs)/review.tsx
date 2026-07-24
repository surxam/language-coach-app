import { useCallback, useState } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, Pressable,
  SafeAreaView, StatusBar,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProfileMenu } from "@/components/profile-menu";
import {
  UtensilsCrossed, Clock, Check, AlertCircle, Volume2, Menu,
} from "lucide-react-native";

const BG      = "#F8F5F7";
const CARD    = "#FFFFFF";
const BRAND   = "#5B55F6";
const BRAND_D = "#4F46E5";
const TEXT    = "#1E1B22";
const MUTED   = "#8A8690";
const SUCCESS = "#22C55E";
const ERR_RED = "#EF4444";
const ERR_BG  = "#F8FAFC";

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conv, setConv] = useState<api.Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const { conversations } = await api.listConversations();
        const last = conversations.find((c) => c.correction) ?? null;
        setConv(last);
      } catch {} finally { setLoading(false); }
    })();
  }, []));

  const cor = conv?.correction;
  const fb = cor?.feedback;
  const score = cor?.score ?? null;
  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 54, paddingBottom: 6,
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

        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
              Votre discussion sur le thème "{fb?.theme ?? "Session"}" est terminée. Vous avez fait
              preuve d'une excellente fluidité.
            </Text>
          </View>

          {conv ? (
            <View style={{ marginTop: 22, gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
                borderRadius: 16, padding: 14, shadowColor: "#0F172A", shadowOpacity: 0.05,
                shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EEF2FF",
                  alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <UtensilsCrossed size={19} color={BRAND} />
                </View>
                <View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>Thème</Text>
                  <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                    {fb?.theme ?? "—"}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
                borderRadius: 16, padding: 14, shadowColor: "#0F172A", shadowOpacity: 0.05,
                shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EEF2FF",
                  alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <Clock size={19} color={BRAND} />
                </View>
                <View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>Durée</Text>
                  <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                    {conv.durationMin ?? "—"} min
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD,
                borderRadius: 16, padding: 14, shadowColor: "#0F172A", shadowOpacity: 0.05,
                shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EEF2FF",
                  alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <Volume2 size={19} color={BRAND} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <View>
                    <Text style={{ color: MUTED, fontSize: 11 }}>Prononciation</Text>
                    <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                      {score != null ? score.toFixed(1) : "—"}/10
                    </Text>
                  </View>
                  {score != null && <Check size={20} color={SUCCESS} strokeWidth={2.8} />}
                </View>
              </View>

              {!!fb?.errors?.length && (
                <View style={{ marginTop: 22 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <AlertCircle size={15} color={ERR_RED} />
                    <Text style={{ color: ERR_RED, fontSize: 13, fontWeight: "800",
                      letterSpacing: 0.4, textTransform: "uppercase" }}>
                      Erreurs clés corrigées
                    </Text>
                  </View>
                  {fb.errors.map((error, index) => (
                    <View key={index} style={{
                      backgroundColor: ERR_BG, borderRadius: 14, padding: 14,
                      marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap",
                    }}>
                      <Text style={{ color: "#94A3B8", fontSize: 13, textDecorationLine: "line-through" }}>
                        "{error.wrong}"
                      </Text>
                      <Text style={{ color: MUTED, fontSize: 13 }}>→</Text>
                      <Text style={{ color: BRAND, fontSize: 13, fontWeight: "700" }}>
                        "{error.right}"
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 26, alignItems: "center" }}>
              <Text style={{ color: TEXT, fontSize: 17, fontWeight: "700", textAlign: "center" }}>
                Pas encore de correction disponible.
              </Text>
              <Text style={{ color: MUTED, fontSize: 14, textAlign: "center", marginTop: 8 }}>
                Lancez une session depuis l'onglet Pratique pour voir votre résumé ici.
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => router.replace("/")}
            style={{
              backgroundColor: BRAND,
              borderRadius: 16, height: 56, marginTop: 24,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Réessayer</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/history")} style={{ marginTop: 18, alignItems: "center" }}>
            <Text style={{ color: MUTED, fontSize: 13, textDecorationLine: "underline" }}>
              voir l'historique
            </Text>
          </Pressable>
        </ScrollView>

        <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </View>
  );
}

  