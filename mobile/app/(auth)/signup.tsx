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
  Mail,
  User,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
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

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible. Réessayez.");
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

              <Text
                style={{
                  fontSize: 40,
                  fontWeight: "800",
                  color: TEXT,
                  letterSpacing: -1,
                  textAlign: "center",
                }}
              >
                Créer un compte
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: MUTED,
                  marginTop: 6,
                  marginBottom: 18,
                  textAlign: "center",
                }}
              >
                Commencez votre voyage linguistique.
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
            Nom complet
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
            <User size={17} color={LABEL} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Votre nom complet"
              placeholderTextColor="#A8A8B3"
              autoCapitalize="words"
              autoComplete="name"
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
            E-mail
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
            <Mail size={17} color={LABEL} />
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
              placeholder="Au moins 6 caractères"
              placeholderTextColor="#A8A8B3"
              secureTextEntry={!showPwd}
              autoComplete="new-password"
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: TEXT }}
            />
            <Pressable onPress={() => setShowPwd(!showPwd)} hitSlop={8}>
              {showPwd ? <EyeOff size={18} color={LABEL} /> : <Eye size={18} color={LABEL} />}
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
            <UserPlus size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              {loading ? "Création…" : "Créer mon compte"}
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
            <Text style={{ color: MUTED, fontSize: 14 }}>Déjà un compte ?</Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={{ color: BRAND, fontSize: 14, fontWeight: "700" }}>Se connecter</Text>
              </Pressable>
            </Link>
          </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
