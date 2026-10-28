/** The address to give people: the custom keyword link when the surprise has one (it replaces the long default link), otherwise the ID link. */
export const shareUrlOf = (e: { id: string; customSlug?: string }) => `${window.location.origin}/s/${e.customSlug || e.id}`
