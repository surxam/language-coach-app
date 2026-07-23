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
    if (id) await startRecording();
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

          <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 14 }}>
            <View style={{ alignItems: "center", marginTop: 78 }}>
              <Text style={{ color: TEXT, fontSize: 29, fontWeight: "800", letterSpacing: -0.7 }}>
                {PHASE_LABEL[phase]}
              </Text>
              <Text style={{ color: MUTED, fontSize: 17, marginTop: 8 }}>
                {PHASE_SUB[phase]}
              </Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 40, marginBottom: 22 }}>
              <Pressable 
               onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isBusy}
                style={{
                  width: 250,
                  height: 250,
                  borderRadius: 180,
                  backgroundColor: "#E62C31",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  zIndex: 999,
                  elevation: 20,

                  // Ombre
                  shadowColor: RED,
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },

                  opacity: isBusy ? 0.45 : 1,
                  transform: [{ scale: 0.5? 0.96 : 1 }],
                              }}
              >
                <Mic size={70} color="white" />
              </Pressable>
            </View>

            <View style={{ flex: 1 }} />

            <View
              style={{
                width: "100%",
                borderRadius: 18,
                backgroundColor: "#FAF8F9",
                padding: 16,
                shadowColor: "#6D6570",
                shadowOpacity: 0.06,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: "#64F1C3",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Award size={23} color="#252329" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: TEXT, fontSize: 17, fontWeight: "500" }}>Progression quotidienne</Text>
                    <Text style={{ color: BRAND, fontSize: 17, fontWeight: "600" }}>{progress}%</Text>
                  </View>
                  <View style={{ height: 8, marginTop: 8, backgroundColor: "#E5E1E5", borderRadius: 999, overflow: "hidden" }}>
                    <View style={{ width: `${progress}%`, height: "100%", borderRadius: 999, backgroundColor: BRAND }} />
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={onStop}
              disabled={ending}
              style={({ pressed }) => ({
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
                opacity: ending ? 0.55 : pressed ? 0.7 : 1,
              })}
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
