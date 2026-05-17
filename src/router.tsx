import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App'
import AppRedirect from './pages/app/AppRedirect'
import ChildPage from './pages/app/ChildPage'
import TherapistPage from './pages/app/TherapistPage'
import FamilyPage from './pages/app/FamilyPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route
        path="/app"
        element={<ProtectedRoute><App /></ProtectedRoute>}
      >
        <Route index element={<AppRedirect />} />
        <Route path="nino" element={<ChildPage />} />
        <Route path="terapeuta" element={<TherapistPage />} />
        <Route path="familia" element={<FamilyPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
