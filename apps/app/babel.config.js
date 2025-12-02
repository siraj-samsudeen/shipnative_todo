/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Transform import.meta for web compatibility
      "babel-plugin-transform-import-meta",
      [
        "react-native-unistyles/plugin",
        {
          root: "app",
        },
      ],
      "react-native-reanimated/plugin",
    ],
  }
}
