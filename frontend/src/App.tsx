import {Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AgendarPage from "./pages/AgendarPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage></LoginPage>} />
      <Route path="/register" element={<RegisterPage></RegisterPage>} />
      <Route
        path="/agendar"
        element={
          <ProtectedRoute>
            <AgendarPage></AgendarPage>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
