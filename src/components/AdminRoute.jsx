import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminRoute({ currentUser }) {
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (currentUser.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
