import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/ui/Button'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'How do I place an order?', a: 'Browse our Products page, select what you want, and tap "Enquire on WhatsApp". We\'ll confirm availability, arrange delivery, and send payment details over WhatsApp — no checkout needed.' },
  { q: 'Do you ship outside Bihar and Uttarakhand?', a: 'Yes — we ship pan-India. Delivery times vary by pincode. For large orders (5 kg+) we\'ll negotiate a courier rate and share it before you confirm.' },
  { q: 'Are these products certified organic?', a: 'Our honey and turmeric are sourced from naturally grown farms, though formal organic certification is in progress. We\'re transparent about sourcing — ask us anything over WhatsApp.' },
  { q: 'Can I order in bulk for a restaurant or store?', a: 'Absolutely. We offer wholesale pricing on orders above ₹5,000. Reach out via the Contact page and we\'ll get back to you within 24 hours.' },
  { q: 'How are products packaged?', a: 'Everything is packed in food-grade, airtight pouches or glass jars depending on the product. We use minimal plastic — most packaging is recyclable.' },
  { q: 'What\'s the shelf life of your products?', a: 'Honey: 2 years. Turmeric and spice mixes: 18 months. Makhana: 6 months. Cold-pressed oil: 12 months. Best-before dates are printed on every pack.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-pine-900/10 dark:border-parchment-50/10 py-5">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-4 text-left group">
        <span className="font-medium text-pine-950 dark:text-parchment-50 group-hover:text-saffron-600 dark:group-hover:text-saffron-300 transition-colors">
          {q}
        </span>
        <ChevronDown size={18} className={`shrink-0 mt-0.5 text-pine-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="mt-3 text-sm text-pine-700 dark:text-parchment-200/80 leading-relaxed pr-8">
          {a}
        </p>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-pine-950 text-parchment-50">
          <div className="container-page py-24 sm:py-32 relative z-10">
            <div className="max-w-2xl animate-fade-up">
              <p className="text-sm font-medium tracking-wide uppercase text-saffron-300 mb-4">
                From the Himalayan foothills
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-parchment-50">
                Real food, made the slow way.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-parchment-200/90 max-w-xl leading-relaxed">
                HimShakti is a small family-run food processing unit from the foothills of Uttarakhand.
                Stone-ground spices, cold-pressed oils, raw honey — made in small batches, the way
                they've always been made.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button size="lg" variant="primary" onClick={() => navigate('/products')}>
                  Browse products
                </Button>
                <Button size="lg" variant="outline"
                  className="border-parchment-50/40 text-parchment-50 hover:bg-parchment-50/10"
                  onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>
                  Our story
                </Button>
              </div>
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-16 sm:h-24 text-parchment-50 dark:text-pine-900"
            viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,120 L0,70 L120,20 L230,65 L330,10 L460,72 L560,30 L660,75 L780,15 L900,68 L1020,25 L1110,70 L1200,40 L1200,120 Z" fill="currentColor" />
          </svg>
        </section>

        {/* What we make */}
        <section className="container-page py-16 sm:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji: '🍯', title: 'Raw honey', body: 'Cold-extracted from forest hives. Never heated, never filtered beyond straining. Deep amber, complex flavour.' },
              { emoji: '🌿', title: 'Stone-ground spices', body: 'Sun-dried, then ground on stone the same day. Turmeric, cumin, coriander — the colour and smell tell the difference.' },
              { emoji: '🫙', title: 'Cold-pressed oils', body: 'Kolhu-pressed mustard oil with the sharp pungency that actually means something. Not the pale, deodorised version.' },
            ].map(c => (
              <div key={c.title} className="rounded-2xl bg-parchment-100 dark:bg-pine-900 p-7">
                <span className="text-3xl">{c.emoji}</span>
                <h3 className="font-display text-lg font-semibold text-pine-950 dark:text-parchment-50 mt-3 mb-2">{c.title}</h3>
                <p className="text-sm text-pine-700 dark:text-parchment-200/80 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our story */}
        <section id="story" className="bg-pine-50/60 dark:bg-pine-900/30 py-16 sm:py-24">
          <div className="container-page">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300 mb-3">Our story</p>
              <h2 className="font-display text-2xl sm:text-4xl font-semibold text-pine-950 dark:text-parchment-50 mb-6">
                Three generations. One mill. The same recipe.
              </h2>
              <div className="space-y-5 text-pine-700 dark:text-parchment-200/80 leading-relaxed">
                <p>HimShakti started the way most things in the hills do — out of necessity. Sixty years ago, my grandfather set up a small kolhu press to process mustard for the village. There was no market plan. It was just something the community needed done.</p>
                <p>By the time my parents took it over, they'd added a stone mill for spices and started collecting honey from a network of forest keepers in the foothills. Still no fancy machinery. Still the same slow methods — because they work.</p>
                <p>The problem was always reach. Everything we made went through distributors, who sold it under someone else's label. The people buying HimShakti products didn't know they were buying HimShakti products.</p>
                <p>We built this platform to fix that. If you order from this page, it comes directly from us. We pack it ourselves, we know exactly which batch it came from, and you have a WhatsApp number that reaches a real person.</p>
              </div>
              <Button className="mt-8" variant="outline" onClick={() => navigate('/products')}>
                See what we make →
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-page py-16 sm:py-24">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300 mb-3 text-center">FAQ</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-pine-950 dark:text-parchment-50 text-center mb-10">
              Common questions
            </h2>
            {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-pine-950 py-14">
          <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-parchment-50">Ready to order?</h2>
              <p className="text-sm text-parchment-300/70 mt-1">Browse the catalog and enquire on WhatsApp — it takes under a minute.</p>
            </div>
            <Button size="lg" variant="primary" onClick={() => navigate('/products')}>
              Browse products
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
