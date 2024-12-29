module.exports = function(api) {
    api.cache(true);
  
    return {
      presets: ["babel-preset-expo"], // Ensures compatibility with Expo
      plugins: [
        "nativewind/babel", // NativeWind plugin to enable Tailwind utility classes in React Native
      ],
    };
  };
  