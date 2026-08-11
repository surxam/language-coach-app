import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Speech from "expo-speech";
import * as api from "./api";
import type { HistoryEntry } from "./api";

export type TalkPhase = "idle" | "recording" | "thinking" | "speaking";

// ─── Hook push-to-talk ────────────────────────────────────────
//
// Cycle complet d'une interaction :
//   appui maintenu  → enregistrement micro  (expo-audio)
//   relâchement     → transcription + réponse Groq via backend
//   réponse reçue   → lecture TTS (expo-speech)
//
// Garde en mémoire l'historique complet des échanges de la session
// sous forme [{role, content}] et le passe au backend à chaque tour.
// Cet historique est aussi retourné au composant parent pour être
// envoyé au endpoint /end lors de la clôture de la conversation.

export function usePushToTalk(conversationId: number | null) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [phase, setPhaseState] = useState<TalkPhase>("idle");
  const phaseRef = useRef<TalkPhase>("idle");

  const setPhase = useCallback((newPhase: TalkPhase) => {
    phaseRef.current = newPhase;
    setPhaseState(newPhase);
  }, []);

  const [lastAiText, setLastAiText] = useState<string | null>(null);

  // Historique accumulé pendant toute la session.
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const permissionRequested = useRef(false);
  // Verrou synchrone anti double-déclenchement (ex : Pressable qui émet
  // onPressOut deux fois avant que le state React n'ait été mis à jour).
  const stoppingRef = useRef(false);
  const startingRef = useRef(false);

  // Demande d'accès micro une seule fois au montage.
  useEffect(() => {
    (async () => {
      if (permissionRequested.current) return;
      permissionRequested.current = true;
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          "Micro indisponible",
          "L'accès au microphone est nécessaire pour discuter avec votre coach IA."
        );
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  const startRecording = useCallback(async (id?: number) => {
     const currentConversationId = id ?? conversationId;
    if (!currentConversationId || phaseRef.current !== "idle") return;
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      // Repasse la session audio en mode "enregistrement" avant de démarrer :
      // elle a pu être basculée en lecture seule après la réponse précédente.
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setPhase("recording");
    } catch (err) {
      console.error("startRecording error:", err);
      Alert.alert("Erreur", "Impossible de démarrer l'enregistrement.");
    } finally {
      startingRef.current = false;
    }
  }, [audioRecorder, conversationId, phase]);

  const stopRecordingAndRespond = useCallback(async () => {
    if (!conversationId || phaseRef.current  !== "recording") return;
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setPhase("thinking");

      if (!uri) throw new Error("Aucun enregistrement disponible.");

      // Envoie l'audio + tout l'historique existant au backend.
      const { userText, aiText } = await api.respondToAudio(
        conversationId,
        uri,
        history  // ← historique complet des tours précédents
      );

      // Met à jour l'historique local avec ce tour.
      setHistory((prev) => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: aiText },
      ]);

      setLastAiText(aiText);
      setPhase("speaking");

      // Bascule la session audio en lecture seule avant de parler :
      // évite les micro-coupures dues au partage de session avec l'enregistrement.
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

      Speech.speak(aiText, {
        language: "en-US",
        rate: 0.92,
        onDone: () => setPhase("idle"),
        onStopped: () => setPhase("idle"),
        onError: () => setPhase("idle"),
      });
    } catch (err) {
      console.error("stopRecordingAndRespond error:", err);
      Alert.alert("Erreur", "Impossible d'obtenir une réponse. Réessayez.");
      setPhase("idle");
    } finally {
      stoppingRef.current = false;
    }
  }, [audioRecorder, conversationId, phase, history]);

  const cancelSpeaking = useCallback(() => {
    Speech.stop();
    setPhase("idle");
  }, []);

  const resetHistory = useCallback(() => {
    setHistory([]);
    setLastAiText(null);
    setPhase("idle");
  }, []);

  return {
    phase,
    isRecording: recorderState.isRecording,
    lastAiText,
    history,      // ← exposé pour que HomeScreen l'envoie à /end
    startRecording,
    stopRecordingAndRespond,
    cancelSpeaking,
    resetHistory,
  };
}
