import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        '8.219.243.231',
        '8.219.243.231:9002',
        'localhost:9002',
        '127.0.0.1:9002'
      ]
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: 'heovose-storage', port: '9000', pathname: '/**' },
      { 
        protocol: 'http', 
        hostname: process.env.STORAGE_ENDPOINT || 'localhost', 
        port: process.env.STORAGE_PORT || '9000', 
        pathname: '/**' 
      },
      { 
        protocol: 'https', 
        hostname: process.env.STORAGE_ENDPOINT || 'localhost', 
        port: process.env.STORAGE_PORT || '9000', 
        pathname: '/**' 
      },
      { protocol: 'http', hostname: '192.168.*', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: '10.*', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: '172.*', port: '9000', pathname: '/**' },
    ],
  },
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (!dev) {
      config.parallelism = 1;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/storage/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || 'http://localhost:9002' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: `http://${process.env.STORAGE_ENDPOINT || 'localhost'}:${process.env.STORAGE_PORT || '9000'}/:path*`,
      },
    ]
  },
};

export default nextConfig;
