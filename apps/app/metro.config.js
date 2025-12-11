const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

// Get the project root (monorepo root)
const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot]

// Let Metro know where to resolve packages and extensions
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

config.resolver.sourceExts.push("cjs")

// Web-specific module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    // Provide shim for react-native-worklets (needed by reanimated)
    if (moduleName === "react-native-worklets" || moduleName.startsWith("react-native-worklets/")) {
      return {
        type: "sourceFile",
        filePath: path.join(projectRoot, "app/utils/shims/react-native-worklets.web.js"),
      }
    }

    // These native modules don't work on web - provide empty mocks
    const nativeOnlyModules = ["react-native-nitro-modules"]

    if (nativeOnlyModules.some((mod) => moduleName === mod || moduleName.startsWith(`${mod}/`))) {
      return {
        type: "empty",
      }
    }

    // Force zustand and its submodules to resolve to CommonJS versions
    // The ESM versions use import.meta.env which doesn't work in Metro's web bundle
    if (moduleName === "zustand" || moduleName.startsWith("zustand/")) {
      const subpath = moduleName === "zustand" ? "" : moduleName.replace("zustand/", "")
      const cjsPath = subpath
        ? path.join(workspaceRoot, "node_modules", "zustand", `${subpath}.js`)
        : path.join(workspaceRoot, "node_modules", "zustand", "index.js")

      return {
        type: "sourceFile",
        filePath: cjsPath,
      }
    }
  }

  // Let Metro handle all other modules
  return context.resolveRequest(context, moduleName, platform)
}

// Enable inline requires to reduce startup cost on mobile
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
}

module.exports = config
