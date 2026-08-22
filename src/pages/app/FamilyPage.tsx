import { useNavigate } from 'react-router-dom'
import CasaDeLaFamilia from '../../components/familia/home/CasaDeLaFamilia'

export default function FamilyPage() {
  const navigate = useNavigate()
  return (
    <CasaDeLaFamilia
      onNavigateToJugar={() => navigate('/app/nino')}
      onNavigateToPlace={id => navigate(`/app/nino/jugar/${id}`)}
      onNavigateToTerapeuta={() => navigate('/app/terapeuta')}
    />
  )
}
