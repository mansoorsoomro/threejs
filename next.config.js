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
        source: '/api/building-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BUILDING_API_BASE_URL || 'https://api.example-supplier.com/building-api'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig

