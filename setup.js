#!/usr/bin/env node

/* eslint-env node */
const fs = require("fs")
const path = require("path")
const readline = require("readline")
const { execSync } = require("child_process")

// Ensure stdin is properly configured
if (process.stdin.isTTY) {
  process.stdin.setEncoding("utf8")
  if (process.stdin.isPaused()) {
    process.stdin.resume()
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

// Helper to ask a question
const askQuestion = (question, validator, defaultValue) => {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (default: ${defaultValue}): ` : `${question}: `
    rl.question(prompt, (answer) => {
      const value = answer.trim() || defaultValue || ""
      if (validator && !validator(value)) {
        console.log("❌ Invalid input. Please try again.")
        resolve(askQuestion(question, validator, defaultValue))
      } else {
        resolve(value)
      }
    })
  })
}

// Helper to ask yes/no question
const askYesNo = (question, defaultValue = true) => {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? "[Y/n]" : "[y/N]"
    rl.question(`${question} ${defaultText}: `, (answer) => {
      const normalized = answer.trim().toLowerCase()
      if (normalized === "") {
        resolve(defaultValue)
      } else {
        resolve(normalized === "y" || normalized === "yes")
      }
    })
  })
}

// Validators
const validateBundleId = (bundleId) => /^[a-zA-Z0-9-.]+$/.test(bundleId)
const validateScheme = (scheme) => /^[a-z0-9]+$/.test(scheme)
const validateUrl = (url) => url.startsWith("https://")
const validateNotEmpty = (value) => value.length > 0

// Main setup function
async function setup() {
  console.log("\n" + "=".repeat(70))
  console.log("🚀 ShipNative Setup Wizard")
  console.log("=".repeat(70))
  console.log("\nThis wizard will help you configure your cloned ShipNative project.")
  console.log("We'll set up:")
  console.log("  • Project metadata (name, bundle ID, scheme)")
  console.log("  • Backend services (Supabase, RevenueCat, etc.)")
  console.log("  • Environment variables")
  console.log("\n💡 Tip: You can skip optional fields - the app will use MOCK mode!\n")

  const config = {}
  const services = {}

  // ========================================
  // SECTION 1: Project Metadata
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("📱 PROJECT METADATA")
  console.log("━".repeat(70))

  config.displayName = await askQuestion(
    "What is your app's display name? (shown to users)",
    validateNotEmpty,
    "My ShipNative App"
  )

  config.projectName = await askQuestion(
    "What is your project name? (lowercase, no spaces)",
    (name) => /^[a-z0-9-]+$/.test(name),
    config.displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  )

  config.bundleId = await askQuestion(
    "What is your bundle identifier? (e.g., com.company.app)",
    validateBundleId,
    `com.shipnative.${config.projectName.replace(/-/g, "")}`
  )

  config.scheme = await askQuestion(
    "What is your app scheme? (for deep linking, e.g., myapp)",
    validateScheme,
    config.projectName.replace(/-/g, "")
  )

  // ========================================
  // SECTION 2: Supabase
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 SUPABASE (Backend & Auth)")
  console.log("━".repeat(70))
  console.log("Supabase provides database, authentication, and real-time features.")
  console.log("Create a project at: https://supabase.com/dashboard/projects\n")

  const setupSupabase = await askYesNo("Do you want to set up Supabase now?", true)

  if (setupSupabase) {
    services.EXPO_PUBLIC_SUPABASE_URL = await askQuestion(
      "Enter your Supabase Project URL",
      validateUrl
    )
    services.EXPO_PUBLIC_SUPABASE_ANON_KEY = await askQuestion(
      "Enter your Supabase Anon Key",
      (key) => key.length > 20
    )
  }

  // ========================================
  // SECTION 3: Google OAuth
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 GOOGLE OAUTH (Social Login)")
  console.log("━".repeat(70))
  console.log("Enable Google sign-in for your users.")
  console.log("Setup at: https://console.cloud.google.com/apis/credentials\n")

  const setupGoogle = await askYesNo("Do you want to set up Google OAuth?", false)

  if (setupGoogle) {
    services.EXPO_PUBLIC_GOOGLE_CLIENT_ID = await askQuestion(
      "Enter your Google OAuth Client ID",
      (id) => id.length > 10
    )
    services.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET = await askQuestion(
      "Enter your Google OAuth Client Secret",
      (secret) => secret.length > 10
    )
  }

  // ========================================
  // SECTION 4: Apple Sign-In
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 APPLE SIGN-IN (Social Login)")
  console.log("━".repeat(70))
  console.log("Enable Apple sign-in for iOS users.")
  console.log("Setup at: https://developer.apple.com/account/resources/identifiers/list\n")

  const setupApple = await askYesNo("Do you want to set up Apple Sign-In?", false)

  if (setupApple) {
    services.EXPO_PUBLIC_APPLE_SERVICES_ID = await askQuestion(
      "Enter your Apple Services ID",
      (id) => id.includes(".")
    )
    services.EXPO_PUBLIC_APPLE_TEAM_ID = await askQuestion(
      "Enter your Apple Team ID (10 characters)",
      (id) => /^[A-Z0-9]{10}$/.test(id)
    )
    services.EXPO_PUBLIC_APPLE_PRIVATE_KEY = await askQuestion(
      "Enter your Apple Private Key",
      (key) => key.startsWith("-----BEGIN PRIVATE KEY-----")
    )
    services.EXPO_PUBLIC_APPLE_KEY_ID = await askQuestion(
      "Enter your Apple Key ID (10 characters)",
      (id) => /^[A-Z0-9]{10}$/.test(id)
    )
  }

  // ========================================
  // SECTION 5: PostHog
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 POSTHOG (Analytics)")
  console.log("━".repeat(70))
  console.log("Track user behavior with analytics, session recording, and feature flags.")
  console.log("Create a project at: https://us.posthog.com/project/settings\n")

  const setupPostHog = await askYesNo("Do you want to set up PostHog?", false)

  if (setupPostHog) {
    services.EXPO_PUBLIC_POSTHOG_API_KEY = await askQuestion(
      "Enter your PostHog API Key",
      validateNotEmpty
    )
    services.EXPO_PUBLIC_POSTHOG_HOST = await askQuestion(
      "Enter your PostHog Host",
      validateUrl,
      "https://us.i.posthog.com"
    )
  }

  // ========================================
  // SECTION 6: RevenueCat
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 REVENUECAT (In-App Purchases)")
  console.log("━".repeat(70))
  console.log("Implement subscriptions and in-app purchases across iOS, Android, and Web.")
  console.log("Create a project at: https://app.revenuecat.com/\n")

  const setupRevenueCat = await askYesNo("Do you want to set up RevenueCat?", false)

  if (setupRevenueCat) {
    services.EXPO_PUBLIC_REVENUECAT_IOS_KEY = await askQuestion(
      "Enter your RevenueCat iOS Public API Key (optional)",
      null
    )
    services.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = await askQuestion(
      "Enter your RevenueCat Android Public API Key (optional)",
      null
    )
    services.EXPO_PUBLIC_REVENUECAT_WEB_KEY = await askQuestion(
      "Enter your RevenueCat Web Public API Key (optional, for Web Billing)",
      null
    )
  }

  // ========================================
  // SECTION 7: Sentry
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 SENTRY (Error Tracking)")
  console.log("━".repeat(70))
  console.log("Track app crashes and performance issues.")
  console.log("Create a project at: https://sentry.io/projects/new/\n")

  const setupSentry = await askYesNo("Do you want to set up Sentry?", false)

  if (setupSentry) {
    services.EXPO_PUBLIC_SENTRY_DSN = await askQuestion(
      "Enter your Sentry DSN",
      validateUrl
    )
  }

  // ========================================
  // SECTION 8: Firebase (Push Notifications)
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("🔹 FIREBASE CLOUD MESSAGING (Push Notifications)")
  console.log("━".repeat(70))
  console.log("Enable push notifications for Android (iOS uses APNs automatically).")
  console.log("Setup at: https://console.firebase.google.com/\n")

  const setupFCM = await askYesNo("Do you want to set up Firebase Cloud Messaging?", false)

  if (setupFCM) {
    services.EXPO_PUBLIC_FCM_SERVER_KEY = await askQuestion(
      "Enter your Firebase Cloud Messaging Server Key",
      (key) => key.length > 20
    )
    console.log("\n💡 Don't forget to download google-services.json for Android!")
    console.log("   Place it in: apps/app/android/app/google-services.json")
  }

  // ========================================
  // APPLY CHANGES
  // ========================================
  console.log("\n" + "━".repeat(70))
  console.log("💾 APPLYING CONFIGURATION")
  console.log("━".repeat(70))

  // 1. Update app.json
  const appJsonPath = path.join(__dirname, "apps/app/app.json")
  if (fs.existsSync(appJsonPath)) {
    console.log("\n📝 Updating app.json...")
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"))

    // Handle both flat and nested (under "expo") structures
    const configRoot = appJson.expo || appJson

    configRoot.name = config.displayName
    configRoot.slug = config.projectName
    configRoot.scheme = config.scheme

    if (!configRoot.ios) configRoot.ios = {}
    configRoot.ios.bundleIdentifier = config.bundleId

    if (!configRoot.android) configRoot.android = {}
    configRoot.android.package = config.bundleId

    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2))
    console.log("   ✅ app.json updated")
  }

  // 2. Update package.json in apps/app
  const appPackageJsonPath = path.join(__dirname, "apps/app/package.json")
  if (fs.existsSync(appPackageJsonPath)) {
    console.log("\n📝 Updating apps/app/package.json...")
    const packageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, "utf8"))
    packageJson.name = config.projectName
    fs.writeFileSync(appPackageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log("   ✅ apps/app/package.json updated")
  }

  // 3. Create .env file
  if (Object.keys(services).length > 0) {
    console.log("\n📝 Creating .env file...")
    const envPath = path.join(__dirname, "apps/app/.env")
    const envContent = Object.entries(services)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")
    fs.writeFileSync(envPath, envContent)
    console.log("   ✅ .env file created at apps/app/.env")
    console.log(`   ✅ Configured ${Object.keys(services).length} environment variables`)
  } else {
    console.log("\n💡 No services configured - app will run in MOCK mode")
  }

  // 4. Ask about dependencies installation
  console.log("\n" + "━".repeat(70))
  console.log("📦 DEPENDENCIES")
  console.log("━".repeat(70))

  const shouldInstall = await askYesNo(
    "\nDo you want to install dependencies now? (yarn install)",
    true
  )

  if (shouldInstall) {
    console.log("\n📦 Installing dependencies (this may take a few minutes)...\n")
    try {
      execSync("yarn install", { stdio: "inherit" })
      console.log("\n   ✅ Dependencies installed successfully")
    } catch (error) {
      console.error("   ❌ Failed to install dependencies")
      console.error("   Please run 'yarn install' manually")
    }
  }

  // ========================================
  // COMPLETION
  // ========================================
  console.log("\n" + "=".repeat(70))
  console.log("🎉 SETUP COMPLETE!")
  console.log("=".repeat(70))

  console.log("\n📚 Important Documentation Files:")
  console.log("\n📖 Getting Started:")
  console.log("   • README.md - Main documentation and quick start")
  console.log("   • apps/app/vibe/CONTEXT.md - App architecture")
  console.log("   • apps/app/vibe/TECH_STACK.md - Technologies used")
  console.log("   • apps/app/vibe/STYLE_GUIDE.md - Code patterns")

  console.log("\n🔧 Setup & Integration:")
  console.log("   • docs/SUPABASE.md - Auth and database")
  console.log("   • docs/MONETIZATION.md - Payments (RevenueCat for iOS, Android & Web)")
  console.log("   • docs/ANALYTICS.md - PostHog and Sentry")
  console.log("   • docs/NOTIFICATIONS.md - Push notifications")
  console.log("   • docs/DESIGN_SYSTEM.md - UI components")

  console.log("\n🚀 Deployment:")
  console.log("   • docs/DEPLOYMENT.md - iOS, Android, Web deployment")
  console.log("   • docs/TROUBLESHOOTING.md - Common issues")

  console.log("\n🔗 Your Configuration:")
  console.log(`   • Display Name: ${config.displayName}`)
  console.log(`   • Bundle ID: ${config.bundleId}`)
  console.log(`   • URL Scheme: ${config.scheme}://`)
  console.log(`   • Services: ${Object.keys(services).length} configured, ${9 - Object.keys(services).length} in mock mode`)

  console.log("\n💡 Next Steps:")
  console.log("   1. cd apps/app")
  console.log("   2. yarn ios  (or yarn android)")
  console.log("   3. Check the Dev Dashboard in the app")
  console.log("   4. Read docs/SUPABASE.md to set up your database")
  console.log("   5. Read docs/MONETIZATION.md to configure subscriptions")

  console.log("\n🤖 AI-Assisted Development:")
  console.log("   Use this prompt in Cursor/Claude:")
  console.log('   "I am ready to vibe. Read the .cursorrules and the vibe/ folder.')
  console.log('   I want to build a [Description of App]. Start by outlining')
  console.log('   the database schema changes I need."')

  console.log("\n🔗 Test Deep Linking:")
  console.log(`   xcrun simctl openurl booted "${config.scheme}://profile"`)

  console.log("\n" + "=".repeat(70))
  console.log("Happy coding! 🚀")
  console.log("=".repeat(70) + "\n")

  rl.close()
  process.exit(0)
}

// Run setup
setup().catch((error) => {
  console.error("\n❌ Setup failed:", error.message)
  rl.close()
  process.exit(1)
})
