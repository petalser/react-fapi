// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContextProvider";
import { useAuth } from "./hooks/useAuth";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Register from "./components/Register";

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Home /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Lobby />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/" replace /> : <Register />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}