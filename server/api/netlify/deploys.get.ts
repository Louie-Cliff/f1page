import { getNetlifyDeploySummary } from '../../utils/netlify'

export default defineEventHandler(async () => {
  return await getNetlifyDeploySummary()
})
