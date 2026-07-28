import { useEffect, useRef, useState } from 'react';

// Coloque os arquivos gerados em public/media/:
//   upscaled-video.mp4 — o vídeo (H.264, ideal < 5MB, sem áudio)
//   bg-poster.jpg       — still exibido antes do vídeo carregar / se ele falhar
// Se os arquivos não existirem ainda, o layer simplesmente fica invisível
// e os blobs em .bg-blobs continuam servindo de fundo.
//
// Em telas pequenas ou conexão com "economia de dados" ligada, o vídeo
// não é baixado — fica só o poster estático como fundo, que é o mesmo
// frame então não há salto visual.
function shouldSkipVideo() {
  const saveData = navigator.connection?.saveData;
  const isNarrow = window.matchMedia('(max-width: 480px)').matches;
  return Boolean(saveData) || isNarrow;
}

export default function BackgroundVideo() {
  const videoRef = useRef(null);
  const [skipVideo] = useState(shouldSkipVideo);
  // Só busca o mp4 depois do `load` da página — assim ele não disputa banda
  // com fontes/JS/CSS críticos do primeiro paint.
  const [canLoadVideo, setCanLoadVideo] = useState(() => document.readyState === 'complete');

  useEffect(() => {
    if (canLoadVideo) return;
    const onLoad = () => setCanLoadVideo(true);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [canLoadVideo]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [canLoadVideo]);

  // O vídeo real já tem textura e cor de sobra; os blobs (.bg-blobs) eram só
  // um substituto para o blur ter algo atrás enquanto não havia mídia real.
  // Se o vídeo carrega, os blobs somem para não competir com ele.
  const handleLoaded = () => document.body.classList.add('has-bg-video');

  if (skipVideo || !canLoadVideo) {
    return (
      <div className="bg-video-wrap" aria-hidden="true">
        <img className="bg-video" src="/media/bg-poster.jpg" alt="" onLoad={handleLoaded} />
        <div className="bg-video-scrim" />
      </div>
    );
  }

  return (
    <div className="bg-video-wrap" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/media/bg-poster.jpg"
        onLoadedData={handleLoaded}
      >
        <source src="/media/upscaled-video.mp4" type="video/mp4" />
      </video>
      <div className="bg-video-scrim" />
    </div>
  );
}
