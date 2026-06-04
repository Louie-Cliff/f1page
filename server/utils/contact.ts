type ContactSubject = 'General Enquiries' | 'New Business' | 'Tech Support'

export type ContactPayload = {
  name?: string
  email?: string
  subject?: string
  message?: string
  website?: string
  startedAt?: number
  thanksPath?: string
}

export type ContactValidationResult =
  | {
      ok: true
      data: {
        name: string
        email: string
        subject: ContactSubject
        message: string
        thanksPath?: string
      }
      spam?: boolean
    }
  | {
      ok: false
      errors: Record<string, string>
    }

export const contactSubjects: ContactSubject[] = [
  'General Enquiries',
  'New Business',
  'Tech Support'
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean = (value?: string) => String(value || '').trim()

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export const validateContactPayload = (
  payload: ContactPayload
): ContactValidationResult => {
  const name = clean(payload.name)
  const email = clean(payload.email).toLowerCase()
  const subject = clean(payload.subject)
  const message = clean(payload.message)
  const startedAt = Number(payload.startedAt || 0)
  const elapsedMs = Date.now() - startedAt
  const errors: Record<string, string> = {}

  if (clean(payload.website)) {
    return {
      ok: true,
      spam: true,
      data: {
        name: 'Spam',
        email: 'spam@example.com',
        subject: 'General Enquiries',
        message: '',
        thanksPath: clean(payload.thanksPath) || undefined
      }
    }
  }

  if (name.length < 2 || name.length > 120) {
    errors.name = 'Enter your name.'
  }

  if (!emailPattern.test(email) || email.length > 254) {
    errors.email = 'Enter a valid email address.'
  }

  if (!contactSubjects.includes(subject as ContactSubject)) {
    errors.subject = 'Choose a valid subject.'
  }

  if (message.length < 10 || message.length > 5000) {
    errors.message = 'Enter a message between 10 and 5000 characters.'
  }

  if (!startedAt || elapsedMs < 1500) {
    errors.form = 'Please wait a moment and try again.'
  }

  if (Object.keys(errors).length) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      name,
      email,
      subject: subject as ContactSubject,
      message,
      thanksPath: clean(payload.thanksPath) || undefined
    }
  }
}

export const createContactEmail = (
  enquiry: ContactValidationResult & { ok: true },
  siteName: string
) => {
  const { name, email, subject, message } = enquiry.data
  const text = [
    `New ${siteName} contact form submission`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    '',
    'Message:',
    message
  ].join('\n')

  const html = `
    <main style="font-family: Arial, sans-serif; color: #101014; line-height: 1.6;">
      <h1 style="font-size: 22px;">New ${escapeHtml(siteName)} contact form submission</h1>
      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 24px 0;">
        <tr>
          <th align="left" style="padding: 8px 16px 8px 0;">Name</th>
          <td style="padding: 8px 0;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 8px 16px 8px 0;">Email</th>
          <td style="padding: 8px 0;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 8px 16px 8px 0;">Subject</th>
          <td style="padding: 8px 0;">${escapeHtml(subject)}</td>
        </tr>
      </table>
      <h2 style="font-size: 18px;">Message</h2>
      <p style="white-space: pre-line;">${escapeHtml(message)}</p>
    </main>
  `

  return { text, html }
}
