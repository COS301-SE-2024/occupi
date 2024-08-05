/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@tsparticles/slim', '@tsparticles/engine', '@tsparticles/react'],
};

module.exports = nextConfig;