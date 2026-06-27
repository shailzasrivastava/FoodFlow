import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/ui/Button'
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react'

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container-page py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300 mb-3">Get in touch</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-pine-950 dark:text-parchment-50 mb-4">Contact us</h1>
        <p className="text-pine-600 dark:text-parchment-300/70 max-w-lg mb-12">
          For orders, bulk enquiries, or any questions — reach us on WhatsApp (fastest) or email.
          We respond within a few hours during business hours.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <a href="https://wa.me/910000000000?text=Hi%20HimShakti%2C%20I%20have%20a%20question."
            target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-4 rounded-2xl border border-pine-900/10 dark:border-parchment-50/10 bg-white dark:bg-pine-900 p-7 hover:-translate-y-1 transition-transform">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600">
              <MessageCircle size={24} />
            </span>
            <div>
              <h2 className="font-display font-semibold text-pine-950 dark:text-parchment-50">WhatsApp</h2>
              <p className="text-sm text-pine-600 dark:text-parchment-300/70 mt-1">+91 00000 00000</p>
              <p className="text-xs text-pine-400 dark:text-parchment-300/50 mt-1">Usually responds within 2 hours</p>
            </div>
            <Button size="sm" variant="primary" className="self-start">Open WhatsApp →</Button>
          </a>

          <a href="mailto:orders@himshakti.in"
            className="flex flex-col gap-4 rounded-2xl border border-pine-900/10 dark:border-parchment-50/10 bg-white dark:bg-pine-900 p-7 hover:-translate-y-1 transition-transform">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600">
              <Mail size={24} />
            </span>
            <div>
              <h2 className="font-display font-semibold text-pine-950 dark:text-parchment-50">Email</h2>
              <p className="text-sm text-pine-600 dark:text-parchment-300/70 mt-1">orders@himshakti.in</p>
              <p className="text-xs text-pine-400 dark:text-parchment-300/50 mt-1">For bulk orders and formal enquiries</p>
            </div>
            <Button size="sm" variant="outline" className="self-start">Send email →</Button>
          </a>
        </div>

        <div className="mt-12 pt-10 border-t border-pine-900/10 dark:border-parchment-50/10 flex flex-col sm:flex-row gap-8 text-sm text-pine-600 dark:text-parchment-300/70">
          <span className="flex items-center gap-2"><MapPin size={16} className="text-saffron-500" /> Patna, Bihar, India</span>
          <span className="flex items-center gap-2"><Phone size={16} className="text-saffron-500" /> +91 00000 00000</span>
        </div>
      </main>
      <Footer />
    </div>
  )
}
