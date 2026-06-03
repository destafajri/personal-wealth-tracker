import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-30',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  css: [
    '~/assets/css/main.css',
    '@fontsource/plus-jakarta-sans/400.css',
    '@fontsource/plus-jakarta-sans/500.css',
    '@fontsource/plus-jakarta-sans/600.css',
    '@fontsource/plus-jakarta-sans/700.css',
  ],

  vite: {
    // @tailwindcss/vite ships Vite 7 types while Nuxt 3.21 graph uses Vite 5 — cast to bridge
    plugins: [tailwindcss() as never],
    server: {
      allowedHosts: ['.ngrok-free.app'],
    },
  },

  nitro: {
    preset: 'vercel-edge',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Cermat — Cek keuangan kamu dalam 10 menit',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1b4332' },
        {
          name: 'description',
          content:
            'Track, plan, dan simulasi keputusan finansial. Tanpa daftar, tanpa cloud — data kamu tetap di komputer kamu.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Cermat — Cek keuangan kamu dalam 10 menit' },
        {
          property: 'og:description',
          content:
            'Track, plan, dan simulasi keputusan finansial. Tanpa daftar, tanpa cloud — data kamu tetap di komputer kamu.',
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Cermat — Cek keuangan kamu dalam 10 menit' },
        {
          name: 'twitter:description',
          content:
            'Track, plan, dan simulasi keputusan finansial. Tanpa daftar, tanpa cloud — data kamu tetap di komputer kamu.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
