import { View, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet as UnistylesStyleSheet } from "react-native-unistyles"

import { Text, Button } from "../components"

const isWeb = Platform.OS === "web"

export const StarterScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text preset="heading" style={styles.title}>
            You&apos;re all set!
          </Text>
          <Text style={styles.description}>Start building your app here.</Text>
        </View>

        <View style={styles.footer}>
          <Button
            text="Go to Profile"
            variant="filled"
            onPress={() => navigation.navigate("Profile" as never)}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = UnistylesStyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing["2xl"],
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  description: {
    color: theme.colors.foregroundSecondary,
    fontSize: theme.typography.sizes.base,
    textAlign: "center",
  },
  footer: {
    paddingBottom: theme.spacing["2xl"],
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
    // Web needs explicit height
    ...(isWeb && {
      minHeight: "100vh" as unknown as number,
    }),
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes["3xl"],
    fontWeight: "bold",
    lineHeight: theme.typography.lineHeights["3xl"],
    marginBottom: theme.spacing.md,
  },
}))
