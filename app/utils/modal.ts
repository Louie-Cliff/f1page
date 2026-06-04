export const MODAL_QUERY_PARAM = '_'

const modalPathPattern = /^\/?modals?(\/|$)/i

export const normalizeModalPath = (value?: unknown) => {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (typeof rawValue !== 'string') {
    return ''
  }

  const withoutOrigin = rawValue.replace(/^https?:\/\/[^/]+/i, '')
  const [pathWithQuery] = withoutOrigin.split('#')
  const [path = ''] = (pathWithQuery || '').split('?')
  return path.replace(/^\/+|\/+$/g, '')
}

export const isReservedModalPath = (value?: unknown) =>
  modalPathPattern.test(normalizeModalPath(value))

export const getModalPathFromQuery = (query: Record<string, unknown>) =>
  normalizeModalPath(query[MODAL_QUERY_PARAM])
