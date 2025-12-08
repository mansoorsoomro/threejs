/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/menards/:path*',
        destination: 'https://external-midwest.menards.com/postframe-web/:path*',
      },
    ];
  },
}

module.exports = nextConfig

