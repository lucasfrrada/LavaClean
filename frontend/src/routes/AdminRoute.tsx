import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({children}: AdminRouteProps) {
  const {isAuthenticated, user} = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol !== "ADMINISTRADOR") {
    return <Navigate to="/" replace />;
  }

  return children;
}
