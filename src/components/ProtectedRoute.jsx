import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ currentUser }) {
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
