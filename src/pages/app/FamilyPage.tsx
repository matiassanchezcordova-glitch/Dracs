import { useNavigate } from 'react-router-dom'
import FamiliaTab from '../../components/familia/FamiliaTab'

export default function FamilyPage() {
  const navigate = useNavigate()
  return (
    <FamiliaTab
      onNavigateToEjercicio={() => navigate('/app/nino')}
      onNavigateToTerapeuta={() => navigate('/app/terapeuta')}
    />
  )
}
