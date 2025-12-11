import { useEffect, useState } from "react";
import api from "../api";

export default function ReservasPag() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    nombreCliente: "",
    telefono: "",
    fechaReserva: "",
    horaReserva: "",
    cantidadPersonas: "",
    estado: "RESERVADO",
    mesa: "",
    observacion: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await api.get("/api/reservas/");
      setItems(res.data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Error cargando reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (r) => {
    setEditItem(r);
    setEditError(null);
    setEditForm({
      nombreCliente: r.nombreCliente ?? "",
      telefono: r.telefono ?? "",
      fechaReserva: r.fechaReserva ?? "",
      horaReserva: r.horaReserva ?? "",
      cantidadPersonas: String(r.cantidadPersonas ?? ""),
      estado: r.estado ?? "RESERVADO",
      mesa: r.mesa ?? "",
      observacion: r.observacion ?? "",
    });
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditError(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editForm.nombreCliente) return setEditError("Ingresa el nombre del cliente");
    if (!editForm.telefono) return setEditError("Ingresa el teléfono");
    if (!editForm.fechaReserva) return setEditError("Selecciona la fecha");
    if (!editForm.horaReserva) return setEditError("Selecciona la hora");
    const cantidad = Number(editForm.cantidadPersonas);
    if (!cantidad || cantidad < 1 || cantidad > 15)
      return setEditError("La cantidad de personas debe estar entre 1 y 15");
    if (!editForm.mesa) return setEditError("Selecciona la mesa");

    const hora =
      editForm.horaReserva.length === 5 ? `${editForm.horaReserva}:00` : editForm.horaReserva;

    const body = {
      nombreCliente: editForm.nombreCliente,
      telefono: editForm.telefono,
      fechaReserva: editForm.fechaReserva,
      horaReserva: hora,
      cantidadPersonas: cantidad,
      estado: editForm.estado,
      mesa: editForm.mesa,
      observacion: editForm.observacion || "",
    };

    try {
      setSaving(true);
      await api.patch(`/api/reservas/${editItem.id}/`, body);
      setMsg("Reserva actualizada correctamente");
      closeEdit();
      load();
    } catch (err) {
      const data = err.response?.data;

      const fieldError =
        data?.cantidadPersonas?.[0] ||
        data?.cantidad_personas?.[0] ||
        data?.mesa?.[0] ||
        data?.fecha_reserva?.[0] ||
        data?.hora_reserva?.[0] ||
        data?.estado?.[0];

      setEditError(
        fieldError ||
          data?.non_field_errors?.[0] ||
          data?.detail ||
          (typeof data === "object" ? JSON.stringify(data) : "Error actualizando reserva")
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (r) => {
    setDeleteItem(r);
    setDeleteError(null);
  };

  const closeDelete = () => {
    setDeleteItem(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      await api.delete(`/api/reservas/${deleteItem.id}/`);
      setMsg("Reserva eliminada correctamente");
      closeDelete();
      load();
    } catch (err) {
      const data = err.response?.data;
      setDeleteError(
        data?.detail ||
          data?.non_field_errors?.[0] ||
          (typeof data === "object" ? JSON.stringify(data) : "Error eliminando la reserva")
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Reservas</h2>
      {loading && <div className="alert alert-info">Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Mesa</th>
              <th>Observación</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.nombreCliente}</td>
                <td>{r.telefono}</td>
                <td>{r.fechaReserva}</td>
                <td>{r.horaReserva}</td>
                <td>{r.cantidadPersonas}</td>
                <td>{r.estado}</td>
                <td>{r.mesa}</td>
                <td>{r.observacion || ""}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(r)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => openDelete(r)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={10} className="text-center">
                  No hay reservas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {}
      {editItem && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar reserva #{editItem.id}</h5>
                <button type="button" className="btn-close" onClick={closeEdit}></button>
              </div>
              <form onSubmit={saveEdit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nombre del cliente</label>
                      <input
                        className="form-control"
                        value={editForm.nombreCliente}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, nombreCliente: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        className="form-control"
                        value={editForm.telefono}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, telefono: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Fecha</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.fechaReserva}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, fechaReserva: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Hora</label>
                      <input
                        type="time"
                        className="form-control"
                        value={
                          editForm.horaReserva?.length === 8
                            ? editForm.horaReserva.slice(0, 5)
                            : editForm.horaReserva
                        }
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, horaReserva: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Personas</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        className="form-control"
                        value={editForm.cantidadPersonas}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, cantidadPersonas: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        value={editForm.estado}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, estado: e.target.value }))
                        }
                      >
                        <option value="RESERVADO">RESERVADO</option>
                        <option value="COMPLETADA">COMPLETADA</option>
                        <option value="ANULADA">ANULADA</option>
                        <option value="NO ASISTEN">NO ASISTEN</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Mesa (ID)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.mesa}
                        onChange={(e) => setEditForm((f) => ({ ...f, mesa: e.target.value }))}
                      />
                      <div className="form-text">
                        Ingresa el ID de la mesa asignada (ej: 1, 2, 3).
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observación</label>
                      <input
                        className="form-control"
                        value={editForm.observacion}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, observacion: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {editError && <div className="alert alert-danger mt-3">{editError}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEdit}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteItem && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar reserva #{deleteItem.id}</h5>
                <button type="button" className="btn-close" onClick={closeDelete}></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Seguro que deseas eliminar la reserva de{" "}
                  <strong>{deleteItem.nombreCliente}</strong> para la fecha{" "}
                  <strong>{deleteItem.fechaReserva}</strong> a las{" "}
                  <strong>{deleteItem.horaReserva}</strong>?
                </p>
                {deleteError && <div className="alert alert-danger">{deleteError}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeDelete} disabled={deleting}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}