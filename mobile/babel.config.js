module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Note: le plugin react-native-worklets/plugin (requis par Reanimated 4,
    // utilisé en interne par expo-router/drawer) est configuré automatiquement
    // par babel-preset-expo — pas besoin de l'ajouter manuellement ici.
  };
};
