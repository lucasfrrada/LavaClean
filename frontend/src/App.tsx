import {Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AgendarPage from "./pages/AgendarPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PerfilPage from "./pages/PerfilPage";
import PedidosPage from "./pages/PedidosPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminPrendasPage from "./pages/admin/AdminPrendasPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage></LoginPage>} />
      <Route path="/register" element={<RegisterPage></RegisterPage>} />

      {/* Rutas cliente */}
      <Route
        path="/agendar"
        element={
          <ProtectedRoute>
            <AgendarPage></AgendarPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-datos"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <PedidosPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas admin */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="clientes" element={<AdminUsersPage />} />
        <Route path="servicios" element={<AdminServicesPage />} />
        <Route path="prendas" element={<AdminPrendasPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
