export const WHATSAPP_NUMBER = '910000000000'

export function buildWhatsAppLink(product) {
  const message = product
    ? `Hi HimShakti, I'd like to enquire about:\n*${product.name}* (${product.weight}) — ₹${product.price}\n\nQty: ___`
    : `Hi HimShakti, I'd like to know more about your products.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildMultiWhatsAppLink(products) {
  const lines = products.map(p => `• ${p.name} (${p.weight}) — ₹${p.price}`).join('\n')
  const message = `Hi HimShakti, I'd like to enquire about the following products:\n\n${lines}\n\nPlease share availability and delivery details.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
