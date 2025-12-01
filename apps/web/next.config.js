//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next')
const path = require('path')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@fullstarck/api-contracts': path.resolve(__dirname, '../../libs/api-contracts/src/index.ts'),
      '@fullstarck/shared-utils': path.resolve(__dirname, '../../libs/shared-utils/src/index.ts'),
    }
    return config
  },
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

module.exports = composePlugins(...plugins)(nextConfig)
