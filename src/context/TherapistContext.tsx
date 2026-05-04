import { createContext, useContext, useState, type ReactNode } from 'react'

interface TherapistContextValue {
  selectedPatientId: string | null
  setSelectedPatientId: (id: string | null) => void
}

const TherapistContext = createContext<TherapistContextValue | null>(null)

export function TherapistProvider({ children }: { children: ReactNode }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  return (
    <TherapistContext.Provider value={{ selectedPatientId, setSelectedPatientId }}>
      {children}
    </TherapistContext.Provider>
  )
}

export function useTherapist() {
  const ctx = useContext(TherapistContext)
  if (!ctx) throw new Error('useTherapist must be used within TherapistProvider')
  return ctx
}
