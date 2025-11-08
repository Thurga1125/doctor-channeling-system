import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import SignUp from './pages/SignUp';
import FindDoctors from './components/user/FindDoctors';
import DoctorDetails from './components/user/DoctorDetails';
import BookAppointment from './components/user/BookAppointment';
import MyAppointments from './components/user/MyAppointments';
import AdminDashboard from './components/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/doctors" element={<FindDoctors />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/book-appointment/:doctorId" 
                element={
                  <ProtectedRoute>
                    <BookAppointment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-appointments" 
                element={
                  <ProtectedRoute>
                    <MyAppointments />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
