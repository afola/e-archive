const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8080'

function normalizeBackendOrigin(): string {
  const internalBackend = typeof window === 'undefined'
    ? process.env.BACKEND_INTERNAL_URL
    : undefined
  const explicitBackend = process.env.NEXT_PUBLIC_BACKEND_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const httpApiUrl = apiUrl && /^https?:\/\//i.test(apiUrl) ? apiUrl : null
  const rawBase = internalBackend || explicitBackend || httpApiUrl || DEFAULT_BACKEND_ORIGIN
  const trimmedBase = rawBase.replace(/\/$/, '')

  return trimmedBase.endsWith('/api') ? trimmedBase : `${trimmedBase}/api`
}

export function getBackendApiBase(): string {
  return normalizeBackendOrigin()
}

export function resolveBackendApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const withoutApiPrefix = path === '/api'
    ? ''
    : path.startsWith('/api/')
      ? path.slice(4)
      : path
  const normalizedPath = withoutApiPrefix.startsWith('/') ? withoutApiPrefix : `/${withoutApiPrefix}`
  return `${getBackendApiBase()}${normalizedPath}`
}
