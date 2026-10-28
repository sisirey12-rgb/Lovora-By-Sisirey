// EDIT THESE: your public handles. They appear in the footer and on the finale.
// `by` and `tag` are the developer credit shown on EVERY page and inside every scene player.
export const BRAND = { name: 'Lovora Meow', by: 'Sisirey', tag: '' }
export const LINKS = {
  instagram: 'https://instagram.com/sisirey',      // TODO: confirm your Instagram handle
  telegram: 'https://t.me/sisirey',                // TODO: confirm your Telegram username
  whatsapp: 'https://wa.me/910000000000',          // TODO: replace with your number, country code first, digits only
}

// Fallback prices (rupees). The server is authoritative and serves account-specific prices from /api/pricing.
// The first paid purchase (share link OR gift code) costs ₹149; every later paid purchase costs ₹299.
export const PRICING = { amount: 149, first: 149, repeat: 299, regular: 299, currency: 'INR' }
