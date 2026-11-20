import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LOGO_URL } from './data/services.ts';

// Render a true circular favicon from the uploaded crest image
function setRoundedFavicon(src: string) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Zoom slightly to fill the circular mask with the inner gold ring cleanly
    const scale = 1.28;
    const aspect = img.width / img.height;
    const drawHeight = size * scale;
    const drawWidth = drawHeight * aspect;
    const dx = (size - drawWidth) / 2;
    const dy = (size - drawHeight) / 2;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (existing) {
      existing.type = 'image/png';
      existing.href = canvas.toDataURL('image/png');
    }
  };
  img.src = src;
}

setRoundedFavicon(LOGO_URL);

createRoot(document.getElementById('root')!).render(<App />);
