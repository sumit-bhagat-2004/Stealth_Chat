/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'rukminim1.flixcart.com',
      'rukminim2.flixcart.com',
      'static-assets-web.flixcart.com',
      'img1a.flixcart.com',
      'via.placeholder.com',
      'images.unsplash.com'
    ],
    unoptimized: true
  },
  serverExternalPackages: ['mongodb'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
