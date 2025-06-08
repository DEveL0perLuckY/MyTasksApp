import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();

  // Use theme-aware color
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={[styles.text, { color: textColor }]}>
          This screen doesn't exist
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.text, { color: textColor }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});
