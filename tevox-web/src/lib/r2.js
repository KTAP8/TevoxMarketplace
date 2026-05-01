export function r2Url(key) {
  if (!key) return 'https://placehold.co/800x600/1D1C1D/E9FF22?text=Tevox'
  return `${import.meta.env.VITE_R2_PUBLIC_URL}/${key}`
}
