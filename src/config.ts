// EDIT THESE: your public handles. They appear in the footer and on the finale.
// `by` and `tag` are the developer credit shown on EVERY page and inside every scene player.
export const BRAND = { name: 'Lovora Meow', by: 'Sisirey', tag: '@sisirey' }
export const LINKS = {
  instagram: 'https://instagram.com/sisirey',      // TODO: confirm your Instagram handle
  telegram: 'https://t.me/sisirey',                // TODO: confirm your Telegram username
  whatsapp: 'https://wa.me/910000000000',          // TODO: replace with your number, country code first, digits only
}

// Fallback prices (rupees). The real price is set on the server with PRICE_INR / REGULAR_PRICE_INR and fetched from /api/pricing.
// Launch price first (99), then raise PRICE_INR to 149 when you are ready.
export const PRICING = { amount: 99, regular: 149, currency: 'INR' }
