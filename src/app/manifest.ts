import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trade Journal — Track. Analyze. Improve.',
    short_name: 'Trade Journal',
    description: 'Professional trade journal to record trades, analyze performance, and sharpen your trading edge.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f1115',
    theme_color: '#0f1115',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'business', 'productivity'],
  }
}
