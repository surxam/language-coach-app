import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Trash2, Clock } from "lucide-react-native";
import { getThemeStyle } from "@/lib/theme-icon";
import type * as api from "@/lib/api";

const CARD  = "#FFFFFF";
const BRAND = "#5B55F6";
const TEXT  = "#1E1B22";
const MUTED = "#8A8690";
const GREEN = "#22C55E";
const RED   = "#EF4444";

function scoreColor(score: number) {
  return score >= 8.7 ? GREEN : BRAND;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
type ConversationCardProps = {
  conversation: api.Conversation;
  onPress: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

/**
 * Carte d'une conversation dans la liste de l'historique.
 * Extrait de app/(app)/(tabs)/history.tsx pour être réutilisable/testable isolément.
 */
export function ConversationCard({ conversation, onPress, onDelete, deleting = false }: ConversationCardProps) {
  const score = conversation.correction?.score ?? 0;
  const theme = conversation.correction?.feedback?.theme ?? "Session";
  const ts = getThemeStyle(theme);

  return (
    <Pressable
      onPress={onPress}
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
        <ts.Icon size={19} color={ts.color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: TEXT, fontSize: 15, fontWeight: "700" }}>{theme}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
          <Clock size={11} color={MUTED} />
          <Text style={{ color: MUTED, fontSize: 12 }}>
            {formatTime(conversation.startedAt)}
            {conversation.durationMin ? `  ${conversation.durationMin} min` : ""}
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
        disabled={deleting}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        {deleting
          ? <ActivityIndicator size="small" color={RED} />
          : <Trash2 size={17} color={RED} />}
      </Pressable>
    </Pressable>
  );
}
