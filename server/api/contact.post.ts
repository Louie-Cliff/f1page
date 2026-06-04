import type { ContactPayload } from '../utils/contact'
import {
  createContactEmail,
  validateContactPayload
} from '../utils/contact'
import { checkRateLimit } from '../utils/rate-limit'
import { resolveSiteSettings } from '../../app/utils/content/resolve-site-settings'

const sendgridFromEmail = 'mailbot@otherthingsagency.com'
const sendgridFromName = 'Other Things Mailbot'

const getClientIp = (event: Parameters<typeof getRequestIP>[0]) =>
  getRequestIP(event, { xForwardedFor: true }) ||
  event.node.req.headers['x-nf-client-connection-ip']?.toString() ||
  event.node.req.headers['x-real-ip']?.toString() ||
  'unknown'

export default defineEventHandler(async (event) => {
  const payload = await readBody<ContactPayload>(event)
  const validation = validateContactPayload(payload)

  if (!validation.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contact form validation failed.',
      data: {
        errors: validation.errors
      }
    })
  }

  const redirectTo = await resolveStoryblokPagePath(validation.data.thanksPath)

  if (validation.spam) {
    return {
      ok: true,
      redirectTo
    }
  }

  const config = useRuntimeConfig()
  const ipLimit = checkRateLimit(`contact:ip:${getClientIp(event)}`, {
    limit: config.contactRateLimitMax,
    windowMs: config.contactRateLimitWindowMs
  })
  const emailLimit = checkRateLimit(`contact:email:${validation.data.email}`, {
    limit: config.contactRateLimitEmailMax,
    windowMs: config.contactRateLimitWindowMs
  })
  const activeLimit = [ipLimit, emailLimit].find((result) => result.limited)

  setHeader(event, 'X-RateLimit-Limit', String(ipLimit.limit))
  setHeader(event, 'X-RateLimit-Remaining', String(ipLimit.remaining))
  setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(ipLimit.resetAt / 1000)))

  if (activeLimit) {
    setHeader(event, 'Retry-After', activeLimit.retryAfterSeconds)

    throw createError({
      statusCode: 429,
      statusMessage: 'Too many contact form submissions. Please try again later.',
      data: {
        errors: {
          form: 'Too many messages have been sent. Please try again later.'
        }
      }
    })
  }

  const siteSettings = await resolveSiteSettings()
  const siteName = siteSettings.siteName
  const apiKey = process.env.SENDGRID_API_KEY || ''
  const toEmail = siteSettings.contactEmail

  if (!apiKey || !toEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Contact form email is not configured.'
    })
  }

  const { text, html } = createContactEmail(validation, siteName)
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: toEmail }],
          subject: `[${siteName}] ${validation.data.subject}`
        }
      ],
      from: {
        email: sendgridFromEmail,
        name: sendgridFromName
      },
      reply_to: {
        email: validation.data.email,
        name: validation.data.name
      },
      content: [
        {
          type: 'text/plain',
          value: text
        },
        {
          type: 'text/html',
          value: html
        }
      ]
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Contact form email could not be sent.'
    })
  }

  return {
    ok: true,
    redirectTo
  }
})
