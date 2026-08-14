import { getApiBase } from './apiBase'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiBase()}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    let code: string | undefined
    try {
      const body = await response.json()
      if (body.detail?.message) {
        message = body.detail.message
        code = body.detail.code
      } else if (typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
