import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { generarPDFHistoria } from "../utils/generarPDFHistoria";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { query, where } from "firebase/firestore";




const initialForm = {
    fecha: new Date().toISOString().split("T")[0],
    usaGafas: "",
    lateralidad: "",
    embarazo: "",
    trimestre: "",
    motivoConsulta: "",
    antecedentesFamiliares: "",
    antecedentesPersonales: "",
    antecedentesOculares: "",

    agudezaAngular: false,
    agudezaMorfoscopia: false,

    visionLejana: {
      oiSin: "", oiCon: "", oiPh: "",
      odSin: "", odCon: "", odPh: "",
      aoSin: "", aoCon: "", aoPh: ""
    },

    visionProxima: {
      oiSin: "", oiCon: "",
      odSin: "", odCon: "",
      aoSin: "", aoCon: ""
    },

    distanciaNasopupilar: {
      vlOD: "", vlOI: "",
      vpOD: "", vpOI: ""
    },

    distanciaInterpupilar: {
      vl: "",
      vp: ""
    },

    ojoDominante: "",
    anguloKappa: { od: "", oi: "" },
    hirschberg: { sc: "", cc: "" },
    coverTestVL: { sc: "", cc: "" },
    coverTestVP: { sc: "", cc: "" },

    tecnicaRetinoscopia: "",
    retinoscopia: {
      oiValor: "", oiAV: "",
      odValor: "", odAV: "",
      observaciones: ""
    },

    tecnicaSubjetivo: "",
   subjetivo: {
  oiValor: "", oiAV: "",
  odValor: "", odAV: ""         
              },


    adicion: {
  oi: "",
  od: ""
            },

    oftalmoscopia: {
      oi: "",
      od: "",
      observaciones: ""
    },

    observaciones: ""
  };


function Historias() {
  const navigate = useNavigate();


  const irHome = () => {
  setPacienteSel(null);
  setForm(JSON.parse(JSON.stringify(initialForm)));
  setHistoriaGuardadaId(null);

  navigate("/");
};
  
  
  const [pacienteSel, setPacienteSel] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [historiaGuardadaId, setHistoriaGuardadaId] = useState(null);
  const [form, setForm] = useState(initialForm);
  


useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const q = query(
      collection(db, "pacientes"),
      where("ownerId", "==", user.uid)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setPacientes(data);
  });

  return () => unsubscribe();
}, []);


  const pacientesFiltrados = pacientes.filter(p =>
    `${p.primerNombre} ${p.primerApellido} ${p.documento}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );
  
  const seleccionarPaciente = (p) => {
  setPacienteSel(p);
};

  const resetPaciente = () => {
    setPacienteSel(null);
    setForm(JSON.parse(JSON.stringify(initialForm)));
    setHistoriaGuardadaId(null);
  };

const guardarHistoria = async () => {
  if (!pacienteSel) {
    alert("⚠️ Debes seleccionar un paciente");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    alert("⚠️ Debes iniciar sesión");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "historias"), {
      ownerId: user.uid,
      pacienteId: pacienteSel.id,
      paciente: pacienteSel,
      ...form,
      createdAt: new Date()
    });

    setHistoriaGuardadaId(docRef.id);
    alert("Historia clínica guardada correctamente");
  } catch (error) {
    console.error(error);
    alert("Error al guardar la historia");
  }
};


  const actualizarCampo = (seccion, campo, valor) => {
    setForm(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const actualizarVisionLejana = (campo, valor) => {
    setForm(prev => ({
      ...prev,
      visionLejana: {
        ...prev.visionLejana,
        [campo]: valor
      }
    }));
  };

  const actualizarVisionProxima = (campo, valor) => {
    setForm(prev => ({
      ...prev,
      visionProxima: {
        ...prev.visionProxima,
        [campo]: valor
      }
    }));
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>📋 HISTORIA CLÍNICA</h2>
      </div>

      {/* TOP BAR */}
      <div style={styles.topBar}>
  <button style={styles.btnHome} onClick={irHome}>
    🏠 Home
  </button>
</div>
        {pacienteSel && (
          <button style={styles.btnBack} onClick={resetPaciente}>
            ⬅ Cambiar paciente
          </button>
        )}


      {/* LISTA PACIENTES */}
{!pacienteSel && (
  <div style={styles.panel}>
    <input
      style={styles.search}
      placeholder="🔍 Buscar paciente por nombre o documento..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />

    <div style={styles.cardTable}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre del Paciente</th>
            <th style={styles.th}>Documento</th>
            <th style={styles.th}>Sexo</th>
            <th style={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.nombre}>
                    {p.primerApellido} {p.segundoApellido}{" "}
                    {p.primerNombre} {p.segundoNombre}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.doc}>
                    {p.tipoDocumento} - {p.documento}
                  </div>
                </td>
                <td style={styles.td}>{p.sexo}</td>
                <td style={styles.td}>
                  <button
                    style={styles.btnSelect}
                    onClick={() => seleccionarPaciente(p)}
                  >
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={styles.noData}>
                No se encontraron pacientes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {pacienteSel && (
        <>
          {/* FICHA DEL PACIENTE */}
          <div style={styles.ficha}>
            <h3>📌 FICHA DEL PACIENTE</h3>
            <div style={styles.gridInfo}>
              <div><b>Nombres:</b> {pacienteSel.primerNombre} {pacienteSel.segundoNombre}</div>
              <div><b>Apellidos:</b> {pacienteSel.primerApellido} {pacienteSel.segundoApellido}</div>
              <div><b>Documento:</b> {pacienteSel.tipoDocumento} - {pacienteSel.documento}</div>
              <div><b>Sexo:</b> {pacienteSel.sexo}</div> <div><b>Edad:</b> {pacienteSel.edad}</div>
              <div><b>Ocupacion:</b> {pacienteSel.ocupacion || "No registrada"}</div>
            </div>
          </div>

          <div style={styles.historia}>
            <Seccion titulo="ANAMNESIS">
              <Campo label="Fecha de atención">
                <input
                  type="date"
                  style={styles.input}
                  value={form.fecha}
                  onChange={(e) =>
                    setForm({ ...form, fecha: e.target.value })
                  }
                />
              </Campo>

              <Campo label="¿Ha usado gafas?">
                <RadioGroup
                  opciones={["Si", "No"]}
                  valor={form.usaGafas}
                  onChange={(v) => setForm({ ...form, usaGafas: v })}
                />
              </Campo>

              <Campo label="Lateralidad">
                <select
                  style={styles.input}
                  value={form.lateralidad}
                  onChange={(e) =>
                    setForm({ ...form, lateralidad: e.target.value })
                  }
                >
                  <option value="">Seleccione</option>
                  <option>Diestro</option>
                  <option>Zurdo</option>
                  <option>Ambidiestro</option>
                </select>
              </Campo>

              {pacienteSel.sexo === "Femenino" && (
                <>
                  <Campo label="¿Está embarazada?">
                    <RadioGroup
                      opciones={["Si", "No"]}
                      valor={form.embarazo}
                      onChange={(v) =>
                        setForm({ ...form, embarazo: v })
                      }
                    />
                  </Campo>

                  {form.embarazo === "Si" && (
                    <Campo label="Trimestre">
                      <RadioGroup
                        opciones={["1", "2", "3"]}
                        valor={form.trimestre}
                        onChange={(v) =>
                          setForm({ ...form, trimestre: v })
                        }
                      />
                    </Campo>
                  )}
                </>
              )}

              <Campo label="Motivo de consulta">
                <textarea
                  style={styles.textarea}
                  value={form.motivoConsulta}
                  onChange={(e) =>
                    setForm({ ...form, motivoConsulta: e.target.value })
                  }
                />
              </Campo>

              <Campo label="Antecedentes familiares">
                <textarea
                  style={styles.textarea}
                  value={form.antecedentesFamiliares}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      antecedentesFamiliares: e.target.value
                    })
                  }
                />
              </Campo>

              <Campo label="Antecedentes personales">
                <textarea
                  style={styles.textarea}
                  value={form.antecedentesPersonales}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      antecedentesPersonales: e.target.value
                    })
                  }
                />
              </Campo>

              <Campo label="Antecedentes oculares">
                <textarea
                  style={styles.textarea}
                  value={form.antecedentesOculares}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      antecedentesOculares: e.target.value
                    })
                  }
                />
              </Campo>
            </Seccion>

            <Seccion titulo="👁️ AGUDEZA VISUAL">
              <label>
                <input
                  type="checkbox"
                  checked={form.agudezaAngular}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      agudezaAngular: e.target.checked
                    })
                  }
                /> Angular
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.agudezaMorfoscopia}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      agudezaMorfoscopia: e.target.checked
                    })
                  }
                /> Morfoscopía
              </label>
            </Seccion>

            <TablaVision
              titulo="🔭 VISIÓN LEJANA"
              columnas={["SIN CORRECCIÓN", "CON CORRECCIÓN", "PH"]}
              datos={form.visionLejana}
              actualizar={actualizarVisionLejana}
              incluirPH
            />

            <TablaVision
              titulo="📖 VISIÓN PRÓXIMA"
              columnas={["SIN CORRECCIÓN", "CON CORRECCIÓN"]}
              datos={form.visionProxima}
              actualizar={actualizarVisionProxima}
            />

            <Seccion titulo="📏 DISTANCIA NASOPUPILAR">
              <Grid2>
                <InputCampo
                  placeholder="VL OD"
                  value={form.distanciaNasopupilar.vlOD}
                  onChange={(e) =>
                    actualizarCampo("distanciaNasopupilar", "vlOD", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="VL OI"
                  value={form.distanciaNasopupilar.vlOI}
                  onChange={(e) =>
                    actualizarCampo("distanciaNasopupilar", "vlOI", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="VP OD"
                  value={form.distanciaNasopupilar.vpOD}
                  onChange={(e) =>
                    actualizarCampo("distanciaNasopupilar", "vpOD", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="VP OI"
                  value={form.distanciaNasopupilar.vpOI}
                  onChange={(e) =>
                    actualizarCampo("distanciaNasopupilar", "vpOI", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            <Seccion titulo="📐 DISTANCIA INTERPUPILAR">
              <Grid2>
                <InputCampo
                  placeholder="VL"
                  onChange={(e) =>
                    actualizarCampo("distanciaInterpupilar", "vl", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="VP"
                  onChange={(e) =>
                    actualizarCampo("distanciaInterpupilar", "vp", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            <Seccion titulo="👁️ OJO DOMINANTE">
              <RadioGroup
                opciones={["OD", "OI"]}
                valor={form.ojoDominante}
                onChange={(v) =>
                  setForm({ ...form, ojoDominante: v })
                }
              />
            </Seccion>

            <Seccion titulo="📐 ÁNGULO KAPPA">
              <Grid2>
                <InputCampo
                  placeholder="OD"
                  onChange={(e) =>
                    actualizarCampo("anguloKappa", "od", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="OI"
                  onChange={(e) =>
                    actualizarCampo("anguloKappa", "oi", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            <Seccion titulo="🔦 HIRSCHBERG">
              <Grid2>
                <InputCampo
                  placeholder="SC"
                  onChange={(e) =>
                    actualizarCampo("hirschberg", "sc", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="CC"
                  onChange={(e) =>
                    actualizarCampo("hirschberg", "cc", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            <Seccion titulo="🔍 COVER TEST VL">
              <Grid2>
                <InputCampo
                  placeholder="SC"
                  onChange={(e) =>
                    actualizarCampo("coverTestVL", "sc", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="CC"
                  onChange={(e) =>
                    actualizarCampo("coverTestVL", "cc", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            <Seccion titulo="🔎 COVER TEST VP">
              <Grid2>
                <InputCampo
                  placeholder="SC"
                  onChange={(e) =>
                    actualizarCampo("coverTestVP", "sc", e.target.value)
                  }
                />
                <InputCampo
                  placeholder="CC"
                  onChange={(e) =>
                    actualizarCampo("coverTestVP", "cc", e.target.value)
                  }
                />
              </Grid2>
            </Seccion>

            {/* RETINOSCOPÍA */}
            <Seccion titulo="🔬 RETINOSCOPÍA">
              <Campo label="Técnica a utilizar">
                <input
                  style={styles.input}
                  value={form.tecnicaRetinoscopia}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tecnicaRetinoscopia: e.target.value
                    })
                  }
                />
              </Campo>

              <table style={{ ...styles.table, tableLayout: "fixed" }}>
                <tbody>
                          <tr>
                      <td style={{ width: "10%" }}><b>OI</b></td>

                      <td style={{ width: "40%" }}>
                        <input
                          style={styles.cellInput}
                          value={form.retinoscopia.oiValor}
                          onChange={(e) =>
                            actualizarCampo("retinoscopia", "oiValor", e.target.value)
                          }
                        />
                      </td>

                      <td style={{ width: "10%", textAlign: "center" }}>
                        <b>A.V</b>
                      </td>

                      <td style={{ width: "40%" }}>
                        <input
                          style={styles.cellInput}
                          value={form.retinoscopia.oiAV}
                          onChange={(e) =>
                            actualizarCampo("retinoscopia", "oiAV", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                <tr>
                <td style={{ width: "10%" }}><b>OD</b></td>

                <td style={{ width: "40%" }}>
                  <input
                    style={styles.cellInput}
                    value={form.retinoscopia.odValor}
                    onChange={(e) =>
                      actualizarCampo("retinoscopia", "odValor", e.target.value)
                    }
                  />
                </td>

                <td style={{ width: "10%", textAlign: "center" }}>
                  <b>A.V</b>
                </td>

                <td style={{ width: "40%" }}>
                  <input
                    style={styles.cellInput}
                    value={form.retinoscopia.odAV}
                    onChange={(e) =>
                      actualizarCampo("retinoscopia", "odAV", e.target.value)
                    }
                  />
                </td>
              </tr>
                </tbody>
              </table>

              <Campo label="Observaciones">
                <textarea
                  style={styles.textarea}
                  value={form.retinoscopia.observaciones}
                  onChange={(e) =>
                    actualizarCampo("retinoscopia", "observaciones", e.target.value)
                  }
                />
              </Campo>
            </Seccion>

            {/* SUBJETIVO */}
<Seccion titulo="👓 SUBJETIVO">
  <Campo label="Técnica a utilizar">
    <input
      style={styles.input}
      value={form.tecnicaSubjetivo}
      onChange={(e) =>
        setForm({
          ...form,
          tecnicaSubjetivo: e.target.value
        })
      }
    />
  </Campo>

  <table style={{ ...styles.table, tableLayout: "fixed" }}>
    <tbody>
<tr>
  <td style={{ width: "10%" }}><b>OI</b></td>

  <td style={{ width: "40%" }}>
    <input
      style={styles.cellInput}
      value={form.subjetivo.oiValor}
      onChange={(e) =>
        actualizarCampo("subjetivo", "oiValor", e.target.value)
      }
    />
  </td>

  <td style={{ width: "10%", textAlign: "center" }}>
    <b>A.V</b>
  </td>

  <td style={{ width: "40%" }}>
    <input
      style={styles.cellInput}
      value={form.subjetivo.oiAV}
      onChange={(e) =>
        actualizarCampo("subjetivo", "oiAV", e.target.value)
      }
    />
  </td>
</tr>
<tr>
  <td style={{ width: "10%" }}><b>OD</b></td>

  <td style={{ width: "40%" }}>
    <input
      style={styles.cellInput}
      value={form.subjetivo.odValor}
      onChange={(e) =>
        actualizarCampo("subjetivo", "odValor", e.target.value)
      }
    />
  </td>

  <td style={{ width: "10%", textAlign: "center" }}>
    <b>A.V</b>
  </td>

  <td style={{ width: "40%" }}>
    <input
      style={styles.cellInput}
      value={form.subjetivo.odAV}
      onChange={(e) =>
        actualizarCampo("subjetivo", "odAV", e.target.value)
      }
    />
  </td>
</tr>
    </tbody>
  </table>
</Seccion>


<Seccion titulo="➕ ADICIÓN">
  <table style={{ ...styles.table, tableLayout: "fixed", textAlign: "center" }}>
    <thead>
      <tr>
        <th style={{ width: "50%" }}>OI</th>
        <th style={{ width: "50%" }}>OD</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <input
            style={styles.cellInput}
            value={form.adicion.oi}
            onChange={(e) =>
              actualizarCampo("adicion", "oi", e.target.value)
            }
          />
        </td>

        <td>
          <input
            style={styles.cellInput}
            value={form.adicion.od}
            onChange={(e) =>
              actualizarCampo("adicion", "od", e.target.value)
            }
          />
        </td>
      </tr>
    </tbody>
  </table>
</Seccion>


            {/* OFTALMOSCOPÍA */}
            <Seccion titulo="🔬 OFTALMOSCOPÍA">
              <Campo label="OI">
                <textarea
                  style={styles.textarea}
                  onChange={(e) =>
                    actualizarCampo("oftalmoscopia", "oi", e.target.value)
                  }
                />
              </Campo>
              <Campo label="OD">
                <textarea
                  style={styles.textarea}
                  onChange={(e) =>
                    actualizarCampo("oftalmoscopia", "od", e.target.value)
                  }
                />
              </Campo>
              <Campo label="Observaciones">
                <textarea
                  style={styles.textarea}
                  onChange={(e) =>
                    actualizarCampo("oftalmoscopia", "observaciones", e.target.value)
                  }
                />
              </Campo>
            </Seccion>


            <Seccion titulo="📝 OBSERVACIONES GENERALES">
              <textarea
                style={styles.textarea}
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
              />
            </Seccion>



            <button style={styles.save} onClick={guardarHistoria}>
              💾 Guardar Historia Clínica
            </button>

 <button
  style={styles.pdf}
  onClick={() => {
    if (!historiaGuardadaId) {
      alert("⚠️ Primero debes guardar la historia clínica");
      return;
    }

    generarPDFHistoria({
      paciente: pacienteSel,
      form,
      id: historiaGuardadaId // 🔥 ahora también mandas el ID
    });
  }}
>
  📄 Generar PDF
</button>


            {historiaGuardadaId && (
            <div style={{ marginTop: 10, color: "green", fontWeight: "bold" }}>
            ✅ Historia guardada correctamente
              </div>
            )}
            

          </div>
        </>
      )}
    </div>
  );
}

/* COMPONENTES REUTILIZABLES */
const Seccion = ({ titulo, children }) => (
  <div style={styles.bubble}>
    <h3 style={styles.bubbleTitle}>{titulo}</h3>
    {children}
  </div>
);

const Campo = ({ label, children }) => (
  <div style={styles.q}>
    <b>{label}</b>
    {children}
  </div>
);

const Grid2 = ({ children }) => (
  <div style={styles.grid2}>{children}</div>
);

const InputCampo = ({ ...props }) => (
  <input style={styles.input} {...props} />
);

const RadioGroup = ({ opciones, valor, onChange }) => (
  <div style={styles.opts}>
    {opciones.map(op => (
      <label key={op}>
        <input
          type="radio"
          checked={valor === op}
          onChange={() => onChange(op)}
        /> {op}
      </label>
    ))}
  </div>
);

const TablaVision = ({ titulo, columnas, datos, actualizar, incluirPH }) => {
  const ojos = ["oi", "od", "ao"];
  return (
    <Seccion titulo={titulo}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th></th>
            {columnas.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ojos.map(ojo => (
            <tr key={ojo}>
              <td><b>{ojo.toUpperCase()}</b></td>
              <td>
                <input
                  style={styles.cellInput}
                  value={datos[`${ojo}Sin`] || ""}
                  onChange={(e) =>
                    actualizar(`${ojo}Sin`, e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  style={styles.cellInput}
                  value={datos[`${ojo}Con`] || ""}
                  onChange={(e) =>
                    actualizar(`${ojo}Con`, e.target.value)
                  }
                />
              </td>
              {incluirPH && (
                <td>
                  <input
                    style={styles.cellInput}
                    value={datos[`${ojo}Ph`] || ""}
                    onChange={(e) =>
                      actualizar(`${ojo}Ph`, e.target.value)
                    }
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Seccion>
  );
};

export default Historias;

/* ESTILOS */
const styles = {
  container: { padding: 20, fontFamily: "Arial", background: "#f4f6f9" },

  header: {
    background: "linear-gradient(135deg,#1e3799,#4a69bd)",
    color: "white",
    padding: 15,
    borderRadius: 12
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "center"
  },

  btnHome: {
    background: "#2d3436",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  },

  btnBack: {
    background: "#636e72",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  },

  title: { fontWeight: "bold" },

  panel: { marginTop: 20 },

  search: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    marginBottom: 15,
    fontSize: 14
  },

  /* ================= TABLA DE PACIENTES ================= */
  cardTable: {
    marginTop: 10,
    background: "white",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    overflowX: "auto"
  },

  tableList: { display: "flex", flexDirection: "column", gap: 10 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
    //tableLayout: "fixed"
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
    fontWeight: "bold",
    color: "#2d3436"
  },

  doc: {
    fontSize: 12,
    color: "#636e72"
  },

  sexo: {
    color: "#0984e3",
    fontWeight: "bold"
  },

  btnSelect: {
    background: "#00b894",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  noData: {
    textAlign: "center",
    padding: 20,
    color: "#636e72",
    fontStyle: "italic"
  },

  /* ================= DISEÑO ANTERIOR (COMPATIBILIDAD) ================= */
  rowPaciente: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer"
  },

  info: { flex: 1, textAlign: "center" },

  /* ================= FICHA DEL PACIENTE ================= */
  ficha: {
    marginTop: 20,
    background: "#fff",
    padding: 15,
    borderRadius: 12,
    border: "2px solid #dfe6e9"
  },

  gridInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10
  },

  historia: {
    marginTop: 20,
    background: "white",
    padding: 20,
    borderRadius: 12
  },

  bubble: {
    background: "#f8fbff",
    border: "1px solid #d6e4ff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20
  },

  bubbleTitle: {
    color: "#1e3799",
    marginBottom: 15
  },

  q: { marginBottom: 15 },

  opts: { display: "flex", gap: 15 },

  input: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ccc"
  },

  textarea: {
    width: "100%",
    minHeight: 70,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10
  }, 

  cellInput: {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: 6,
    textAlign: "center",
    boxSizing: "border-box"
  },

  /* ================= BOTONES ================= */
  save: {
    marginTop: 20,
    background: "#00b894",
    color: "white",
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    width: "100%",
    fontSize: 16
  },

  pdf: {
    marginTop: 10,
    background: "#0984e3",
    color: "white",
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    width: "100%",
    fontSize: 16
  }

};