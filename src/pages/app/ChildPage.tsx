import { useNavigate } from 'react-router-dom'
import ExerciseTab from '../../components/ExerciseTab'

export default function ChildPage() {
  const navigate = useNavigate()
  return (
    <ExerciseTab
      onNavigateToFamilia={() => navigate('/app/familia')}
      onNavigateToTerapeuta={() => navigate('/app/terapeuta')}
      onRequestAuth={() => navigate('/login?role=child')}
    />
  )
}
