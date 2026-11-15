import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trade Journal — Track. Analyze. Improve.',
    short_name: 'Trade Journal',
    description: 'Professional trade journal to record trades, analyze performance, and sharpen your trading edge.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f1115',
    theme_color: '#ff9d2e',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['finance', 'business', 'productivity'],
  }
}
