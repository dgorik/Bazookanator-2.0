import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Fix incorrect workspace-root inference (multiple lockfiles) which can cause
  // Turbopack to look for manifests in the wrong place during dev.
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig
