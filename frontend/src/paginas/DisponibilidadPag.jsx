import { useState } from "react";
import api from "../api";

export default function DisponibilidadPag() {
  const [fechaReserva, setFechaReserva] = useState("");
  const [horaReserva, setHoraReserva] = useState("");
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [form, setForm] = useState({
    nombre_cliente: "",
    telefono: "",
    cantidad_personas: "",
    observacion: "",
  });
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);
  const consultar = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);
    setMesaSeleccionada(null);
    try {
      const res = await api.get("/api/disponibilidad/", {
        params: { fecha_reserva: fechaReserva, hora_reserva: horaReserva },
      });
      setMesas(res.data.mesasLibres || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Error consultando disponibilidad");
    } finally {
      setLoading(false);
    }
  };

  const abrirFormulario = (mesa) => {
    if (!fechaReserva || !horaReserva) {
      return alert("Selecciona fecha y hora antes de reservar.");
    }
    setMesaSeleccionada(mesa);
    setForm({
      nombre_cliente: "",
      telefono: "",
      cantidad_personas: "",
      observacion: "",
    });
    setErrorForm(null);
  };

  const crearReserva = async (e) => {
    e.preventDefault();
    setErrorForm(null);

    // aca esta las Validaciones
    if (!form.nombre_cliente) return setErrorForm("Ingresa el nombre del cliente");
    if (!form.telefono) return setErrorForm("Ingresa el teléfono");
    const cantidad = Number(form.cantidad_personas);
    if (!cantidad || cantidad < 1) return setErrorForm("Ingresa una cantidad válida de personas");
    if (!fechaReserva) return setErrorForm("Selecciona una fecha");
    if (!horaReserva) return setErrorForm("Selecciona una hora");

    const hora = horaReserva.length === 5 ? `${horaReserva}:00` : horaReserva;

    const body = {
      nombreCliente: form.nombre_cliente,
      telefono: form.telefono,
      fechaReserva: fechaReserva,
      horaReserva: hora,
      cantidadPersonas: cantidad,
      estado: "RESERVADO",
      mesa: mesaSeleccionada.id,
      observacion: form.observacion || "",
    };

    try {
      setCreando(true);
      await api.post("/api/reservas/", body);
      setMsg("Reserva creada correctamente");
      setMesaSeleccionada(null);
      consultar();
    } catch (err) {
      const data = err.response?.data;
      setErrorForm(
        data?.non_field_errors?.[0] ||
          data?.detail ||
          JSON.stringify(data) ||
          "Error creando reserva"
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Disponibilidad</h2>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3">
          <input
            type="date"
            className="form-control"
            value={fechaReserva}
            onChange={(e) => setFechaReserva(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <input
            type="time"
            className="form-control"
            value={horaReserva}
            onChange={(e) => setHoraReserva(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <button className="btn btn-primary w-100" onClick={consultar} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="row g-3">
        {mesas.map((m) => (
          <div key={m.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Mesa {m.numero}</h5>
                <p className="card-text">Capacidad: {m.capacidad}</p>
                <button className="btn btn-outline-primary" onClick={() => abrirFormulario(m)}>
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mesas.length === 0 && !loading && (
        <div className="alert alert-warning mt-3">No hay mesas libres para esa fecha/hora</div>
      )}

      {mesaSeleccionada && (
        <div className="card mt-4">
          <div className="card-body">
            <h3 className="h5 mb-3">Crear reserva para Mesa {mesaSeleccionada.numero}</h3>
            <form onSubmit={crearReserva} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Nombre del cliente</label>
                <input
                  className="form-control"
                  value={form.nombre_cliente}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre_cliente: e.target.value }))
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Cantidad de personas</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  max={15}
                  value={form.cantidad_personas}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cantidad_personas: e.target.value }))
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label">Observación (opcional)</label>
                <input
                  className="form-control"
                  value={form.observacion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observacion: e.target.value }))
                  }
                />
              </div>

              {errorForm && <div className="alert alert-danger">{errorForm}</div>}

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-success" type="submit" disabled={creando}>
                  {creando ? "Creando..." : "Confirmar reserva"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setMesaSeleccionada(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}