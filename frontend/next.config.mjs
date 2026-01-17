/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          net: false,
          tls: false,
          fs: false,
          "child_process": false,
          dns: false, "timers/promises": false,
        };
      }
      return config;
    },
  };
  
  export default nextConfig;
  