// [BACKEND] Add serverless contact form endpoint via Resend - Aug 2026
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, businessType, message } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const text = [
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Business type: ${businessType || '—'}`,
    '',
    message.trim(),
  ].join('\n');

  try {
    await resend.emails.send({
      from: 'Kinfosoft <onboarding@resend.dev>',
      to: 'hello@kinfosoft.com',
      reply_to: email.trim(),
      subject: `New project inquiry — ${name.trim()}`,
      text,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
};
