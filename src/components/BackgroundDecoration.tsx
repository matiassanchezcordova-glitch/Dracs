interface Props {
  variant?: 'default' | 'exercise' | 'therapist'
}

export default function BackgroundDecoration({ variant = 'default' }: Props) {
  const teal = variant === 'exercise' ? 0.12 : variant === 'therapist' ? 0.05 : 0.08
  const yellow = variant === 'exercise' ? 0.10 : variant === 'therapist' ? 0.03 : 0.06
  const line = variant === 'therapist' ? 0.04 : 0.06

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Blob 1 — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(11,175,190,${teal}) 0%, transparent 70%)`,
          animation: 'blobPulse1 8s ease-in-out infinite',
        }}
      />

      {/* Blob 2 — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(11,175,190,${teal}) 0%, transparent 70%)`,
          animation: 'blobPulse2 6s ease-in-out infinite 2s',
        }}
      />

      {/* Blob 3 — center-right (yellow accent) */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,217,61,${yellow}) 0%, transparent 70%)`,
          animation: 'blobPulse3 10s ease-in-out infinite',
        }}
      />

      {/* SVG decorative curves */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Curve 1: top-left → bottom-right */}
        <path
          d="M -100 200 C 200 100, 600 400, 1000 300 S 1400 600, 1600 700"
          fill="none"
          stroke={`rgba(11,175,190,${line})`}
          strokeWidth="1.5"
        />
        {/* Curve 2: top-right → center */}
        <path
          d="M 1500 -50 C 1200 100, 900 200, 600 400 S 200 500, 100 700"
          fill="none"
          stroke={`rgba(11,175,190,${line})`}
          strokeWidth="1.5"
        />
        {/* Curve 3: arc along the bottom */}
        <path
          d="M -50 800 C 300 750, 700 850, 1100 780 S 1400 820, 1500 900"
          fill="none"
          stroke={`rgba(11,175,190,${line})`}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
