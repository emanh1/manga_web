import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MangaUpload from '../pages/MangaUpload';
import AdminReview from '../pages/AdminReview';
import { Toaster } from 'react-hot-toast';
import MangaDetails from '../components/MangaDetails';
import Reader from '../components/Reader';
import PreviewReader from '../components/PreviewReader';
import Profile from '../pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manga/:mangaId" element={<MangaDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/manga/:mangaId/:chapterId" 
              element={
                  <Reader />
              }
            />
            <Route 
              path="/manga/:mangaId/:chapterId/preview" 
              element={
                <ProtectedRoute adminOnly>
                  <PreviewReader />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/upload/:mangaId?" 
              element={
                <ProtectedRoute>
                  <MangaUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/review" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminReview />
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
