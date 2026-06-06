import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Funds from './pages/Funds';
import Charts from './pages/Charts';
import ChangePassword from './pages/ChangePassword';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
	  <Route path="/funds" element={<PrivateRoute><Funds /></PrivateRoute>} />
	  <Route path="/charts" element={<PrivateRoute><Charts /></PrivateRoute>} />
	  <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}