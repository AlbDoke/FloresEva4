import { useState } from "react";
import api from "../api";

export default function PaginaLog() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/token/", { username, password });
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);
      window.location.href = "/disponibilidad";
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h4 mb-3">Login</h2>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-control"
                  placeholder="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}