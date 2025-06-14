/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    // This modification prevents Konva from trying to import the 'canvas' module
    // during the server-side build, which is what causes the prerender error.
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
};

// Use ES Module export syntax for .mjs files
export default nextConfig;