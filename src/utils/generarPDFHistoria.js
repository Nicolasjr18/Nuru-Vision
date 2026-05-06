import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";



const safe = (obj, path, fallback = "-") => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;
};

export const generarPDFHistoria = (data) => {
  const paciente = data.paciente;
  const form = {
  visionLejana: {},
  visionProxima: {},
  distanciaNasopupilar: {},
  distanciaInterpupilar: {},
  anguloKappa: {},
  hirschberg: {},
  coverTestVL: {},
  coverTestVP: {},
  retinoscopia: {},
  subjetivo: {},
  adicion: {},
  oftalmoscopia: {},
  ...data
};

  const doc = new jsPDF();

  /* ================= ENCABEZADO ================= */
  doc.addImage(logo, "PNG", 15, 10, 30, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NURU VISION COL", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.text("Historia Clínica Optométrica", 105, 22, { align: "center" });


  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(`Paciente: ${paciente.primerNombre} ${paciente.primerApellido}`,15,45);
  doc.text(`Documento: ${paciente.tipoDocumento} - ${paciente.documento}`,15,52);
  doc.text(`Sexo: ${paciente.sexo}`, 15, 59);
  doc.text(`Fecha: ${form.fecha}`, 150, 45);
  doc.text(`Edad: ${paciente.edad}`, 150, 52);
  doc.text(`Ocupación: ${paciente.ocupacion || "N/A"}`, 150, 59);



  let y = 65;

  /* ================= ANAMNESIS ================= */
  doc.setFont("helvetica", "bold");
  doc.text("ANAMNESIS", 15, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [
      ["¿Usa gafas?", form.usaGafas],
      ["Lateralidad", form.lateralidad],
      ["Motivo consulta", form.motivoConsulta],
      ["Antecedentes familiares", form.antecedentesFamiliares],
      ["Antecedentes personales", form.antecedentesPersonales],
      ["Antecedentes oculares", form.antecedentesOculares],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;

/* ================= AGUDEZA VISUAL ================= */
doc.setFont("helvetica", "bold");
doc.text("AGUDEZA VISUAL", 15, y);

autoTable(doc, {
  startY: y + 2,
  body: [
    ["Angular", form.agudezaAngular ? "Sí" : "No"],
    ["Morfoscopía", form.agudezaMorfoscopia ? "Sí" : "No"],
  ],
});

y = doc.lastAutoTable.finalY + 8;


  /* ================= VISIÓN LEJANA ================= */
  doc.setFont("helvetica", "bold");
  doc.text("VISIÓN LEJANA", 15, y);

  autoTable(doc, {
    startY: y + 2,
    head: [["", "SC", "CC", "PH"]],
    body: [
      ["OD", safe(form, "visionLejana.odSin"), safe(form, "visionLejana.odCon"), safe(form, "visionLejana.odPh")],
      ["OI", safe(form, "visionLejana.oiSin"), safe(form, "visionLejana.oiCon"), safe(form, "visionLejana.oiPh")],
      ["AO", safe(form, "visionLejana.aoSin"), safe(form, "visionLejana.aoCon"), safe(form, "visionLejana.aoPh")],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= VISIÓN PRÓXIMA ================= */
  doc.setFont("helvetica", "bold");
  doc.text("VISIÓN PRÓXIMA", 15, y);

  autoTable(doc, {
    startY: y + 2,
    head: [["", "SC", "CC"]],
    body: [
        ["OD", safe(form, "visionProxima.odSin"), safe(form, "visionProxima.odCon")],
        ["OI", safe(form, "visionProxima.oiSin"), safe(form, "visionProxima.oiCon")],
        ["AO", safe(form, "visionProxima.aoSin"), safe(form, "visionProxima.aoCon")],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;


/* ================= DISTANCIAS ================= */
doc.setFont("helvetica", "bold");
doc.text("DISTANCIAS PUPILARES", 15, y);

autoTable(doc, {
  startY: y + 2,
  head: [["Tipo", "OD", "OI"]],
  body: [
    [
      "Nasopupilar VL",
      safe(form, "distanciaNasopupilar.vlOD"),
      safe(form, "distanciaNasopupilar.vlOI"),
    ],
    [
      "Nasopupilar VP",
      safe(form, "distanciaNasopupilar.vpOD"),
      safe(form, "distanciaNasopupilar.vpOI"),
    ],
  ],
});

y = doc.lastAutoTable.finalY + 6;

/* INTERPUPILAR */
autoTable(doc, {
  startY: y,
  head: [["Interpupilar VL", "Interpupilar VP"]],
  body: [[
      safe(form, "distanciaInterpupilar.vl"),
      safe(form, "distanciaInterpupilar.vp"),
  ]],
});

y = doc.lastAutoTable.finalY + 8;

/* ================= OJO DOMINANTE ================= */
doc.setFont("helvetica", "bold");
doc.text("OJO DOMINANTE", 15, y);

autoTable(doc, {
  startY: y + 2,
  body: [[form.ojoDominante || "-"]],
});

y = doc.lastAutoTable.finalY + 8;

/* ================= ÁNGULO KAPPA ================= */
doc.setFont("helvetica", "bold");
doc.text("ÁNGULO KAPPA", 15, y);

autoTable(doc, {
  startY: y + 2,
  head: [["OD", "OI"]],
  body: [[
  safe(form, "anguloKappa.od"),
  safe(form, "anguloKappa.oi")
]],
});

y = doc.lastAutoTable.finalY + 8;


/* ================= HIRSCHBERG ================= */
doc.setFont("helvetica", "bold");
doc.text("HIRSCHBERG", 15, y);

autoTable(doc, {
  startY: y + 2,
  head: [["SC", "CC"]],
  body: [[
  safe(form, "hirschberg.sc"),
  safe(form, "hirschberg.cc")
]],
});

y = doc.lastAutoTable.finalY + 8;


/* ================= COVER TEST VL ================= */
doc.setFont("helvetica", "bold");
doc.text("COVER TEST VISIÓN LEJANA", 15, y);

autoTable(doc, {
  startY: y + 2,
  head: [["SC", "CC"]],
  body: [[
  safe(form, "coverTestVL.sc"),
  safe(form, "coverTestVL.cc")
]],
});

y = doc.lastAutoTable.finalY + 6;

/* ================= COVER TEST VP ================= */
doc.setFont("helvetica", "bold");
doc.text("COVER TEST VISIÓN PRÓXIMA", 15, y);

autoTable(doc, {
  startY: y + 2,
  head: [["SC", "CC"]],
  body: [[
  safe(form, "coverTestVP.sc"),
  safe(form, "coverTestVP.cc")
]],
});

y = doc.lastAutoTable.finalY + 8;

  /* ================= RETINOSCOPÍA ================= */
  doc.setFont("helvetica", "bold");
  doc.text("RETINOSCOPÍA", 15, y);

  autoTable(doc, {
    startY: y + 2,
    body: [
      ["Técnica", form.tecnicaRetinoscopia],
      ["OD", `${safe(form, "retinoscopia.odValor")} | AV: ${safe(form, "retinoscopia.odAV")}`],
      ["OI", `${safe(form, "retinoscopia.oiValor")} | AV: ${safe(form, "retinoscopia.oiAV")}`],
      ["Observaciones", safe(form, "retinoscopia.observaciones")],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= SUBJETIVO ================= */
  doc.setFont("helvetica", "bold");
  doc.text("SUBJETIVO", 15, y);

  autoTable(doc, {
    startY: y + 2,
    body: [
      ["Técnica", form.tecnicaSubjetivo],
      ["OD", `${safe(form, "subjetivo.odValor")} | AV: ${safe(form, "subjetivo.odAV")}`],
      ["OI", `${safe(form, "subjetivo.oiValor")} | AV: ${safe(form, "subjetivo.oiAV")}`],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= ADICIÓN ================= */
  doc.setFont("helvetica", "bold");
  doc.text("ADICIÓN", 15, y);

  autoTable(doc, {
    startY: y + 2,
    head: [["OI", "OD"]],
body: [[
  safe(form, "adicion.oi"),
  safe(form, "adicion.od")
]],
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= OFTALMOSCOPÍA ================= */
  doc.setFont("helvetica", "bold");
  doc.text("OFTALMOSCOPÍA", 15, y);

  autoTable(doc, {
    startY: y + 2,
    body: [
    ["OD", safe(form, "oftalmoscopia.od")],
    ["OI", safe(form, "oftalmoscopia.oi")],
    ["Observaciones", safe(form, "oftalmoscopia.observaciones")],
    ],
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= OBSERVACIONES ================= */
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVACIONES GENERALES", 15, y);

  autoTable(doc, {
    startY: y + 2,
    body: [[form.observaciones || "Sin observaciones"]],
  });

  /* ================= EXPORTAR ================= */
  doc.save(`Historia_${paciente.primerNombre}.pdf`);
};