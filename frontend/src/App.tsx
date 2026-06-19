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
import PageTransition from "./components/PageTransition";
import AdminInventarioPage from "./pages/admin/AdminInventarioPage";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/"
        element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        }
      />
      <Route
        path="/login"
        element={
          <PageTransition>
            <LoginPage></LoginPage>
          </PageTransition>
        }
      />
      <Route
        path="/register"
        element={
          <PageTransition>
            <RegisterPage></RegisterPage>
          </PageTransition>
        }
      />

      {/* Rutas cliente */}
      <Route
        path="/agendar"
        element={
          <ProtectedRoute>
            <PageTransition>
              <AgendarPage></AgendarPage>
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-datos"
        element={
          <ProtectedRoute>
            <PageTransition>
              <PerfilPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <PageTransition>
              <PedidosPage />
            </PageTransition>
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
        <Route path="inventario" element={<AdminInventarioPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
