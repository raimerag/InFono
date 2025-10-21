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

export default function InformeNinosAdolescentes() {
  // Color del título (DERIVACIÓN y Frenectomía)
  const [tituloColor, setTituloColor] = useState("#1f4ed8"); // azul por defecto

  // Imágenes
  const [imagenes, setImagenes] = useState([]); // File[]

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
    setImagenes(files);
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
    const maxWidth = 174; // 210 - 2*18
    const normalLH = 6;

    // Títulos con color
    const { r, g, b } = hexToRgb(tituloColor);
    doc.setFontSize(16);
    doc.setTextColor(r, g, b);
    doc.text("DERIVACIÓN FONOAUDIOLÓGICA", marginX, y);
    y += 8;
    doc.text("Frenectomía", marginX, y);
    y += 10;

    // Volver a negro
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Datos en negrita (labels)
    const putBoldLine = (label, value) => {
      const line = `${label}${value ?? ""}`;
      const wrapped = doc.splitTextToSize(line, maxWidth);
      wrapped.forEach((l, i) => {
        if (i === 0) {
          // Pintamos el label en bold
          const labelWidth = doc.getTextWidth(label);
          doc.setFont(undefined, "bold");
          doc.text(label, marginX, y);
          doc.setFont(undefined, "normal");
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
      "Motivo de consulta:  ",
      `  Derivado desde ${data.derivado_desde} (Dra. ${data.dra_nombre}) para evaluación de ${data.para_evaluacion}.`
    );
    y += 2;

    // Bloque clínico
    const bloqueClinico = lineasBloqueClinico();
    for (const entry of bloqueClinico) {
      if (typeof entry === "string") {
        const lines = doc.splitTextToSize(entry, maxWidth);
        for (const l of lines) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(l, marginX, y);
          y += normalLH;
        }
      } else if (entry?.bold) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, "bold");
        doc.text(entry.label, marginX, y);
        doc.setFont(undefined, "normal");
        y += normalLH;
      }
    }

    // Imágenes en grilla (2 por fila)
    const imgW = 85,
      imgH = 64,
      gap = 4;
    let col = 0;
    let x = marginX;

    for (const file of imagenes) {
      // Si no cabe la fila, salto de página
      if (y + imgH > 280) {
        doc.addPage();
        y = 20;
      }

      const base64 = await fileToBase64(file);
      doc.addImage(base64, "JPEG", x, y, imgW, imgH);

      col += 1;
      if (col === 2) {
        // fin de fila
        col = 0;
        x = marginX;
        y += imgH + gap;
      } else {
        x = marginX + imgW + gap;
      }
    }
    if (col !== 0) {
      // cerrar última fila
      y += imgH + gap;
      col = 0;
      x = marginX;
    }

    // Cierre
    const bloqueCierre = lineasBloqueCierre();
    for (const entry of bloqueCierre) {
      if (typeof entry === "string") {
        const lines = doc.splitTextToSize(entry, maxWidth);
        for (const l of lines) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(l, marginX, y);
          y += normalLH;
        }
      } else if (entry?.bold) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, "bold");
        doc.text(entry.label, marginX, y);
        doc.setFont(undefined, "normal");
        y += normalLH;
      }
    }

    doc.save(
      `Informe-Fonoaudiologico-${(data.nombre || "paciente").replace(
        /\s+/g,
        "_"
      )}.pdf`
    );
  };

  // —————————————————————
  // Generación Word (docx)
  // —————————————————————
  const generarWord = async () => {
    const titleHex = tituloColor.replace("#", "").toUpperCase();

    const makePara = (text, bold = false, size = 24, color) =>
      new Paragraph({
        children: [new TextRun({ text, bold, size, color })],
      });

    const paras = [
      makePara("DERIVACIÓN FONOAUDIOLÓGICA", true, 30, titleHex),
      makePara("Frenectomía", true, 28, titleHex),
      makePara(""),
      // Datos (labels en negrita)
      new Paragraph({
        children: [
          new TextRun({ text: "Nombre:", bold: true, size: 24 }),
          new TextRun({ text: ` ${data.nombre}`, size: 24 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Edad:", bold: true, size: 24 }),
          new TextRun({ text: ` ${data.edad}`, size: 24 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Fecha de examen:", bold: true, size: 24 }),
          new TextRun({ text: ` ${data.fecha_examen}`, size: 24 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Motivo de consulta:", bold: true, size: 24 }),
          new TextRun({
            text: ` Derivado desde ${data.derivado_desde} (Dra. ${data.dra_nombre}) para evaluación de ${data.para_evaluacion}.`,
            size: 24,
          }),
        ],
      }),
      makePara(""),
      makePara("Estimado/a Dr/a.:", true),
      makePara(
        `Paciente es evaluado por Fonoaudióloga especialista en Motricidad Orofacial.`
      ),
      makePara(
        `En la evaluación, al observar movimientos aislados de lengua ${data.mov_aislados_lengua}.`
      ),
      makePara(`Frenillo lingual alterado, ${data.frenillo_alterado}.`),
      makePara(
        `Inserción en ${data.insercion_en_1} y en ${data.insercion_en_2}.`
      ),
      makePara(
        `Para tocar papila incisiva con ápice lingual debe disminuir apertura bucal máxima a un 48%.`
      ),
      makePara(""),
      makePara(
        `Alteración en funciones orofaciales de ${data.alteracion_funciones}.`
      ),
      makePara(`En reposo ${data.en_reposo}.`),
      makePara(`En deglución ${data.en_deglucion}.`),
      makePara(`Masticación ${data.masticacion}.`),
      makePara(`En habla, ${data.en_habla}.`),
      makePara(""),
      makePara(
        `Se adjuntan fotografías que muestran de manera gráfica lo anteriormente expuesto:`
      ),
      makePara(""),
    ];

    // Imágenes en tabla (hasta 3 por fila)
    const rows = [];
    const perRow = 3;
    for (let i = 0; i < imagenes.length; i += perRow) {
      const slice = imagenes.slice(i, i + perRow);
      const cells = [];
      for (const file of slice) {
        const buf = await file.arrayBuffer();
        cells.push(
          new TableCell({
            width: { size: 100 / perRow, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "", size: 1 })],
              }),
            ],
            children: [
              new Paragraph({
                children: [
                  // ancho ~ 420px corresponde aprox a 11cm. Ajusta si necesitas.
                  new TextRun({ text: "" }),
                ],
              }),
            ],
          })
        );
        // Reemplazamos el contenido del cell con la imagen:
        cells[cells.length - 1] = new TableCell({
          width: { size: 100 / perRow, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                // Ajusta tamaño según quieras (ancho 400, alto 280 aprox)
                new TextRun({
                  children: [],
                }),
              ],
            }),
          ],
        });
        // Hack: usamos ImageRun dentro del párrafo:
        cells[cells.length - 1].children = [
          new Paragraph({
            children: [
              // @ts-ignore - usamos ImageRun dinámico
              new (require("docx").ImageRun)({
                data: buf,
                transformation: { width: 400, height: 280 },
              }),
            ],
          }),
        ];
      }
      // Completar celdas vacías si la fila no está llena
      while (cells.length < perRow) {
        cells.push(
          new TableCell({
            width: { size: 100 / perRow, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: "" })] }),
            ],
          })
        );
      }
      rows.push(new TableRow({ children: cells }));
    }
    if (rows.length) {
      paras.push(new Paragraph("")); // separación
      paras.push(new Paragraph("")); // más aire
      paras.push(
        new Paragraph({
          children: [new TextRun({ text: "" })],
        })
      );
      paras.push(
        // Insertamos la tabla
        // @ts-ignore
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        })
      );
    }

    // Cierre
    paras.push(makePara(""));
    paras.push(
      makePara(
        `De acuerdo a estos antecedentes, se hace necesaria la derivación a su especialidad, ya que se sugiere realizar cirugía remedial de frenillo lingual, con sesiones de terapia miofuncional previas y posteriores a dicha cirugía.`
      )
    );
    paras.push(makePara(""));
    paras.push(makePara("Saluda atentamente,", true));
    paras.push(makePara(`${data.firma_nombre}`));
    paras.push(makePara(`Fonoaudióloga`));
    paras.push(makePara(`Especialista en ${data.especialista_en}`));
    paras.push(makePara(""));
    paras.push(makePara(`Fecha: ${data.fecha_final}`));
    paras.push(makePara(`Dirección: ${data.direccion}`));

    const doc = new Document({ sections: [{ children: paras }] });
    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `Informe-Fonoaudiologico-${(data.nombre || "paciente").replace(
        /\s+/g,
        "_"
      )}.docx`
    );
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
    await generarPDF();
    await generarWord();
  };

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 p-4">
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
              <label className="font-semibold">
                Fotografías (se acomodan en filas)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImgs}
                className="block mt-1"
              />
              {imagenes.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagenes.map((f, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full aspect-video object-cover rounded border"
                    />
                  ))}
                </div>
              )}
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
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Generar Informe (PDF + Word)
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
