import { triggerNetlifyBuild } from '../../utils/netlify'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event).catch(() => ({})) as {
    title?: string
  }

  return await triggerNetlifyBuild(body.title)
})
