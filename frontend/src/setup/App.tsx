import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import TitleUpload from '../pages/TitleUpload';
import { Toaster } from 'react-hot-toast';
import TitleDetails from '../components/TitleDetails';
import Reader from '../components/reader/Reader';
import PreviewReader from '../components/PreviewReader';
import Profile from '../pages/Profile';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Settings from '../pages/Settings';
import AdminDashboard from '../pages/AdminDashboard';
import AboutUs from '../pages/AboutUs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/titles/:titleId" element={<TitleDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/titles/:titleId/:chapterId" 
              element={
                  <Reader />
              }
            />
            <Route 
              path="/titles/:titleId/:chapterId/preview" 
              element={
                <ProtectedRoute adminOnly>
                  <PreviewReader />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/upload/:titleId?" 
              element={
                <ProtectedRoute>
                  <TitleUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/profile/:uuid" 
              element={<Profile />} 
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            success: {
              className: 'bg-green-50 text-green-800 border border-green-200',
            },
            error: {
              className: 'bg-red-50 text-red-800 border border-red-200',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
