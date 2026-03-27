import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Restiqa - Stays in Bangladesh',
    short_name: 'Restiqa',
    description: 'Premium vacation rentals and stays across Bangladesh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#d32f2f',
    icons: [
      {
        src: '/favicon.png', // Reusing the high-quality png
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png', // Fallback
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  }
}
