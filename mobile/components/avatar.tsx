import { View, Text } from "react-native";

export function getInitials(name?: string) {
  return (name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type AvatarProps = {
  name?: string;
  size?: number;
  bg?: string;
  borderColor?: string;
  textColor?: string;
};

export function Avatar({
  name,
  size = 40,
  bg = "#EEF2FF",
  borderColor = "#5B55F6",
  textColor = "#5B55F6",
}: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 2,
        borderColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: textColor, fontSize: size * 0.32, fontWeight: "800" }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
