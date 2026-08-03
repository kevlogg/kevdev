import Navbar      from '@/components/layout/Navbar'
import Footer      from '@/components/layout/Footer'
import Hero        from '@/components/sections/Hero'
import Services    from '@/components/sections/Services'
import Projects    from '@/components/sections/Projects'
import Approach    from '@/components/sections/Approach'
import Contact     from '@/components/sections/Contact'
import ClientShell from '@/components/ui/ClientShell'

export default function Home() {
  return (
    <>
      <ClientShell />

      <div className="grain"    aria-hidden />
      <div className="vignette" aria-hidden />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <main>
          <Hero />
          <Services />
          <Projects />
          <Approach />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
