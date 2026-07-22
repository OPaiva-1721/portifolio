import Nav from './components/Nav.jsx';
import BackgroundVideo from './components/BackgroundVideo.jsx';
import Hero from './components/Hero.jsx';
import Sobre from './components/Sobre.jsx';
import Experiencia from './components/Experiencia.jsx';
import Projetos from './components/Projetos.jsx';
import Contato from './components/Contato.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <BackgroundVideo />
      <div className="bg-blobs" aria-hidden="true">
        <span className="blob blob-amber"></span>
        <span className="blob blob-mint"></span>
        <span className="blob blob-lilac"></span>
      </div>
      <Nav />
      <main>
        <Hero />
        <Sobre />
        <Experiencia />
        <Projetos />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
