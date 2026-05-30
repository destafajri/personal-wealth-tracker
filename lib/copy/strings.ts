export const copy = {
  'brand.name': 'Cermat',
  'brand.tagline': 'Cek keuangan kamu dalam 10 menit',

  'landing.hero.title': 'Aman gak kalau gw KPR, Gadai, atau Cicil?',
  'landing.hero.subtitle': 'Berapa max utang yang aman? Cek dalam 10 menit.',
  'landing.hero.trust': 'Tanpa daftar. Tanpa cloud.',

  'landing.cta.snapshot.label': 'Mulai dari Snapshot',
  'landing.cta.snapshot.body': 'Isi data kamu sendiri (5–10 menit).',
  'landing.cta.snapshot.action': 'Mulai →',

  'landing.cta.demo.label': 'Coba dengan data contoh',
  'landing.cta.demo.body': 'Skip dulu, lihat tools-nya.',
  'landing.cta.demo.action': 'Coba →',

  'footer.disclaimer':
    '100% client-side. Data kamu tetap di komputer kamu. Cermat bukan penasihat keuangan atau produk berizin.',

  'pill.live': 'LIVE',
  'pill.estimasi': 'ESTIMASI',
  'pill.stale': 'STALE',

  'error.generic.title': 'Ada yang gak beres',
  'error.generic.body': 'Coba muat ulang halaman, atau balik ke beranda.',
  'error.generic.cta': 'Kembali ke beranda',
} as const

export type CopyKey = keyof typeof copy

export function t(key: CopyKey, vars?: Record<string, string | number>): string {
  const raw = copy[key]
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  )
}
