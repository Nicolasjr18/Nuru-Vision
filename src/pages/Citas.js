import { useEffect, useState , useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {collection, addDoc, getDocs, deleteDoc, updateDoc, doc,query,where,orderBy} from "firebase/firestore";

function Citas() {
  const navigate = useNavigate();

  /* ================= ESTADOS ================= */
  const [citas, setCitas] = useState([]);
  const [documentoPaciente, setDocumentoPaciente] = useState("");
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [form, setForm] = useState({fecha: "",hora: "",motivo: "", lugar: "",});
  const [filtroEstado, setFiltroEstado] = useState("Todos");


   /* ================= FUNCIONES ================= */

 const generarHorarios = () => {
  const horarios = [];
  let hora = 8;

  while (hora < 19) {
    const horaFormateada = hora.toString().padStart(2, "0");

    horarios.push(`${horaFormateada}:00`);

    hora++;
  }

  return horarios;
};


  const cargarHorariosDisponibles = useCallback(async () => {
    if (!form.fecha) return;

    try {
      const todos = generarHorarios();

      const q = query(
        collection(db, "citas"),
        where("fecha", "==", form.fecha)
      );

      const snap = await getDocs(q);

      const ocupados = snap.docs.map((doc) => doc.data().hora);

      const disponibles = todos.filter(
        (hora) => !ocupados.includes(hora)
      );

      setHorariosDisponibles(disponibles);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    }
  }, [form.fecha]);

const [stats, setStats] = useState({
  hoy: 0,
  total: 0,
  proxima: null,
  cumplidas: 0,
  canceladas: 0,
  noAsistio: 0,
  confirmadas: 0,
  pendientes: 0,
});

const cargarCitas = async () => {
  const q = query(collection(db, "citas"), orderBy("fecha", "asc"));
  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setCitas(data);

  const hoy = new Date().toISOString().split("T")[0];

  const ahora = new Date();

  const futuras = data
  .map((c) => ({
    ...c,
    fechaHora: new Date(`${c.fecha}T${c.hora}`),
  }))
  .filter(
    (c) =>
      c.fechaHora > ahora &&
      (c.estado === "Pendiente" || !c.estado)
  )
  .sort((a, b) => a.fechaHora - b.fechaHora);


  setStats({
    hoy: data.filter(c => c.fecha === hoy).length,
    total: data.length,
    proxima: futuras[0] || null,

    pendientes: data.filter(c => (c.estado || "Pendiente") === "Pendiente").length,
    confirmadas: data.filter(c => c.estado === "Confirmada").length,
    finalizadas: data.filter(c => c.estado === "Finalizada").length,
    canceladas: data.filter(c => c.estado === "Cancelada").length,
    noAsistio: data.filter(c => c.estado === "No asistió").length,
  });
};

  /* ================= GUARDAR O EDITAR CITA ================= */

const validarDisponibilidad = async (fecha, hora) => {
  try {
    const q = query(
      collection(db, "citas"),
      where("fecha", "==", fecha),
      where("hora", "==", hora)
    );

    const snap = await getDocs(q);

    return snap.empty; // true = disponible
  } catch (error) {
    console.error("Error validando disponibilidad:", error);
    return false;
  }
};

const guardarCita = async (e) => {
  e.preventDefault();

  if (!pacienteEncontrado) {
    alert("Debe seleccionar un paciente");
    return;
  }

  if (!form.fecha || !form.hora || !form.lugar) {
    alert("Complete los campos obligatorios");
    return;
  }

  const disponible = await validarDisponibilidad(form.fecha, form.hora);

  if (!disponible && !editandoId) {
    alert("⚠️ Ya existe una cita en ese horario");
    return;
  }

  try {
    const datosCita = {
      pacienteId: pacienteEncontrado.id,
      pacienteNombre: pacienteEncontrado.primerNombre,
      pacienteApellido: pacienteEncontrado.primerApellido,
      documento: pacienteEncontrado.documento,
      telefono: pacienteEncontrado.telefono || "",
      sexo: pacienteEncontrado.sexo,
      fecha: form.fecha,
      hora: form.hora,
      motivo: form.motivo,
      lugar: form.lugar,
      createdAt: new Date(),
    };

    if (!editandoId) {
      datosCita.estado = "Pendiente";
    }

    if (editandoId) {
      await updateDoc(doc(db, "citas", editandoId), datosCita);
      alert("Cita actualizada correctamente");
    } else {
      await addDoc(collection(db, "citas"), datosCita);
      alert("Cita agendada correctamente");
    }

    limpiarFormulario();
    cargarCitas();
  } catch (error) {
    console.error("Error al guardar la cita:", error);
  }
};


  /* ================= EFFECTS ================= */

  useEffect(() => {
    cargarCitas();
  }, []);

  useEffect(() => {
    if (!form.fecha) return;

    setForm((prev) => ({
      ...prev,
      hora: "",
    }));

    cargarHorariosDisponibles();
  }, [form.fecha, cargarHorariosDisponibles]);

  /* ================= BUSCAR PACIENTE ================= */
  const buscarPaciente = async () => {
    if (!documentoPaciente.trim()) {
      alert("Ingrese el documento del paciente");
      return;
    }

    try {
      const q = query(
        collection(db, "pacientes"),
        where("documento", "==", documentoPaciente.trim())
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();

        const paciente = {
          id: snap.docs[0].id,
          primerNombre: data.primerNombre || "",
          segundoNombre: data.segundoNombre || "",
          primerApellido: data.primerApellido || "",
          segundoApellido: data.segundoApellido || "",
          documento: data.documento || "",
          telefono: data.telefono || "",
          sexo: data.sexo || "",
        };

        setPacienteEncontrado(paciente);
      } else {
        alert("Paciente no encontrado");
        setPacienteEncontrado(null);
      }
    } catch (error) {
      console.error("Error al buscar paciente:", error);
    }
  };



  /* ================= EDITAR CITA ================= */
  const editarCita = (cita) => {
    setEditandoId(cita.id);

    setPacienteEncontrado({
      id: cita.pacienteId,
      primerNombre: cita.pacienteNombre,
      primerApellido: cita.pacienteApellido,
      documento: cita.documento,
      telefono: cita.telefono,
      sexo: cita.sexo,
    });

    setDocumentoPaciente(cita.documento);

    setForm({
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo,
      lugar: cita.lugar,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= ELIMINAR CITA ================= */
  const eliminarCita = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta cita?")) {
      await deleteDoc(doc(db, "citas", id));
      cargarCitas();
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
  try {
    await updateDoc(doc(db, "citas", id), {
      estado: nuevoEstado,
    });

    cargarCitas();
  } catch (error) {
    console.error("Error cambiando estado:", error);
  }
};

  /* ================= ENVIAR WHATSAPP ================= */
  const enviarWhatsApp = (cita) => {
    let telefono = cita.telefono || "";

    if (!telefono) {
      alert("El paciente no tiene un número de teléfono registrado.");
      return;
    }

    telefono = telefono.toString().replace(/\D/g, "");

    if (!telefono.startsWith("57")) {
      telefono = `57${telefono}`;
    }

    const mensaje = `Hola ${cita.pacienteNombre} ${cita.pacienteApellido}, AndreBot le recuerda su cita de optometría.

Fecha: ${cita.fecha}
Hora: ${cita.hora}
Lugar: ${cita.lugar}

Por favor, llegue con 10 minutos de anticipación.
Nuru Vision Óptica.`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
  };

  /* ================= LIMPIAR FORMULARIO ================= */
  const limpiarFormulario = () => {
    setEditandoId(null);
    setPacienteEncontrado(null);
    setDocumentoPaciente("");
    setForm({
      fecha: "",
      hora: "",
      motivo: "",
      lugar: "",
    });
  };

  const irHome = () => navigate("/");

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>📅 MÓDULO DE CITAS</h2>
      </div>


{/* DASHBOARD */}
<div style={styles.dashboard}>

  <div style={styles.cardStat}>
    <h4>📅 Hoy</h4>
    <p>{stats.hoy}</p>
  </div>

  <div style={styles.cardStat}>
    <h4>📊 Total</h4>
    <p>{stats.total}</p>
  </div>

  <div style={styles.cardProxima}>
    <h4>⏳ Próxima cita</h4>

    {stats.proxima ? (
      <>
        <p style={styles.nombreProxima}>
          {stats.proxima.pacienteNombre} {stats.proxima.pacienteApellido}
        </p>

        <p style={styles.detalleProxima}>
          {stats.proxima.fecha} - {stats.proxima.hora}
        </p>
      </>
    ) : (
      <p>Sin citas programadas</p>
    )}
  </div>

  <div style={styles.cardStat}>
    <h4>Citas Pendientes</h4>
    <p>{stats.pendientes}</p>
  </div>

  <div style={styles.cardStat}>
    <h4>Citas Confirmadas</h4>
    <p>{stats.confirmadas}</p>
  </div>

  <div style={styles.cardStat}>
    <h4>Citas Finalizadas</h4>
    <p>{stats.finalizadas}</p>
  </div>

  <div style={styles.cardStat}>
    <h4>Citas Canceladas</h4>
    <p>{stats.canceladas}</p>
  </div>

  <div style={styles.cardStat}>
    <h4>No asistió</h4>
    <p>{stats.noAsistio}</p>
  </div>

</div>


      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button style={styles.btnHome} onClick={irHome}>
          🏠 Home
        </button>
        <div style={{ width: 80 }}></div>
      </div>

      {/* BUSCAR PACIENTE */}
      <div style={styles.burbujaAzul}>
        <h3>🔎 Buscar Paciente</h3>

        <input
          type="number"
          placeholder="Ingrese el documento"
          style={styles.input}
          value={documentoPaciente}
          onChange={(e) => setDocumentoPaciente(e.target.value)}
        />

        <button style={styles.btnBuscar} onClick={buscarPaciente}>
          Buscar Paciente
        </button>

        {pacienteEncontrado && (
          <div style={styles.infoPaciente}>
            <p>
              <strong>Nombre:</strong>{" "}
              {pacienteEncontrado.primerNombre}{" "}
              {pacienteEncontrado.segundoNombre}
            </p>
            <p>
              <strong>Apellidos:</strong>{" "}
              {pacienteEncontrado.primerApellido}{" "}
              {pacienteEncontrado.segundoApellido}
            </p>
            <p>
              <strong>Documento:</strong>{" "}
              {pacienteEncontrado.documento}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              {pacienteEncontrado.telefono || "No registrado"}
            </p>
            <p>
              <strong>Sexo:</strong> {pacienteEncontrado.sexo}
            </p>
          </div>
        )}
      </div>

      {/* FORMULARIO */}
      {pacienteEncontrado && (
        <div style={styles.card}>
          <h3>
            {editandoId ? "✏️ Editar Cita" : "➕ Agendar Nueva Cita"}
          </h3>

          <form onSubmit={guardarCita}>
            <input
              type="date"
              style={styles.input}
              value={form.fecha}
              onChange={(e) =>
                setForm({ ...form, fecha: e.target.value })
              }
              required
            />


            <input
              type="text"
              placeholder="Lugar de la cita"
              style={styles.input}
              value={form.lugar}
              onChange={(e) =>
                setForm({ ...form, lugar: e.target.value })
              }
              required
            />




            <select
  style={styles.input}
  value={form.hora}
  onChange={(e) =>
    setForm({ ...form, hora: e.target.value })
  }
  required
>
  <option value="">Seleccione hora</option>

  {horariosDisponibles.map((hora) => (
    <option key={hora} value={hora}>
      {hora}
    </option>
  ))}
</select>

            <textarea
              placeholder="Motivo de la cita"
              style={styles.textarea}
              value={form.motivo}
              onChange={(e) =>
                setForm({ ...form, motivo: e.target.value })
              }
            />

            <button type="submit" style={styles.btnGuardar}>
              {editandoId ? "Actualizar Cita" : "Agendar Cita"}
            </button>

            {editandoId && (
              <button
                type="button"
                style={styles.btnCancelar}
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>
      )}

      {/* LISTADO DE CITAS */}
      <div style={styles.card}>

        <div style={styles.filtros}>
  <select
    value={filtroEstado}
    onChange={(e) => setFiltroEstado(e.target.value)}
    style={styles.selectFiltro}
  >
    <option value="Todos">Todas</option>
    <option value="Pendiente">Pendiente</option>
    <option value="Confirmada">Confirmada</option>
    <option value="Finalizada">Finalizada</option>
    <option value="Cancelada">Cancelada</option>
    <option value="No asistió">No asistió</option>
  </select>
</div>
        <h3>📋 Citas Programadas</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Paciente</th>
              <th style={styles.th}>Documento</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Hora</th>
              <th style={styles.th}>Lugar</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
            <tbody>
          {citas
          .filter((cita) =>
            filtroEstado === "Todos"
              ? true
              : (cita.estado || "Pendiente") === filtroEstado
          )
          .map((cita) => (

    <tr key={cita.id}>
      <td style={styles.td}>
        {cita.pacienteNombre} {cita.pacienteApellido}
      </td>

      <td style={styles.td}>{cita.documento}</td>

      <td style={styles.td}>
        {cita.telefono || "No registrado"}
      </td>

      <td style={styles.td}>{cita.fecha}</td>

      <td style={styles.td}>{cita.hora}</td>

      <td style={styles.td}>{cita.lugar}</td>

      {/* ESTADO */}
            <td style={styles.td}>
  <select
    value={cita.estado || "Pendiente"}
    onChange={(e) =>
      cambiarEstado(cita.id, e.target.value)
    }
    style={{
      ...styles.selectEstado,
      ...styles[`estado_${(cita.estado || "Pendiente").replace(" ", "")}`],
    }}
  >
    <option value="Pendiente">Pendiente</option>
    <option value="Confirmada">Confirmada</option>
    <option value="Finalizada">Finalizada</option>
    <option value="Cancelada">Cancelada</option>
    <option value="No asistió">No asistió</option>
  </select>
</td>


      {/* ACCIONES */}
      <td style={styles.td}>
        <div style={styles.acciones}>
          <button
            style={styles.btnEditar}
            onClick={() => editarCita(cita)}
          >
            Editar
          </button>

          <button
            style={styles.btnEliminar}
            onClick={() => eliminarCita(cita.id)}
          >
            Eliminar
          </button>

          <button
            style={styles.btnWhatsapp}
            onClick={() => enviarWhatsApp(cita)}
          >
           WhatsApp
          </button>
        </div>
      </td>
    </tr>
  ))}

  {citas.length === 0 && (
    <tr>
      <td colSpan="8" style={styles.empty}>
        No hay citas registradas
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
}

export default Citas;

/* ================= ESTILOS ================= */
const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    background: "linear-gradient(135deg,#1e3799,#4a69bd)",
    color: "white",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: "1000px",
    textAlign: "center",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1000px",
    marginTop: 15,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  btnHome: {
    background: "#2d3436",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
  },
  card: {
    background: "white",
    padding: 25,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    maxWidth: "1000px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  burbujaAzul: {
    background: "#e3f2fd",
    borderLeft: "6px solid #1e88e5",
    padding: 25,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    maxWidth: "1000px",
    textAlign: "center",
  },
  input: {
    width: "80%",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    textAlign: "center",
  },
  textarea: {
    width: "80%",
    minHeight: 80,
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  btnBuscar: {
    background: "#1e88e5",
    color: "white",
    border: "none",
    padding: "10px 25px",
    borderRadius: 8,
    marginTop: 10,
    cursor: "pointer",
  },
  btnGuardar: {
    background: "#00b894",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    cursor: "pointer",
    width: "60%",
    fontWeight: "bold",
  },
  btnCancelar: {
    background: "#636e72",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 10,
    cursor: "pointer",
  },
  btnEditar: {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
},
btnEliminar: {
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
},
btnWhatsapp: {
  background: "#25D366",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: "bold",
},
  infoPaciente: {
    marginTop: 15,
    background: "#ffffff",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #bbdefb",
    lineHeight: 1.8,
  },
  table: {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 15,
  tableLayout: "fixed", 
},
th: {
  backgroundColor: "#1e3799",
  color: "white",
  padding: 12,
  fontSize: 14,
},
td: {
  padding: 10,
  borderBottom: "1px solid #ddd",
  textAlign: "center",
  wordWrap: "break-word", 
},
  empty: {
    textAlign: "center",
    padding: 15,
    color: "#636e72",
  },

selectEstado: {
  padding: "6px 10px",
  borderRadius: 20,
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  appearance: "none",
  textAlign: "center",
  minWidth: "100px",
},

acciones: {
  display: "flex",
  justifyContent: "center",
  gap: 6,
  flexWrap: "wrap",
},

badge: {
  padding: "6px 10px",
  borderRadius: 20,
  fontWeight: "bold",
  fontSize: 12,
  cursor: "pointer",
  display: "inline-block",
},

estado_Pendiente: {
  background: "#ffeaa7",
  color: "#b7791f",
},

estado_Confirmada: {
  background: "#d4edda",
  color: "#155724",
},

estado_Finalizada: {
  background: "#cce5ff",
  color: "#004085",
},

estado_Cancelada: {
  background: "#f8d7da",
  color: "#721c24",
},

estado_Noasistió: {
  background: "#2d3436",
  color: "#fff",
},
filtros: {
  display: "flex",
  justifyContent: "flex-end",
  width: "100%",
  marginBottom: 10,
},
selectFiltro: {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  cursor: "pointer",
  minWidth: 160,
},

dashboard:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))",
  gap:15,
  marginTop:20,
  width:"100%",
  maxWidth:"1000px",
},

cardStat:{
  background:"white",
  padding:15,
  borderRadius:12,
  textAlign:"center",
  boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
},
cardProxima:{
  gridColumn:"span 2",
  background:"linear-gradient(135deg,#1e3799,#4a69bd)",
  color:"white",
  padding:20,
  borderRadius:12,
  textAlign:"center",
  boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
},
nombreProxima:{
  fontSize:18,

  marginTop:10,
},

detalleProxima:{
  fontSize:14,
  opacity:0.9,
},

};