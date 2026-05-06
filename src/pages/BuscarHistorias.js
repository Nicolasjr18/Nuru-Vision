import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { generarPDFHistoria } from "../utils/generarPDFHistoria";
import { useNavigate } from "react-router-dom";

function BuscarHistorias() {
  const navigate = useNavigate();
  const irHome = () => navigate("/");

  const [historias, setHistorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarHistorias = async () => {
      const snap = await getDocs(collection(db, "historias"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistorias(data);
    };

    cargarHistorias();
  }, []);

  const historiasFiltradas = historias.filter(h =>
    `${h.paciente?.primerNombre || ""} ${h.paciente?.primerApellido || ""} ${h.paciente?.documento || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* HEADER BONITO */}
      <div style={styles.header}>
        <h2>🔍 BUSCAR HISTORIAS</h2>

        <button style={styles.btnHome} onClick={irHome}>
          🏠 Home
        </button>
      </div>

      <input
        style={styles.search}
        placeholder="Buscar por nombre o documento..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div style={styles.cardTable}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre del Paciente</th>
              <th style={styles.th}>Documento</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {historiasFiltradas.length > 0 ? (
              historiasFiltradas.map((h) => (
                <tr key={h.id} style={styles.tr}>
                  
                  <td style={styles.td}>
                    <div style={styles.nombre}>
                      {h.paciente?.primerApellido || ""}{" "}
                      {h.paciente?.segundoApellido || ""}{" "}
                      {h.paciente?.primerNombre || ""}{" "}
                      {h.paciente?.segundoNombre || ""}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.doc}>
                      {h.paciente?.tipoDocumento || ""} - {h.paciente?.documento || ""}
                    </div>
                  </td>

                  <td style={styles.td}>
                    {h.fecha || "-"}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.btnPDF}
                      onClick={() => generarPDFHistoria(h)}
                    >
                      PDF
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={styles.noData}>
                  No se encontraron historias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default BuscarHistorias;

/* ================= ESTILOS ================= */
const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial",
    background: "#f4f6f9"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    background: "linear-gradient(135deg,#1e3799,#4a69bd)",
    color: "white",
    padding: 15,
    borderRadius: 12
  },

  btnHome: {
    background: "#2d3436",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
  },

  search: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    marginBottom: 15,
    fontSize: 14
  },

  cardTable: {
    marginTop: 10,
    background: "white",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
  },

  th: {
    background: "#0a3d62",
    color: "white",
    padding: 12,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center"
  },

  tr: {
    borderBottom: "1px solid #ecf0f1"
  },

  td: {
    padding: 14,
    fontSize: 14,
    color: "#2d3436",
    textAlign: "center"
  },

  nombre: {
    fontWeight: "bold"
  },

  doc: {
    fontSize: 12,
    color: "#636e72"
  },

  noData: {
    textAlign: "center",
    padding: 20,
    color: "#636e72",
    fontStyle: "italic"
  },

  btnPDF: {
    background: "#0984e3",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  }
};