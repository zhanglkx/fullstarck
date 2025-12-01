module.exports = function (api) {
  api.cache(true)

  if (
    process.env.NX_TASK_TARGET_TARGET === 'build' ||
    process.env.NX_TASK_TARGET_TARGET?.includes('storybook')
  ) {
    return {
      presets: [
        [
          '@nx/react/babel',
          {
            runtime: 'automatic',
          },
        ],
      ],
    }
  }

  return {
    presets: [
      ['module:@react-native/babel-preset', { useTransformReactJSX: true }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
    ],
  }
}
