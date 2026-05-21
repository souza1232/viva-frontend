/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/inicio', destination: '/', permanent: false },
    ]
  },
}
module.exports = nextConfig
