import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['jotai-devtools'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    // https://github.com/vercel/next.js/discussions/52690#discussioncomment-11564384
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    })

    return config
  },
  devIndicators: {
    position: 'top-left',
  },
}

export default nextConfig
