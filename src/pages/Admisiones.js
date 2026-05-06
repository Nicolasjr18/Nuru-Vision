import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc
} from "firebase/firestore";

function Admisiones() {
  const navigate = useNavigate();

  const [vista, setVista] = useState("lista"); // lista | form
  const [pacientes, setPacientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    tipoDocumento: "Cedula de ciudadania",
    documento: "",
    primerApellido: "",
    segundoApellido: "",
    primerNombre: "",
    segundoNombre: "",
    sexo: "",
    telefono: "",
    direccion: "",
    ocupacion: ""
  });
const pacientesFiltrados = pacientes.filter((p) => {
  const texto = (
    p.primerNombre +
    " " +
    p.primerApellido +
    " " +
    p.documento +
    " " +
    p.tipoDocumento
  )
    .toLowerCase()
    .trim();

  return texto.includes(busqueda.toLowerCase().trim());
});
  /* ================= CARGAR ================= */
  const cargar = async () => {
    const snap = await getDocs(collection(db, "pacientes"));
    setPacientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    cargar();
  }, []);

  const irHome = () => navigate("/");

  /* ================= LIMPIAR ================= */
  const limpiar = () => {
    setForm({
      tipoDocumento: "Cedula de ciudadania",
      documento: "",
      primerApellido: "",
      segundoApellido: "",
      primerNombre: "",
      segundoNombre: "",
      sexo: "",
      telefono: "",
      direccion: "",
      ocupacion: ""
    });
    setEditando(null);
  };

  /* ================= BUSCAR DUPLICADO ================= */
  const buscarPacienteExistente = async () => {
    if (!form.tipoDocumento || !form.documento) return;

    const q = query(
      collection(db, "pacientes"),
      where("tipoDocumento", "==", form.tipoDocumento),
      where("documento", "==", form.documento)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const existente = snap.docs[0].data();
      alert("⚠ Paciente ya existe, se cargó la información");

      setEditando(snap.docs[0]);
      setForm(existente);
    }
  };

  /* ================= GUARDAR ================= */
const guardar = async () => {
  if (!form.tipoDocumento || !form.documento) {
    alert("Debe ingresar tipo y documento");
    return;
  }

  if (editando) {
    await updateDoc(doc(db, "pacientes", editando.id), form);
    alert("✅ Paciente actualizado exitosamente");
  } else {
    await addDoc(collection(db, "pacientes"), form);
    alert("✅ Paciente creado exitosamente");
  }

  // Esto se ejecuta DESPUÉS de que el usuario cierre el alert
  limpiar();
  cargar();
  setVista("lista");
};

  /* ================= EDITAR ================= */
  const editar = (p) => {
    setEditando(p);
    setForm(p);
    setVista("form");
  };

  /* ================= ELIMINAR ================= */
  const eliminar = async (id) => {
    if (window.confirm("¿Eliminar paciente?")) {
      await deleteDoc(doc(db, "pacientes", id));
      cargar();
    }
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🏥 Admisiones - Pacientes</h2>
      </div>
<input
  placeholder="🔎 Buscar paciente..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  style={{
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    width: 250
  }}
/>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button style={styles.home} onClick={irHome}>🏠 Home</button>

        <h3>{vista === "lista" ? "Listado de Pacientes" : "Formulario Paciente"}</h3>

        <button
          style={styles.btnNew}
          onClick={() => {
            limpiar();
            setVista("form");
          }}
        >
          ➕ Crear Paciente
        </button>
      </div>

      {/* ================= LISTA ================= */}
{vista === "lista" && (
  <div style={styles.cardTable}>

    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Paciente</th>
          <th style={styles.th}>Documento</th>
          <th style={styles.th}>Sexo</th>
          <th style={styles.th}>Ocupacion</th>
          <th style={styles.th}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {pacientesFiltrados.map((p) => (
          <tr key={p.id} style={styles.tr}>
            <td style={styles.td}>
              <div style={styles.nombre}>
                {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido}
              </div>
            </td>

            <td style={styles.td}>
              {p.tipoDocumento} <br />
              <span style={styles.doc}>{p.documento}</span>
            </td>

            <td style={styles.td}>{p.sexo}</td>

            <td style={styles.td}>{p.ocupacion}</td>

            <td style={styles.td}>
              <div style={styles.acciones}>
                <button style={styles.btnEdit} onClick={() => editar(p)}>
                  ✏️ Editar
                </button>

                <button style={styles.btnDelete} onClick={() => eliminar(p.id)}>
                  🗑 Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>

    </table>

  </div>
)}

      {/* ================= FORM ================= */}
      {vista === "form" && (
        <div style={styles.formCard}>

          <div style={styles.grid}>

            <select
              style={styles.input}
              value={form.tipoDocumento}
              onChange={(e) => {
                setForm({ ...form, tipoDocumento: e.target.value });
              }}
              onBlur={buscarPacienteExistente}
            >
              <option>Cedula de ciudadania</option>
              <option>Tarjeta de identidad</option>
              <option>Registro civil</option>
            </select>

            <input
              style={styles.input}
              placeholder="Documento"
              value={form.documento}
              onChange={(e) =>
                setForm({ ...form, documento: e.target.value })
              }
              onBlur={buscarPacienteExistente}
            />

            <input style={styles.input} placeholder="Primer Apellido"
              value={form.primerApellido}
              onChange={e => setForm({ ...form, primerApellido: e.target.value })}
            />

            <input style={styles.input} placeholder="Segundo Apellido"
              value={form.segundoApellido}
              onChange={e => setForm({ ...form, segundoApellido: e.target.value })}
            />

            <input style={styles.input} placeholder="Primer Nombre"
              value={form.primerNombre}
              onChange={e => setForm({ ...form, primerNombre: e.target.value })}
            />

            <input style={styles.input} placeholder="Segundo Nombre"
              value={form.segundoNombre}
              onChange={e => setForm({ ...form, segundoNombre: e.target.value })}
            />

            <select
              style={styles.input}
              value={form.sexo}
              onChange={e => setForm({ ...form, sexo: e.target.value })}
            >
              <option value="">Sexo</option>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>

            <input style={styles.input} placeholder="Teléfono"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />

            <input style={styles.input} placeholder="Dirección"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
            />

            <input style={styles.input} placeholder="Ocupación"
              value={form.ocupacion}
              onChange={e => setForm({ ...form, ocupacion: e.target.value })}
            />

            <input style={styles.input} placeholder="Edad"
              value={form.Edad}
              onChange={e => setForm({ ...form, edad: e.target.value })}
            />

          </div>

          <div style={styles.actions}>
            <button style={styles.save} onClick={guardar}>
              💾 Guardar
            </button>

            <button style={styles.cancel} onClick={() => setVista("lista")}>
              Cancelar
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default Admisiones;

/* ================= ESTILOS ================= */
const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial",
    background: "#f4f6f9",
    minHeight: "100vh"
  },

  header: {
    background: "#0a3d62",
    color: "white",
    padding: 15,
    borderRadius: 10
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15
  },

  home: {
    background: "#2d3436",
    color: "white",
    padding: 10,
    borderRadius: 8,
    border: "none"
  },

  btnNew: {
    background: "#00b894",
    color: "white",
    padding: 10,
    borderRadius: 8,
    border: "none"
  },

  card: {
    marginTop: 20,
    background: "white",
    padding: 15,
    borderRadius: 10
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center"
  },

  formCard: {
    marginTop: 20,
    background: "white",
    padding: 20,
    borderRadius: 10
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },

  actions: {
    marginTop: 15,
    display: "flex",
    gap: 10,
    justifyContent: "center"
  },

  save: {
    background: "#0984e3",
    color: "white",
    padding: 10,
    borderRadius: 8,
    border: "none"
  },

  cancel: {
    background: "#636e72",
    color: "white",
    padding: 10,
    borderRadius: 8,
    border: "none"
  },

  /* ================= TABLA MEJORADA ================= */

  cardTable: {
    marginTop: 20,
    background: "white",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    overflowX: "auto"
  },

  th: {
    background: "#0a3d62",
    color: "white",
    padding: 12,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1
  },

  tr: {
    borderBottom: "1px solid #ecf0f1"
  },

  td: {
    padding: 14,
    fontSize: 14,
    color: "#2d3436"
  },

  nombre: {
    fontWeight: "bold",
    color: "#2d3436"
  },

  doc: {
    fontSize: 12,
    color: "#636e72"
  },

  acciones: {
    display: "flex",
    justifyContent: "center",
    gap: 8
  },

  btnEdit: {
    background: "#0984e3",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  },

  btnDelete: {
    background: "#d63031",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  }
};
