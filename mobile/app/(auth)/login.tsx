import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react-native";

const BG = "#F6F4F7";
const CARD = "#FFFFFF";
const FIELD = "#F1F1F5";
const BRAND = "#6366F1";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const LABEL = "#94A3B8";
const ERR_BG = "#FEF2F2";
const ERR_BD = "#FECACA";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError("Veuillez renseigner votre e-mail et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          <View style={{ width: "100%", maxWidth: 460, alignItems: "center" }}>
            <View style={{ alignItems: "center", transform: [{ translateY: -12 }] }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: BRAND, marginBottom: 12 }}>
                LinguistFlow
              </Text>

              <Text style={{ fontSize: 40, fontWeight: "800", color: TEXT, letterSpacing: -1, textAlign: "center" }}>
                Bienvenue
              </Text>
              <Text style={{ fontSize: 15, color: MUTED, marginTop: 6, marginBottom: 18, textAlign: "center" }}>
                Continuez votre voyage linguistique.
              </Text>
            </View>

            <View
              style={{
                width: "100%",
                backgroundColor: CARD,
                borderRadius: 24,
                padding: 24,
                shadowColor: "#0F172A",
                shadowOpacity: 0.06,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: LABEL,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Utilisateur
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: FIELD,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 52,
                  marginBottom: 18,
                }}
              >
                <UserIcon size={17} color={LABEL} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre_nom@email.com"
                  placeholderTextColor="#A8A8B3"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  style={{ flex: 1, marginLeft: 10, fontSize: 15, color: TEXT }}
                />
              </View>

              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: LABEL,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Mot de passe
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: FIELD,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 52,
                  marginBottom: 16,
                }}
              >
                <Lock size={17} color={LABEL} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#A8A8B3"
                  secureTextEntry={!showPwd}
                  autoComplete="password"
                  style={{ flex: 1, marginLeft: 10, fontSize: 15, color: TEXT }}
                />
                <Pressable onPress={() => setShowPwd(!showPwd)} hitSlop={8}>
                  {showPwd ? <EyeOff size={18} color={LABEL} /> : <Eye size={18} color={LABEL} />}
                </Pressable>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 22,
                }}
              >
                <Pressable
                  onPress={() => setRemember(!remember)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: remember ? BRAND : "#CBD5E1",
                      backgroundColor: remember ? BRAND : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {remember && <Check size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  <Text style={{ fontSize: 13, color: MUTED, flexShrink: 1 }}>Se souvenir de moi</Text>
                </Pressable>

                <Pressable style={{ maxWidth: 140 }}>
                  <Text style={{ fontSize: 13, color: BRAND, fontWeight: "600", textAlign: "right" }}>
                    Mot de passe oublié ?
                  </Text>
                </Pressable>
              </View>

              {error && (
                <View
                  style={{
                    backgroundColor: ERR_BG,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: ERR_BD,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#DC2626" }}>{error}</Text>
                </View>
              )}

              <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  alignSelf: "stretch",
                  backgroundColor: BRAND,
                  borderRadius: 20,
                  minHeight: 64,
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  borderWidth: 2,
                  borderColor: BRAND,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                  shadowColor: BRAND,
                  shadowOpacity: 0.65,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 10,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                  {loading ? "Connexion…" : "Connecter"}
                </Text>
                <ArrowRight size={19} color="#fff" />
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 28,
                gap: 4,
              }}
            >
              <Text style={{ color: MUTED, fontSize: 14 }}>Pas encore de compte ?</Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text style={{ color: BRAND, fontSize: 14, fontWeight: "700" }}>
                    S'inscrire gratuitement
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
