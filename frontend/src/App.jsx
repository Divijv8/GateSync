import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Users from './pages/Users.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import GateOperator from './pages/GateOperator.jsx'
import VisitorRegistration from './pages/VisitorRegistration.jsx'
import PassDetails from './pages/PassDetails.jsx'
import Blacklist from './pages/Blacklist.jsx'
import Reports from './pages/Reports.jsx'
import VisitorHistory from './pages/VisitorHistory.jsx'
import { useAuth } from './context/AuthContext.jsx'

// Add this component above App()
function HomeRedirect() {
  const { currentUser, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />
  if (currentUser.role === 'employee') return <Navigate to="/employee" replace />
  if (currentUser.role === 'gate_operator') return <Navigate to="/gate" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/blacklist" element={<Blacklist />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/register" element={<VisitorRegistration />} />
          <Route path="/history" element={<VisitorHistory />} />
          <Route path="/passes/:passId" element={<PassDetails />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin", "gate_operator"]} />}>
          <Route path="/gate" element={<GateOperator />} />
        </Route>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
