// Cinta de ilustraciones propias. Se desplaza despacio; con movimiento
// reducido queda quieta y se puede recorrer con el dedo.

const N = 32

export default function Cinta() {
  const items = Array.from({ length: N }, (_, i) => `/landing/cinta/${String(i + 1).padStart(2, '0')}.webp`)
  return (
    <div className="ct" aria-label="Algunas de las 99 ilustraciones propias de Dracs" role="img">
      <div className="ct-track" aria-hidden="true">
        {[...items, ...items].map((src, i) => (
          <img key={i} src={src} alt="" width={200} height={200} loading="lazy" />
        ))}
      </div>
    </div>
  )
}
