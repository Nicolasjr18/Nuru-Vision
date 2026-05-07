import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";
import { auth } from "../firebase";
import { query, where } from "firebase/firestore";

const VALOR_CONSULTA = 25000;

function Facturacion() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [documento, setDocumento] = useState("");
  const [pacienteSel, setPacienteSel] = useState(null);
  const [mostrarLista, setMostrarLista] = useState(false);

  const [form, setForm] = useState({
    descripcionLentes: "",
    valorGafas: "",
    abono: "",
    observaciones: ""
  });

  /* ================= CARGAR DATOS ================= */
  useEffect(() => {
    cargarPacientes();
    cargarCotizaciones();
  }, []);

  const cargarPacientes = async () => {
    const snap = await getDocs(collection(db, "pacientes"));
    setPacientes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

const cargarCotizaciones = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "cotizaciones"),
    where("ownerId", "==", user.uid)
  );

  const snap = await getDocs(q);

  setCotizaciones(
    snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  );
};

  /* ================= BUSCAR PACIENTE ================= */
  const buscarPaciente = () => {
    const paciente = pacientes.find(p => p.documento === documento);
    if (paciente) {
      setPacienteSel(paciente);
    } else {
      alert("Paciente no encontrado");
      setPacienteSel(null);
    }
  };

  /* ================= CÁLCULOS ================= */
  const valorGafas = Number(form.valorGafas) || 0;
  const abono = Number(form.abono) || 0;

  const descuentoConsulta = valorGafas > 0 ? VALOR_CONSULTA : 0;
  const totalCotizacion =
    valorGafas > 0
      ? valorGafas - VALOR_CONSULTA
      : VALOR_CONSULTA;

  const saldoPendiente = totalCotizacion - abono;

  /* ================= GENERAR PDF ================= */
  const generarPDF = (data) => {
    const doc = new jsPDF();

    // Logo
    try {
      doc.addImage(logo, "PNG", 15, 10, 30, 30);
    } catch (error) {
      console.warn("Error al cargar el logo:", error);
    }

    // Título
    doc.setFontSize(16);
    doc.text("COTIZACIÓN OPTOMÉTRICA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Fecha: ${data.fecha}`, 160, 30);

    // Datos del paciente
    autoTable(doc, {
      startY: 45,
      styles: { halign: "center" },
      head: [["DATOS DEL PACIENTE", ""]],
      body: [
        ["Nombre", data.nombre],
        ["Documento", data.documento],
        ["Teléfono", data.telefono],
      ],
    });

    // Descripción de lentes
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      styles: { halign: "center" },
      head: [["DESCRIPCIÓN DE LOS LENTES"]],
      body: [[data.descripcionLentes]],
    });

    // Valores
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      styles: { halign: "center" },
      head: [["CONCEPTO", "VALOR"]],
      body: [
        ["Valor Consulta", `$${data.valorConsulta.toLocaleString("es-CO")}`],
        ["Valor Gafas", `$${data.valorGafas.toLocaleString("es-CO")}`],
        ["Descuento Consulta", `-$${data.descuentoConsulta.toLocaleString("es-CO")}`],
        ["Total a Pagar", `$${data.total.toLocaleString("es-CO")}`],
        ["Abono", `$${data.abono.toLocaleString("es-CO")}`],
        ["Saldo Pendiente", `$${data.saldo.toLocaleString("es-CO")}`],
      ],
    });

    // Observaciones
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      styles: { halign: "center" },
      head: [["OBSERVACIONES"]],
      body: [[data.observaciones || "N/A"]],
    });

    // Información adicional
    doc.setFontSize(9);
    doc.text(
      "Cada fórmula incluye: Líquido limpia lentes + pañito + estuche.",
      105,
      doc.lastAutoTable.finalY + 10,
      { align: "center" }
    );

    doc.text(
      "La cotización está sujeta a disponibilidad de monturas y cambios según fórmula óptica.",
      105,
      doc.lastAutoTable.finalY + 18,
      { align: "center" }
    );

    doc.save(`Cotizacion_${data.nombre}.pdf`);
  };

  /* ================= GUARDAR COTIZACIÓN ================= */
  const guardarCotizacion = async () => {
    const user = auth.currentUser;
    if (!pacienteSel) {
      alert("Debe seleccionar un paciente.");
      return;
    }

    if (!form.descripcionLentes) {
      alert("Debe ingresar la descripción de los lentes.");
      return;
    }

    const data = {
      fecha: new Date().toLocaleDateString("es-CO"),
      nombre: `${pacienteSel.primerNombre} ${pacienteSel.primerApellido}`,
      documento: pacienteSel.documento,
      telefono: pacienteSel.telefono || "N/A",
      descripcionLentes: form.descripcionLentes,
      valorConsulta: VALOR_CONSULTA,
      valorGafas,
      descuentoConsulta,
      total: totalCotizacion,
      abono,
      saldo: saldoPendiente,
      observaciones: form.observaciones
    };

    await addDoc(collection(db, "cotizaciones"), {
  ...data,
  ownerId: user.uid
});
    generarPDF(data);
    cargarCotizaciones();

    alert("Cotización generada correctamente.");

    setForm({
      descripcionLentes: "",
      valorGafas: "",
      abono: "",
      observaciones: ""
    });
    setPacienteSel(null);
    setDocumento("");
  };

  return (
    <div style={styles.container}>
      {/* HEADER CON BOTÓN HOME */}
      <div style={styles.topBar}>
        <button style={styles.btnHome} onClick={() => navigate("/")}>
          🏠 HOME
        </button>
        <h2 style={styles.title}>💰 MÓDULO DE FACTURACIÓN</h2>
        <div style={{ width: 150 }}></div>
      </div>

      <button
        style={styles.toggleBtn}
        onClick={() => setMostrarLista(!mostrarLista)}
      >
        {mostrarLista ? "➕ Nueva Cotización" : "📄 Ver Cotizaciones"}
      </button>

      {/* FORMULARIO */}
      {!mostrarLista && (
        <div style={styles.card}>
          <h3>Datos del Paciente</h3>

          <input
            style={styles.input}
            placeholder="Documento del paciente"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />

          <button style={styles.button} onClick={buscarPaciente}>
            Buscar Paciente
          </button>

          {pacienteSel && (
            <div style={styles.info}>
              <p><b>Nombre:</b> {pacienteSel.primerNombre} {pacienteSel.primerApellido}</p>
              <p><b>Documento:</b> {pacienteSel.documento}</p>
              <p><b>Teléfono:</b> {pacienteSel.telefono || "N/A"}</p>
            </div>
          )}

          <textarea
            style={styles.textarea}
            placeholder="Descripción de los lentes"
            value={form.descripcionLentes}
            onChange={(e) =>
              setForm({ ...form, descripcionLentes: e.target.value })
            }
          />

          <input
            type="number"
            style={styles.input}
            placeholder="Valor de las gafas"
            value={form.valorGafas}
            onChange={(e) =>
              setForm({ ...form, valorGafas: e.target.value })
            }
          />

          <input
            type="number"
            style={styles.input}
            placeholder="Abono"
            value={form.abono}
            onChange={(e) =>
              setForm({ ...form, abono: e.target.value })
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
          />

          <div style={styles.resumen}>
            <p><b>Valor Consulta:</b> ${VALOR_CONSULTA.toLocaleString("es-CO")}</p>
            <p><b>Total a Pagar:</b> ${totalCotizacion.toLocaleString("es-CO")}</p>
            <p><b>Saldo Pendiente:</b> ${saldoPendiente.toLocaleString("es-CO")}</p>
          </div>

          <button style={styles.button} onClick={guardarCotizacion}>
            💾 Generar Cotización en PDF
          </button>
        </div>
      )}

      {/* LISTADO */}
      {mostrarLista && (
        <div style={styles.card}>
          <h3>📋 Cotizaciones Realizadas</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Documento</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.documento}</td>
                  <td>${c.total.toLocaleString("es-CO")}</td>
                  <td>
                    <button
                      style={styles.pdfBtn}
                      onClick={() => generarPDF(c)}
                    >
                      📄 PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Facturacion;

/* ================= ESTILOS ================= */
const styles = {
  container: {
    padding: 20,
    background: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Arial",
    textAlign: "center"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  btnHome: {
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
  },
  title: {
    flex: 1,
    textAlign: "center"
  },
  toggleBtn: {
    padding: 10,
    background: "#6c5ce7",
    color: "white",
    border: "none",
    borderRadius: 8,
    marginBottom: 15,
    cursor: "pointer"
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    maxWidth: 700,
    margin: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  button: {
    background: "#00b894",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 10,
    width: "100%"
  },
  info: {
    background: "#e3f2fd",
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  resumen: {
    marginTop: 10,
    fontWeight: "bold"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 15,
    textAlign: "center"
  },
  pdfBtn: {
    background: "#0984e3",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  }
};