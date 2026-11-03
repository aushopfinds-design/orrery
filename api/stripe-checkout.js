// Retired prototype: all Sandbox orders now pass through durable order validation.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(410).json({ error: 'Use the current Sandbox purchase flow.' })
}
