/**
 * @type {import('next').NextConfig}
 */


const nextConfig =  {
    reactStrictMode: false,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'chat-sdk-demo-web.netlify.app',
          port: '',
          pathname: '/avatars/**',
        },
      ],
    },
  }

  module.exports = nextConfig

