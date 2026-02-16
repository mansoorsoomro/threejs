/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  // Note: rewrites and API routes will not work in static export.
  // We keep them for local development if needed, but they won't be in the production 'out' folder.
}

module.exports = nextConfig

