import { useState } from "react";
import { jsPDF } from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";

/**
 * Formato: Niños y Adolescentes (sin condicionales)
 * - Genera PDF + DOCX con un solo botón
 * - Campos mapeados 1:1 a cada "xxxx" del enunciado
 * - Títulos con color seleccionable
 * - Imágenes en grilla horizontal (PDF y Word)
 * - Labels importantes en negrita
 */

export default function NewForm() {
  // Color del título (DERIVACIÓN y Frenectomía)
  const [tituloColor, setTituloColor] = useState("#1f4ed8"); // azul por defecto

  // Imágenes
  const [imagenes, setImagenes] = useState([]); // File[]
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    // Encabezado fijo (texto con color)
    // ——— Datos del paciente ———
    nombre: "",
    edad: "",
    fecha_examen: "",
    derivado_desde: "", // xxxx (servicio)
    dra_nombre: "", // Dra. xxxx
    para_evaluacion: "", // evaluación de xxxx

    // ——— Cuerpo clínico (todas las xxxx) ———
    mov_aislados_lengua: "", // movimientos aislados de lengua xxxx
    frenillo_alterado: "", // Frenillo lingual alterado, xxxx
    insercion_en_1: "", // Inserción en xxxx
    insercion_en_2: "", // y en xxxx
    alteracion_funciones: "", // Alteración en funciones orofaciales de xxxx
    en_reposo: "", // En reposo xxxx
    en_deglucion: "", // En deglución xxxx
    masticacion: "", // Masticación xxxx
    en_habla: "", // En habla, xxxx

    // ——— Firma ———
    firma_nombre: "", // xxxx (profesional)
    especialista_en: "", // Especialista en xxxx

    // ——— Pie ———
    fecha_final: "", // fecha: xxxx (campo libre; no autogenero)
    direccion: "", // direccion: xxxx (editable, no fijo)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
  };

  const onImgs = (e) => {
    const files = Array.from(e.target.files || []);
    if (imagenes.length + files.length > 5) {
      alert("Solo se permiten hasta 5 imágenes por informe.");
      return;
    }
    setImagenes((prev) => [...prev, ...files]);
  };

  const eliminarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  // Helpers
  const hexToRgb = (hex) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };

  // —————————————————————
  // Construcción del texto (con labels en negrita en PDF / Word)
  // —————————————————————

  const lineasBloqueClinico = () => [
    "", // separador
    { bold: true, label: "Estimado/a Dr/a.:" },
    `  Paciente es evaluado por Fonoaudióloga especialista en Motricidad Orofacial.En la evaluación, al observar movimientos aislados de lengua ${data.mov_aislados_lengua}.Frenillo lingual alterado, ${data.frenillo_alterado}.Inserción en ${data.insercion_en_1} y en ${data.insercion_en_2}.Para tocar papila incisiva con ápice lingual debe disminuir apertura bucal máxima a un 48%.`,
    "",
    `Alteración en funciones orofaciales de ${data.alteracion_funciones}.En reposo ${data.en_reposo}.En deglución ${data.en_deglucion}.Masticación ${data.masticacion}.En habla, ${data.en_habla}.`,
    "",
    `Se adjuntan fotografías que muestran de manera gráfica lo anteriormente expuesto:`,
  ];

  const lineasBloqueCierre = () => [
    "",
    `De acuerdo a estos antecedentes, se hace necesaria la derivación a su especialidad, ya que se sugiere realizar cirugía remedial de frenillo lingual, con sesiones de terapia miofuncional previas y posteriores a dicha cirugía.`,
    "",
    { bold: true, label: "Saluda atentamente," },
    `${data.firma_nombre}`,
    `Fonoaudióloga`,
    `Especialista en ${data.especialista_en}`,
    "",
    `${"Fecha: "}${data.fecha_final}`,
    `${"Dirección: "}${data.direccion}`,
  ];

  // —————————————————————
  // Generación PDF
  // —————————————————————
  const generarPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const marginX = 18;
    let y = 20;
    const maxWidth = 174;
    const normalLH = 6;

    const { r, g, b } = hexToRgb(tituloColor);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(r, g, b);
    doc.text("DERIVACIÓN FONOAUDIOLÓGICA", marginX, y);
    y += 8;
    doc.text("Frenectomía", marginX, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const putBoldLine = (label, value) => {
      const line = `${label}${value ?? ""}`;
      const wrapped = doc.splitTextToSize(line, maxWidth);
      wrapped.forEach((l, i) => {
        if (i === 0) {
          const labelWidth = doc.getTextWidth(label);
          doc.setFont("times", "bold");
          doc.text(label, marginX, y);
          doc.setFont("times", "normal");
          doc.text(l.replace(label, ""), marginX + labelWidth, y);
        } else {
          doc.text(l, marginX, y);
        }
        y += normalLH;
      });
    };

    putBoldLine("Nombre:", ` ${data.nombre}`);
    putBoldLine("Edad:", ` ${data.edad}`);
    putBoldLine("Fecha de examen:", ` ${data.fecha_examen}`);
    putBoldLine(
      "Motivo de consulta: ",
      `Derivado desde ${data.derivado_desde} (Dra. ${data.dra_nombre}) para evaluación de ${data.para_evaluacion}.`
    );
    y += 2;

    const texto = [
      "",
      "Estimado/a Dr/a.:",
      `Paciente es evaluado por Fonoaudióloga especialista en Motricidad Orofacial. En la evaluación, al observar movimientos aislados de lengua ${data.mov_aislados_lengua}. Frenillo lingual alterado, ${data.frenillo_alterado}. Inserción en ${data.insercion_en_1} y en ${data.insercion_en_2}.`,
      "",
      `Alteración en funciones orofaciales de ${data.alteracion_funciones}. En reposo ${data.en_reposo}. En deglución ${data.en_deglucion}. Masticación ${data.masticacion}. En habla, ${data.en_habla}.`,
      "",
      `Se adjuntan fotografías que muestran de manera gráfica lo anteriormente expuesto:`,
    ];

    texto.forEach((t) => {
      const lines = doc.splitTextToSize(t, maxWidth);
      lines.forEach((l) => {
        doc.text(l, marginX, y);
        y += normalLH;
      });
    });

    // 🖼️ Imágenes alineadas (1 fila máx. 5)
    const imgW = 33,
      imgH = 25,
      gap = 4;
    let x = marginX;

    for (let i = 0; i < Math.min(imagenes.length, 5); i++) {
      const base64 = await fileToBase64(imagenes[i]);
      doc.addImage(base64, "JPEG", x, y, imgW, imgH);
      x += imgW + gap;
    }

    y += imgH + 6;

    const cierre = [
      "",
      "De acuerdo a estos antecedentes, se hace necesaria la derivación a su especialidad...",
      "",
      "Saluda atentamente,",
      `${data.firma_nombre}`,
      "Fonoaudióloga",
      `Especialista en ${data.especialista_en}`,
      "",
      `Fecha: ${data.fecha_final}`,
      `Dirección: ${data.direccion}`,
    ];

    cierre.forEach((t) => {
      const lines = doc.splitTextToSize(t, maxWidth);
      lines.forEach((l) => {
        doc.text(l, marginX, y);
        y += normalLH;
      });
    });

    doc.save(`Informe-Fonoaudiologico-${data.nombre || "paciente"}.pdf`);
  };

  // —————————————————————
  // Generación Word (docx)
  // —————————————————————
  const generarWord = async (timestamp = "") => {
    const titleHex = tituloColor.replace("#", "").toUpperCase();

    const makePara = (text, bold = false, size = 24, color) =>
      new Paragraph({
        alignment: "justify",
        spacing: { line: 280 }, // interlineado ~1.2
        children: [
          new TextRun({
            text,
            bold,
            size,
            color,
            font: "Times New Roman",
          }),
        ],
      });

    const paras = [
      makePara("DERIVACIÓN FONOAUDIOLÓGICA", true, 32, titleHex),
      makePara("Frenectomía", true, 28, titleHex),
      makePara(""),
      makePara(`Nombre: ${data.nombre}`, true),
      makePara(`Edad: ${data.edad}`, true),
      makePara(`Fecha de examen: ${data.fecha_examen}`, true),
      makePara(
        `Motivo de consulta: Derivado desde ${data.derivado_desde} (Dra. ${data.dra_nombre}) para evaluación de ${data.para_evaluacion}.`
      ),
      makePara(""),
      makePara("Estimado/a Dr/a.:", true),
      makePara(
        `Paciente es evaluado por Fonoaudióloga especialista en Motricidad Orofacial. En la evaluación, al observar movimientos aislados de lengua ${data.mov_aislados_lengua}. Frenillo lingual alterado, ${data.frenillo_alterado}. Inserción en ${data.insercion_en_1} y en ${data.insercion_en_2}. Para tocar papila incisiva con ápice lingual debe disminuir apertura bucal máxima a un 48%.`
      ),
      makePara(
        `Alteración en funciones orofaciales de ${data.alteracion_funciones}. En reposo ${data.en_reposo}. En deglución ${data.en_deglucion}. Masticación ${data.masticacion}. En habla, ${data.en_habla}.`
      ),
      makePara(""),
      makePara(
        "Se adjuntan fotografías que muestran lo anteriormente expuesto:"
      ),
    ];

    // 🖼️ Imágenes en una sola fila (máx. 5)
    if (imagenes.length > 0) {
      const cells = [];

      for (const file of imagenes.slice(0, 5)) {
        const buf = await file.arrayBuffer();

        cells.push(
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: "center",
                children: [
                  new ImageRun({
                    data: buf,
                    transformation: { width: 90, height: 65 },
                  }),
                ],
              }),
            ],
          })
        );
      }

      while (cells.length < 5) {
        cells.push(
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun("")] })],
          })
        );
      }

      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: cells })],
        margins: { top: 0, bottom: 0 },
      });

      paras.push(makePara(""));
      paras.push(table);
    }

    paras.push(makePara(""));
    paras.push(makePara("Saluda atentamente,", true));
    paras.push(makePara(data.firma_nombre));
    paras.push(makePara("Fonoaudióloga"));
    paras.push(makePara(`Especialista en ${data.especialista_en}`));
    paras.push(makePara(""));
    paras.push(makePara(`Fecha: ${data.fecha_final}`));
    paras.push(makePara(`Dirección: ${data.direccion}`));

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 2.5 cm aprox
            },
          },
          children: paras,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const nombreArchivo = `Informe-Fonoaudiologico-${
      data.nombre || "paciente"
    }-${timestamp || ""}.docx`;
    saveAs(blob, nombreArchivo);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evita clics múltiples
    if (loading) return;

    setLoading(true);

    try {
      // 1️⃣ Generar PDF
      await generarPDF();

      // 2️⃣ Pequeña pausa para liberar el flujo del navegador
      await new Promise((r) => setTimeout(r, 200));

      // 3️⃣ Generar Word con nombre único (incluye timestamp)
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      await generarWord(timestamp);
    } catch (err) {
      console.error("⚠️ Error al generar informe:", err);
      alert("Ocurrió un error al generar el informe. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen text-gray-800 p-6">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow my-20">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Informe — Niños / Adolescentes
          </h1>

          {/* Color de título */}
          <div className="mb-4">
            <label className="font-semibold">
              Color del título (Derivación / Frenectomía):
            </label>
            <input
              type="color"
              value={tituloColor}
              onChange={(e) => setTituloColor(e.target.value)}
              className="ml-3 h-8 w-12 p-0 border rounded"
              title="Elige color"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos del paciente */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="font-semibold">Nombre</label>
                <input
                  name="nombre"
                  value={data.nombre}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Edad</label>
                <input
                  name="edad"
                  value={data.edad}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Fecha de examen</label>
                <input
                  type="date"
                  name="fecha_examen"
                  value={data.fecha_examen}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">
                  Derivado desde (servicio)
                </label>
                <input
                  name="derivado_desde"
                  value={data.derivado_desde}
                  onChange={handleChange}
                  placeholder="Ortodoncia / ..."
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Dra. (nombre)</label>
                <input
                  name="dra_nombre"
                  value={data.dra_nombre}
                  onChange={handleChange}
                  placeholder="Mónica Hurtado / ..."
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Evaluación de</label>
                <input
                  name="para_evaluacion"
                  value={data.para_evaluacion}
                  onChange={handleChange}
                  placeholder="frenillo lingual y funciones orofaciales"
                  className="w-full border rounded p-2 mt-1"
                  required
                />
              </div>
            </div>

            {/* Cuerpo clínico */}
            <div className="grid gap-3">
              <div>
                <label className="font-semibold">
                  Movimientos aislados de lengua
                </label>
                <input
                  name="mov_aislados_lengua"
                  value={data.mov_aislados_lengua}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-semibold">
                  Frenillo lingual alterado
                </label>
                <input
                  name="frenillo_alterado"
                  value={data.frenillo_alterado}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="font-semibold">Inserción en (1)</label>
                  <input
                    name="insercion_en_1"
                    value={data.insercion_en_1}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">Inserción en (2)</label>
                  <input
                    name="insercion_en_2"
                    value={data.insercion_en_2}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">
                  Alteración en funciones orofaciales de
                </label>
                <input
                  name="alteracion_funciones"
                  value={data.alteracion_funciones}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="font-semibold">En reposo</label>
                  <input
                    name="en_reposo"
                    value={data.en_reposo}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">En deglución</label>
                  <input
                    name="en_deglucion"
                    value={data.en_deglucion}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="font-semibold">Masticación</label>
                  <input
                    name="masticacion"
                    value={data.masticacion}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">En habla</label>
                  <input
                    name="en_habla"
                    value={data.en_habla}
                    onChange={handleChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label className="font-semibold">Fotografías (máx. 5)</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {imagenes.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-24 h-24 object-cover rounded border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarImagen(i)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {imagenes.length < 5 && (
                  <label className="cursor-pointer bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition text-sm flex items-center gap-2">
                    ➕ Agregar imágenes
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onImgs}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Firma y pie */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="font-semibold">
                  Firma — Nombre profesional
                </label>
                <input
                  name="firma_nombre"
                  value={data.firma_nombre}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-semibold">Especialista en</label>
                <input
                  name="especialista_en"
                  value={data.especialista_en}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-semibold">Fecha (final)</label>
                <input
                  type="date"
                  name="fecha_final"
                  value={data.fecha_final}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-semibold">Dirección</label>
                <input
                  name="direccion"
                  value={data.direccion}
                  onChange={handleChange}
                  placeholder="(ej.) La Concepción 81, oficina 1103, Providencia"
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Generando..." : "Generar Informe (PDF + Word)"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
