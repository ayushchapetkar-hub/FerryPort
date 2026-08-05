import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import { authService } from "./services/dataService";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Schedules = lazy(() => import("./pages/Schedules"));
const BookTicket = lazy(() => import("./pages/BookTicket"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const LoginRegister = lazy(() => import("./pages/LoginRegister"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDataPage = lazy(() => import("./pages/admin/AdminDataPage"));

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => authService.getSession()?.user || null);

  useEffect(() => {
    if (!authService.getSession()?.token) return;
    authService.getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {
        authService.clearSession();
        setCurrentUser(null);
      });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    addToast("Logged out successfully.", "success");
  };

  return (
    <Router>
      <ScrollToTop />
      
      {/* Toast Alert Box */}
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar isLoggedIn={!!currentUser} currentUser={currentUser} onLogout={handleLogout} />

        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-[60vh] pt-32 text-center text-sm font-semibold text-slate-500">Loading FerryPort...</div>}>
            <Routes>
            <Route path="/" element={<Home addToast={addToast} />} />
            <Route path="/schedules" element={<Schedules addToast={addToast} />} />
            <Route element={<ProtectedRoute currentUser={currentUser} />}>
              <Route path="/book" element={<BookTicket addToast={addToast} />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/my-bookings" element={<MyBookings addToast={addToast} />} />
            </Route>
            <Route path="/login" element={<LoginRegister onLoginSuccess={handleLoginSuccess} addToast={addToast} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact addToast={addToast} />} />
            <Route element={<AdminRoute currentUser={currentUser} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard addToast={addToast} />} />
                <Route path="bookings" element={<AdminDataPage resource="bookings" addToast={addToast} />} />
                <Route path="users" element={<AdminDataPage resource="users" addToast={addToast} />} />
                <Route path="ferries" element={<AdminDataPage resource="ferries" addToast={addToast} editable />} />
                <Route path="routes" element={<AdminDataPage resource="routes" addToast={addToast} editable />} />
                <Route path="schedules" element={<AdminDataPage resource="schedules" addToast={addToast} editable />} />
                <Route path="payments" element={<AdminDataPage resource="payments" addToast={addToast} />} />
                <Route path="promotions" element={<AdminDataPage resource="promotions" addToast={addToast} editable />} />
                <Route path="contacts" element={<AdminDataPage resource="contacts" addToast={addToast} />} />
                <Route path="subscribers" element={<AdminDataPage resource="subscribers" addToast={addToast} />} />
                <Route path="logs" element={<AdminDataPage resource="logs" addToast={addToast} />} />
              </Route>
            </Route>
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
