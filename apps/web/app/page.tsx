import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import PriceTicker from '@/components/PriceTicker'
import Stats from '@/components/Stats'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import PriceTable from '@/components/PriceTable'
import ScannerSection from '@/components/ScannerSection'
import Partners from '@/components/Partners'
import Testimonials from '@/components/Testimonials'
import Cta from '@/components/Cta'
import Footer from '@/components/Footer'

export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PriceTicker />
        <Stats />
        <HowItWorks />
        <Features />
        <PriceTable />
        <ScannerSection />
        <Partners />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
