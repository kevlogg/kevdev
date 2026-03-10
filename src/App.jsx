import StarBackground from './components/StarBackground'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import QueHago from './components/QueHago'
import Proyectos from './components/Proyectos'
import MiEnfoque from './components/MiEnfoque'
import ParaQuien from './components/ParaQuien'
import CTAFinal from './components/CTAFinal'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <StarBackground />
      <div className="relative z-10">
        <Navbar />
      <main>
        <Hero />
        <QueHago />
        <Proyectos />
        <MiEnfoque />
        <ParaQuien />
        <CTAFinal />
      </main>
      <Footer />
      </div>
    </>
  )
}
