/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["images.ctfassets.net", "hsmobility.local", "localhost", "127.0.0.1"]
  }
};

module.exports = nextConfig;
