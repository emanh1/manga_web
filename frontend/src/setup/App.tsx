import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Layout from "../components/Layout";
import Home from "../pages/Home";
import MangaDetails from "../components/MangaDetails";
import Reader from "../components/Reader";
import Login from "../pages/Login";
import Register from "../pages/Register";
import MangaUpload from "../pages/MangaUpload";
import AdminReview from "../pages/AdminReview";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

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
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
