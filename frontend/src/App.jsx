import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1">
      <Navbar />
      {children}
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/teachers" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <Layout>
                <Teachers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/grades" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <Layout>
                <Grades />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;