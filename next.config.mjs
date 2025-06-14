/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    // This modification is to prevent Konva from trying to import the 'canvas' module on the server.
    // The 'canvas' module is for Node.js and not needed or available for server-side rendering in Next.js.
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
};

export default nextConfig;