import { Routes, Route, Navigate, Link } from "react-router-dom";
import PaginaLog from "./paginas/PaginaLog.jsx";
import DisponibilidadPag from "./paginas/DisponibilidadPag.jsx";
import ReservasPag from "./paginas/ReservasPag.jsx";

function PrivateRoute({ children }) {
  return children;
}

function Nav() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
      <div className="container">
        <Link className="navbar-brand" to="/disponibilidad">Reservas</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="navContent" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/disponibilidad">Disponibilidad</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reservas">Reservas</Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function RootRedirect() {
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/disponibilidad" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div>
      <Nav />
      <div className="container py-3">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<PaginaLog />} />
          <Route
            path="/disponibilidad"
            element={
              <PrivateRoute>
                <DisponibilidadPag />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservas"
            element={
              <PrivateRoute>
                <ReservasPag />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}