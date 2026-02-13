/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "kr", "uz"],
    localeDetection: false,
  },
};

module.exports = nextConfig;
