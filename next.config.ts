// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // It's good to keep this true for development
  webpack: (config, { isServer }) => {
    if (isServer) {
      // This tells Webpack not to try to bundle the 'canvas' module for the server
      // as Konva might conditionally try to require it in a Node environment.
      config.externals = [...config.externals, 'canvas'];
    }
    return config;
  },
};

module.exports = nextConfig;