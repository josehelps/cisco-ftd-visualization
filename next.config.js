/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/cisco-ftd-visualization',
  assetPrefix: '/cisco-ftd-visualization/',
};

module.exports = nextConfig; 