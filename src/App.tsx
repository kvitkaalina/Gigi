import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './components/NotFound';
import AdminRoute from './components/auth/AdminRoute';
import AdminPanel from './components/admin/AdminPanel';

const App: React.FC = () => {
  // Проверяем наличие токена
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={
          token ? <Navigate to="/" replace /> : <Register />
        } />
        <Route path="/login" element={
          token ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/forgot-password" element={
          token ? <Navigate to="/" replace /> : <ForgotPassword />
        } />
        <Route path="/reset-password/:token" element={
          token ? <Navigate to="/" replace /> : <ResetPassword />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        {/* Админский маршрут */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        
        {/* 404 страница для всех неизвестных маршрутов */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
