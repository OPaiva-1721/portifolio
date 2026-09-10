import { lazy, Suspense, useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import BackgroundVideo from './components/BackgroundVideo.jsx';
import Hero from './components/Hero.jsx';
import Sobre from './components/Sobre.jsx';
import Experiencia from './components/Experiencia.jsx';
import Projetos from './components/Projetos.jsx';
import Contato from './components/Contato.jsx';
import Footer from './components/Footer.jsx';
import Curriculo from './components/Curriculo.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function routeFromHash() {
  const { hash } = window.location;
  if (hash === '#cv') return 'cv';
  if (hash === '#admin') return 'admin';
  return 'site';
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'cv') {
    return <Curriculo />;
  }

  if (route === 'admin') {
    return (
      <ErrorBoundary
        fallback={
          <div className="admin-loading mono">
            $ status: o painel quebrou ao renderizar. Recarregue a página — seu rascunho está salvo.
          </div>
        }
      >
        <Suspense fallback={<div className="admin-loading mono">carregando painel…</div>}>
          <AdminApp />
        </Suspense>
      </ErrorBoundary>
    );
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
        <ErrorBoundary>
          <Hero />
          <Sobre />
          <Experiencia />
          <Projetos />
          <Contato />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
