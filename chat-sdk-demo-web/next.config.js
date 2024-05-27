/**
 * @type {import('next').NextConfig}
 */


const nextConfig =  {
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

