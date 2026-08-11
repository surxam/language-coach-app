import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Mic, StopCircle, Menu, Award } from "lucide-react-native";
import * as api from "@/lib/api";
import { usePushToTalk } from "@/lib/use-push-to-talk";
import { useAuth } from "@/lib/auth-context";
import { ProfileMenu } from "@/components/profile-menu";

const BG = "#FDF9FC";
const BRAND = "#5B55F6";
const RED = "#E62C31";
const TEXT = "#252329";
const MUTED = "#89858C";

const PHASE_LABEL: Record<string, string> = {
  idle: "Maintenez pour discuter",
  recording: "Parlez maintenant…",
  thinking: "Votre coach réfléchit…",
  speaking: "Votre coach parle…",
};

const PHASE_SUB: Record<string, string> = {
  idle: "Lâchez pour envoyer votre message",
  recording: "Relâchez quand vous avez terminé",
  thinking: "L'IA analyse votre réponse…",
  speaking: "Appuyez pour interrompre",
};

export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress] = useState(80);
  const creatingRef = useRef(false);

  const {
    phase,
    lastAiText,
    history,
    startRecording,
    stopRecordingAndRespond,
    cancelSpeaking,
    resetHistory,
  } = usePushToTalk(conversationId);

  const ensureConversation = useCallback(async (): Promise<number | null> => {
    if (conversationId) return conversationId;
    if (creatingRef.current) return null;
    creatingRef.current = true;
    try {
      const { conversation } = await api.startConversation();
      setConversationId(conversation.id);
      return conversation.id;
    } catch {
      Alert.alert("Erreur", "Impossible de démarrer une conversation.");
      return null;
    } finally {
      creatingRef.current = false;
    }
  }, [conversationId]);

  const onPressIn = async () => {
    if (phase === "speaking") {
      cancelSpeaking();
      return;
    }
    if (phase !== "idle") return;

    const id = await ensureConversation();
    if (id) await startRecording(id);
  };

  const onPressOut = async () => {
    if (phase === "recording") await stopRecordingAndRespond();
  };

  const onStop = async () => {
    if (!conversationId) {
      router.replace("/session-ended");
      return;
    }

    setEnding(true);
    try {
      await api.endConversation(conversationId, history);
      const savedId = conversationId;
      setConversationId(null);
      resetHistory();
      router.replace({ pathname: "/session-ended", params: { id: String(savedId) } });
    } catch {
      Alert.alert("Erreur", "Impossible de terminer la discussion.");
    } finally {
      setEnding(false);
    }
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isRecording = phase === "recording";
  const isBusy = phase === "thinking";

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={{ flex: 1, paddingBottom: 18 }}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingTop: 54,
            }}
          >
            <Pressable hitSlop={10} onPress={() => setMenuOpen(true)}>
              <Menu size={23} color={TEXT} strokeWidth={2.8} />
            </Pressable>

            <Text style={{ color: BRAND, fontSize: 28, fontWeight: "800", letterSpacing: -1 }}>
              LinguistFlow
            </Text>

            <Pressable
              onPress={() => setMenuOpen(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#D9D4CF",
                borderWidth: 2,
                borderColor: "#262329",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#262329", fontSize: 13, fontWeight: "800" }}>{initials}</Text>
            </Pressable>
          </View>

          {/* Titre et sous-titre */} 
          <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 14 }}>
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: TEXT, fontSize: 29, fontWeight: "800", letterSpacing: -0.7 }}>
                {PHASE_LABEL[phase]}
              </Text>
              <Text style={{ color: MUTED, fontSize: 17, marginTop: 8 }}>
                {PHASE_SUB[phase]}
              </Text>
            </View>

             {/* Bouton rouge micro */} 
            <View style={{ alignItems: "center", marginTop: 50, marginBottom: 15 }}>
              <View
              onStartShouldSetResponder={() => true}
                onResponderGrant={onPressIn}
                onResponderRelease={onPressOut}
                onResponderTerminate={onPressOut}
                style={{
                  width: 250,
                  height: 250,
                  borderRadius: 180,
                  backgroundColor: "#E62C31",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 999,
                  elevation: 20,

                  shadowColor: RED,
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },

                  opacity: isBusy ? 0.45 : 1,
                  transform: [{ scale: phase === "recording" ? 1.05 : 1 }],
                }}
              >
                <Mic size={70} color="white" />
              </View>
            </View>

            {/* sous titre de la réponse ia */}
            <View
              style={{
                width: "100%",
                minHeight: 90,
                marginTop: 24,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: phase === "thinking" ? MUTED : TEXT,
                  textAlign: "center",
                  lineHeight: 28,
                }}
              >
                {phase === "thinking"
                  ? "En Attente..."
                  : lastAiText ?? "La réponse de votre coach apparaîtra ici."}
              </Text>
            </View>
              
            {/* bouton finaliser*/}
            <Pressable
              onPress={onStop}
              disabled={ending}
              style={{
                width: "100%",
                height: 68,
                marginTop: 24,
                marginBottom: 18,
                borderRadius: 15,
                borderWidth: 1.5,
                borderColor: "#D4CFD5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: ending ? 0.55 : 1,
              }}
            >
              <StopCircle size={20} color="#5D5960" strokeWidth={2.2} />
              <Text style={{ color: "#5D5960", fontSize: 17, fontWeight: "500" }}>
                {ending ? "Finalisation..." : "Arrêter la discussion"}
              </Text>
            </Pressable>
          </View>
        </View>

        <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </View>
  );
}
