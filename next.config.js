module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  stats: {
    warnings: false,
  },
  webpack(config) {
    return config;
  },
};
