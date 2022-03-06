/** @type {import('next').NextConfig} */
const { join } = require('path');
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [join(__dirname, 'assets/styles')],
    prependData: `@import "variables.scss";`
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
}

module.exports = nextConfig
