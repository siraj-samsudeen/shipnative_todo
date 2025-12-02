/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { Spinner } from "@/components/Spinner"
import Config from "@/config"
import * as Screens from "@/screens"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { useAuthStore } from "@/stores"
import { useAppTheme } from "@/theme/context"

import { MainTabNavigator } from "./MainTabNavigator"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding)
  const {
    theme: { colors },
    theme: themeContextValue,
  } = useAppTheme()
  const navigationBarColor = colors.palette.neutral900
  const statusBarStyle = themeContextValue.isDark ? "light" : "dark"

  if (__DEV__) {
    console.log(
      "AppStack rendering. Loading:",
      loading,
      "User:",
      user ? "Logged In" : "Guest",
      "Onboarding:",
      hasCompletedOnboarding,
    )
  }

  if (loading) {
    return <Spinner fullScreen />
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor,
        statusBarStyle,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "default",
      }}
      initialRouteName={hasCompletedOnboarding ? (user ? "Main" : "Welcome") : "Onboarding"}
    >
      {hasCompletedOnboarding ? (
        user ? (
          // ------------------------------------------------------------------
          // AUTHENTICATED STACK
          // ------------------------------------------------------------------
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
          </>
        ) : (
          // ------------------------------------------------------------------
          // UNAUTHENTICATED STACK (Welcome, Login, Register)
          // ------------------------------------------------------------------
          <>
            <Stack.Screen
              name="Welcome"
              component={Screens.WelcomeScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Login"
              component={Screens.LoginScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Register"
              component={Screens.RegisterScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={Screens.ForgotPasswordScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
            {/* Allow going back to Onboarding from Welcome if needed, 
                but usually we don't want this in the main flow unless requested.
                User asked to "go in onboarding too", so we can add it here or 
                handle it via state change in Welcome screen. 
            */}
          </>
        )
      ) : (
        // ------------------------------------------------------------------
        // ONBOARDING STACK
        // ------------------------------------------------------------------
        <>
          <Stack.Screen name="Onboarding" component={Screens.OnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
