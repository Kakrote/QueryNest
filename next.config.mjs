/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve build stability
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  
  // Environment variables configuration
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
    }
    return config;
  },
};

export default nextConfig;
