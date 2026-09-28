import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DemoPage from './pages/DemoPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// La landing y /demo cargan al instante. La app (juegos, escritorio, familia,
// login) se descarga aparte, recién cuando alguien entra: así la web pública
// no carga los gráficos ni los juegos que no muestra.
const App = lazy(() => import('./App'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AppRedirect = lazy(() => import('./pages/app/AppRedirect'))
const MapScreen = lazy(() => import('./components/MapScreen'))
const HotspotSession = lazy(() => import('./components/HotspotSession'))
const TherapistPage = lazy(() => import('./pages/app/TherapistPage'))
const FamilyPage = lazy(() => import('./pages/app/FamilyPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route
          path="/app"
          element={<ProtectedRoute><App /></ProtectedRoute>}
        >
          <Route index element={<AppRedirect />} />
          <Route path="nino" element={<MapScreen />} />
          <Route path="nino/jugar/:hotspotId" element={<HotspotSession />} />
          <Route path="terapeuta" element={<TherapistPage />} />
          <Route path="familia" element={<FamilyPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
