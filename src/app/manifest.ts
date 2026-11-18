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
    // NOTE: icon.svg is intentionally NOT listed here. icon.svg is the
    // transparent-background Chrome-tab favicon (auto-detected by Next.js
    // from src/app/icon.svg → <link rel="icon">). PWA install icons use
    // apple-icon.png (dark bg + orange candles + white arrow) so the
    // installed app icon on desktop/phone keeps its dark background,
    // while the browser-tab favicon stays transparent.
    icons: [
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
