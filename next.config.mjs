/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'neeko-copilot.bytedance.net',
      },
      {
        protocol: 'https',
        hostname: 'trae-api-cn.mchost.guru',
      },
      {
        protocol: 'https',
        hostname: 'aqleckpmjbtekkrwurap.supabase.co',
      },
    ],
  },
};

export default nextConfig;
