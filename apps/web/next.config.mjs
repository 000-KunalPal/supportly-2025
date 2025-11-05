/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      {
        source:"/",
        destination: "/conversations",
        permanent: false
      },
    ]
  }
}

export default nextConfig
