import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container-page py-16 sm:py-24 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300 mb-3">About</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-pine-950 dark:text-parchment-50 mb-6">HimShakti Food Processing Unit</h1>
        <div className="space-y-5 text-pine-700 dark:text-parchment-200/80 leading-relaxed">
          <p>HimShakti is a family-run food processing unit based in the foothills of Uttarakhand. We process and sell raw honey, stone-ground spices, cold-pressed oils, and traditional snacks — made in small batches, using methods passed down across three generations.</p>
          <p>Everything we make is traceable to a specific batch, a specific source, and a specific harvest. We don't use artificial flavours, preservatives, or industrial processing equipment. What you buy is exactly what we made, packed by hand.</p>
          <p>This platform — Foodflow — is our first direct channel to customers. Previously, everything went through distributors. Now you can order directly from us on WhatsApp, and we'll handle delivery ourselves.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
