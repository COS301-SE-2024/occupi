module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-flow',
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-react-jsx',
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
      '@babel/plugin-transform-runtime',
      'react-native-reanimated/plugin', // Add this if you're using reanimated
    ],
  };
};