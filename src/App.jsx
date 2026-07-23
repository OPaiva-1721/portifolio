import { useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import BackgroundVideo from './components/BackgroundVideo.jsx';
import Hero from './components/Hero.jsx';
import Sobre from './components/Sobre.jsx';
import Experiencia from './components/Experiencia.jsx';
import Projetos from './components/Projetos.jsx';
import Contato from './components/Contato.jsx';
import Footer from './components/Footer.jsx';
import Curriculo from './components/Curriculo.jsx';

export default function App() {
  const [isCv, setIsCv] = useState(() => window.location.hash === '#cv');

  useEffect(() => {
    const onHashChange = () => setIsCv(window.location.hash === '#cv');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (isCv) {
    return <Curriculo />;
  }

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
