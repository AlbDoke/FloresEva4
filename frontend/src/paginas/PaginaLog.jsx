import { useState } from "react";

export default function PaginaLog() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Mandamos la seguridad al demonio: Inyectamos tokens falsos en el navegador
    localStorage.setItem("accessToken", "token_falso_para_saltar_seguridad");
    localStorage.setItem("refreshToken", "refresh_falso_para_saltar_seguridad");
    
    // Te redirijo inmediatamente a la página de disponibilidad
    window.location.href = "/disponibilidad";
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h4 mb-3">Login (Modo Bypass Activado)</h2>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  placeholder="Pon cualquier cosa aquí"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-control"
                  placeholder="Pon cualquier cosa aquí"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Forzar Entrada"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}