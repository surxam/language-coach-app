import { View, Text } from "react-native";
import type * as api from "@/lib/api";
import { ConversationCard } from "@/components/conversation-card";

const MUTED = "#8A8690";

type ConversationGroupProps = {
  label: string;
  conversations: api.Conversation[];
  onPressItem: (conv: api.Conversation) => void;
  onDeleteItem: (conv: api.Conversation) => void;
  deletingId?: number | null;
};

/**
 * Regroupe les conversations d'un même jour sous un label ("AUJOURD'HUI", "HIER"...).
 * Extrait de app/(app)/(tabs)/history.tsx pour être réutilisable/testable isolément.
 */
export function ConversationGroup({
  label, conversations, onPressItem, onDeleteItem, deletingId,
}: ConversationGroupProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{
        color: MUTED, fontSize: 11, fontWeight: "800",
        letterSpacing: 0.8, marginBottom: 10,
      }}>
        {label}
      </Text>
      <View style={{ gap: 10 }}>
        {conversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            conversation={conv}
            deleting={deletingId === conv.id}
            onPress={() => onPressItem(conv)}
            onDelete={() => onDeleteItem(conv)}
          />
        ))}
      </View>
    </View>
  );
}
