# Animación pulse-slow para hotspots

El componente usa `animate-pulse-slow`. Tailwind v4 no la trae por defecto.
Agregala en tu `src/index.css` (o donde tengas los estilos globales):

```css
@theme {
  --animate-pulse-slow: pulse-slow 2.5s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.08);
    opacity: 0.85;
  }
}
```

Si no querés la animación, borrá `animate-pulse-slow` del className en MapScreen.tsx.
