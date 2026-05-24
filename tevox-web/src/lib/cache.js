const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > entry.ttl) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function cacheSet(key, data, ttlMs) {
  store.set(key, { data, at: Date.now(), ttl: ttlMs })
}
