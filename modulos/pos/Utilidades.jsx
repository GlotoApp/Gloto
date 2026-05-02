import React, { useState, useRef } from "react";
import {
  FileText,
  QrCode,
  Printer,
  Download,
  Copy,
  Menu,
  Users,
  Settings,
  AlertCircle,
  Square,
  Plus,
  Palette,
  Eye,
  Link,
  ChevronDown,
  LayoutTemplate,
} from "lucide-react";

const Utilidades = () => {
  const [activeTab, setActiveTab] = useState("qr");
  const [qrMenu, setQrMenu] = useState("menu");
  const [copiedQR, setCopiedQR] = useState(false);
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Pepperoni Pizza", price: 12000 },
    { id: 2, name: "Margherita Pizza", price: 10000 },
    { id: 3, name: "Truffle Burger", price: 14000 },
  ]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });

  // ── Estado habladores ──
  const [tableConfig, setTableConfig] = useState({
    startNumber: 1,
    endNumber: 10,
    restaurantName: "GLOTO",
    qrUrl: "https://gloto.com/menu",
    colorScheme: "dark", // dark | light | branded
    brandColor: "#7c3aed", // solo para "branded"
    showTableLabel: true,
    showQR: true,
    scanText: "Escanea para pedir",
    layout: "tent", // tent | flat
  });

  const qrUrls = {
    menu: "https://gloto.com/menu",
    employees: "https://gloto.com/employees/login",
  };

  // ── helpers ──
  const handleAddMenuItem = () => {
    if (newItem.name && newItem.price) {
      setMenuItems([
        ...menuItems,
        {
          id: Date.now(),
          name: newItem.name,
          price: parseFloat(newItem.price),
        },
      ]);
      setNewItem({ name: "", price: "" });
    }
  };
  const handleRemoveMenuItem = (id) =>
    setMenuItems(menuItems.filter((item) => item.id !== id));
  const generateQRImage = () =>
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrls[qrMenu])}`;
  const handleCopyURL = () => {
    navigator.clipboard.writeText(qrUrls[qrMenu]);
    setCopiedQR(true);
    setTimeout(() => setCopiedQR(false), 2000);
  };
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = generateQRImage();
    link.download = `qr-${qrMenu}.png`;
    link.click();
  };
  const formatPrice = (price) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // ── Tabla de mesas ──
  const totalMesas = Math.max(
    0,
    parseInt(tableConfig.endNumber) - parseInt(tableConfig.startNumber) + 1,
  );
  const mesaNumbers = Array.from(
    { length: totalMesas },
    (_, i) => parseInt(tableConfig.startNumber) + i,
  );

  // ── Paleta de colores por esquema ──
  const colorPalettes = {
    dark: {
      front: "#000000",
      frontText: "#ffffff",
      back: "#ffffff",
      backText: "#000000",
      accent: "#000000",
    },
    light: {
      front: "#ffffff",
      frontText: "#000000",
      back: "#f5f5f5",
      backText: "#000000",
      accent: "#333333",
    },
    branded: {
      front: tableConfig.brandColor,
      frontText: "#ffffff",
      back: "#ffffff",
      backText: "#000000",
      accent: tableConfig.brandColor,
    },
  };
  const palette = colorPalettes[tableConfig.colorScheme];

  // ── Generador PDF de habladores ──
  const generateTableCardsPDF = () => {
    const isTent = tableConfig.layout === "tent";
    const pal = colorPalettes[tableConfig.colorScheme];

    const cardHTML = (tableNum) => `
      <div class="tent-card">
        <!-- CARA FRONTAL: NÚMERO -->
        <div class="side-number" style="background:${pal.front}; color:${pal.frontText};">
          ${tableConfig.showTableLabel ? `<span class="table-label" style="color:${pal.frontText}88;">MESA</span>` : ""}
          <span class="number" style="color:${pal.frontText};">${tableNum}</span>
          <span class="brand-name" style="color:${pal.frontText}66;">${tableConfig.restaurantName}</span>
        </div>

        ${isTent ? `<div class="fold-line"></div>` : ""}

        <!-- CARA TRASERA / REVERSO -->
        <div class="side-qr" style="background:${pal.back}; color:${pal.backText};">
          ${
            tableConfig.showQR
              ? `
          <div class="qr-wrapper" style="background:white;">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tableConfig.qrUrl + "?mesa=" + tableNum)}"
              style="width:100%;height:100%;display:block;"
              alt="QR Mesa ${tableNum}"
            />
          </div>
          <span class="qr-instruction" style="color:${pal.backText};">${tableConfig.scanText}</span>
          `
              : ""
          }
          <span class="mesa-badge" style="background:${pal.accent};color:${pal.front === "#ffffff" ? "#fff" : pal.frontText};">MESA ${tableNum}</span>
        </div>
      </div>
    `;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Habladores de Mesa — ${tableConfig.restaurantName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,900;1,900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#e5e5e5; }

    .instructions {
      text-align:center;
      padding:20px;
      font-size:11px;
      color:#666;
      font-weight:700;
      letter-spacing:2px;
      text-transform:uppercase;
    }

    .page {
      width:210mm;
      margin:0 auto 20px;
      padding:10mm;
      background:white;
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:12mm;
      page-break-after: always;
      box-shadow:0 2px 20px rgba(0,0,0,0.1);
    }

    .tent-card {
      width:90mm;
      overflow:hidden;
      border-radius:3mm;
      page-break-inside:avoid;
      box-shadow: 0 1px 6px rgba(0,0,0,0.12);
    }

    /* FRENTE */
    .side-number {
      height:${isTent ? "90mm" : "120mm"};
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      position:relative;
      ${isTent ? "" : "border-bottom:1px solid rgba(0,0,0,0.08);"}
    }

    .table-label {
      font-size:9px;
      text-transform:uppercase;
      letter-spacing:6px;
      font-weight:900;
      margin-bottom:6mm;
    }

    .number {
      font-size:100px;
      font-weight:900;
      line-height:1;
      font-style:italic;
    }

    .brand-name {
      position:absolute;
      bottom:8mm;
      font-size:10px;
      font-weight:900;
      letter-spacing:4px;
      text-transform:uppercase;
    }

    /* LÍNEA DE DOBLEZ */
    .fold-line {
      height:2px;
      border-top: 2px dashed #ccc;
      position:relative;
    }
    .fold-line::before {
      content:'✂ doblar aquí';
      position:absolute;
      top:-8px;
      left:50%;
      transform:translateX(-50%);
      font-size:7px;
      color:#bbb;
      background:white;
      padding:0 4px;
      letter-spacing:1px;
      white-space:nowrap;
    }

    /* REVERSO */
    .side-qr {
      height:${isTent ? "90mm" : "110mm"};
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:4mm;
    }

    .qr-wrapper {
      width:62mm;
      height:62mm;
      padding:3mm;
      border-radius:3mm;
      overflow:hidden;
    }

    .qr-instruction {
      font-size:8px;
      text-transform:uppercase;
      letter-spacing:2px;
      font-weight:900;
    }

    .mesa-badge {
      font-size:8px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:3px;
      padding:2mm 5mm;
      border-radius:10mm;
      color:white;
    }

    @media print {
      body { background:white; }
      .instructions { display:none; }
      .page { box-shadow:none; margin:0; }
      .tent-card { box-shadow:none; }
    }
  </style>
</head>
<body>
  <div class="instructions">
    Recortar por los bordes de cada tarjeta • Doblar por la línea punteada • ${tableConfig.restaurantName}
  </div>
  ${chunkArray(mesaNumbers, 4)
    .map(
      (page) => `
    <div class="page">
      ${page.map((n) => cardHTML(n)).join("")}
    </div>
  `,
    )
    .join("")}
  <script>
    window.onload = function() {
      // Esperar que los QRs carguen antes de imprimir
      const imgs = document.querySelectorAll('img');
      let loaded = 0;
      const total = imgs.length;
      if (total === 0) { window.print(); return; }
      imgs.forEach(img => {
        if (img.complete) {
          loaded++;
          if (loaded === total) window.print();
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded === total) window.print();
          };
        }
      });
    };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const generateMenuPDF = () => {
    // Agrupar items por categoría
    const grouped = {};
    menuItems.forEach((item) => {
      const cat = item.category || "Platos";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carta — ${tableConfig.restaurantName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --gold: #b8975a;
      --dark: #1a1208;
      --mid: #4a3f2f;
      --light: #f9f5ef;
      --cream: #fdf8f0;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Montserrat', sans-serif;
      background: var(--cream);
      color: var(--dark);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── PÁGINA ── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: var(--cream);
      position: relative;
      display: flex;
      flex-direction: column;
      page-break-after: always;
    }

    /* ── BORDE DECORATIVO ── */
    .border-frame {
      position: absolute;
      inset: 8mm;
      border: 1px solid var(--gold);
      pointer-events: none;
      z-index: 1;
    }
    .border-frame::before {
      content: '';
      position: absolute;
      inset: 3px;
      border: 1px solid rgba(184,151,90,0.3);
    }

    /* ── ESQUINAS DECORATIVAS ── */
    .corner {
      position: absolute;
      width: 12mm;
      height: 12mm;
    }
    .corner svg { width: 100%; height: 100%; }
    .corner.tl { top: 8mm; left: 8mm; }
    .corner.tr { top: 8mm; right: 8mm; transform: scaleX(-1); }
    .corner.bl { bottom: 8mm; left: 8mm; transform: scaleY(-1); }
    .corner.br { bottom: 8mm; right: 8mm; transform: scale(-1); }

    /* ── CONTENIDO ── */
    .content {
      padding: 20mm 20mm 18mm;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* ── CABECERA ── */
    .header {
      text-align: center;
      margin-bottom: 8mm;
    }

    .restaurant-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42pt;
      font-weight: 600;
      letter-spacing: 6px;
      text-transform: uppercase;
      color: var(--dark);
      line-height: 1;
    }

    .header-ornament {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 5mm 0 3mm;
    }

    .header-ornament .line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold));
    }
    .header-ornament .line.right {
      background: linear-gradient(to left, transparent, var(--gold));
    }

    .header-ornament .diamond {
      width: 6px;
      height: 6px;
      background: var(--gold);
      transform: rotate(45deg);
      flex-shrink: 0;
    }

    .menu-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13pt;
      font-weight: 400;
      font-style: italic;
      letter-spacing: 8px;
      text-transform: uppercase;
      color: var(--gold);
    }

    /* ── SEPARADOR ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 5mm 0;
    }
    .divider .line {
      flex: 1;
      height: 1px;
      background: rgba(184,151,90,0.35);
    }
    .divider .dot {
      width: 4px;
      height: 4px;
      background: var(--gold);
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ── CATEGORÍAS ── */
    .category {
      margin-bottom: 7mm;
    }

    .category-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15pt;
      font-weight: 600;
      font-style: italic;
      color: var(--gold);
      letter-spacing: 1px;
      margin-bottom: 3mm;
      padding-bottom: 2mm;
      border-bottom: 1px solid rgba(184,151,90,0.2);
      text-align: center;
      text-transform: uppercase;
    }

    /* ── ITEMS ── */
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 2.5mm 0;
      gap: 6mm;
    }

    .item-left {
      flex: 1;
      display: flex;
      align-items: baseline;
      gap: 0;
      min-width: 0;
    }

    .item-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 10.5pt;
      font-weight: 500;
      color: var(--dark);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .item-dots {
      flex: 1;
      border-bottom: 1px dotted rgba(74,63,47,0.25);
      margin: 0 6px;
      margin-bottom: 3px;
      min-width: 10px;
    }

    .item-description {
      font-size: 8pt;
      color: var(--mid);
      font-style: italic;
      font-weight: 300;
      margin-top: 1mm;
      line-height: 1.4;
    }

    .item-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13pt;
      font-weight: 600;
      color: var(--dark);
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }

    /* ── PIE ── */
    .footer {
      text-align: center;
      margin-top: auto;
      padding-top: 6mm;
    }

    .footer-text {
      font-size: 7.5pt;
      color: rgba(74,63,47,0.5);
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 300;
    }

    .footer-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      color: var(--gold);
      letter-spacing: 3px;
      font-style: italic;
    }

    @media print {
      body { background: var(--cream); }
      .page { margin: 0; }
    }
  </style>
</head>
<body>

<div class="page">
  <!-- Borde y esquinas -->
  <div class="border-frame"></div>

  <div class="corner tl">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L2 38" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M2 2 L38 2" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M8 8 L8 20" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <path d="M8 8 L20 8" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <circle cx="2" cy="2" r="2" fill="#b8975a"/>
    </svg>
  </div>
  <div class="corner tr">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L2 38" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M2 2 L38 2" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M8 8 L8 20" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <path d="M8 8 L20 8" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <circle cx="2" cy="2" r="2" fill="#b8975a"/>
    </svg>
  </div>
  <div class="corner bl">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L2 38" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M2 2 L38 2" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M8 8 L8 20" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <path d="M8 8 L20 8" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <circle cx="2" cy="2" r="2" fill="#b8975a"/>
    </svg>
  </div>
  <div class="corner br">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L2 38" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M2 2 L38 2" stroke="#b8975a" stroke-width="1.5"/>
      <path d="M8 8 L8 20" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <path d="M8 8 L20 8" stroke="#b8975a" stroke-width="0.7" opacity="0.5"/>
      <circle cx="2" cy="2" r="2" fill="#b8975a"/>
    </svg>
  </div>

  <div class="content">
    <!-- Cabecera -->
    <div class="header">
      <div class="restaurant-name">${tableConfig.restaurantName}</div>
      <div class="header-ornament">
        <div class="line"></div>
        <div class="diamond"></div>
        <div class="diamond" style="opacity:0.5;transform:rotate(45deg) scale(0.6);"></div>
        <div class="diamond"></div>
        <div class="line right"></div>
      </div>
      <div class="menu-title">Carta</div>
    </div>

    <!-- Items agrupados por categoría -->
    ${Object.entries(grouped)
      .map(
        ([cat, items]) => `
      <div class="divider">
        <div class="line"></div>
        <div class="dot"></div>
        <div class="dot" style="opacity:0.4;transform:scale(0.6);"></div>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="category">
        <div class="category-title">${cat}</div>
        ${items
          .map(
            (item) => `
          <div class="menu-item">
            <div class="item-left">
              <span class="item-name">${item.name}</span>
              <span class="item-dots"></span>
            </div>
            <span class="item-price">$${item.price.toLocaleString("es-CO")}</span>
          </div>
          ${item.description ? `<div class="item-description">${item.description}</div>` : ""}
        `,
          )
          .join("")}
      </div>
    `,
      )
      .join("")}

    <!-- Pie -->
    <div class="footer">
      <div class="divider" style="margin-bottom:4mm;">
        <div class="line"></div>
        <div class="diamond" style="width:5px;height:5px;background:#b8975a;transform:rotate(45deg);flex-shrink:0;"></div>
        <div class="line"></div>
      </div>
      <div class="footer-text">Los precios incluyen impuestos • Gracias por su visita</div>
      <div class="footer-name" style="margin-top:2mm;">${tableConfig.restaurantName}</div>
    </div>
  </div>
</div>

<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Vista previa de un hablador de muestra
  const PreviewCard = ({ num }) => (
    <div className="w-32 rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none">
      {/* Frente */}
      <div
        className="h-28 flex flex-col items-center justify-center relative"
        style={{ background: palette.front }}
      >
        {tableConfig.showTableLabel && (
          <span
            className="text-[7px] font-black uppercase tracking-[4px] mb-1"
            style={{ color: palette.frontText + "88" }}
          >
            MESA
          </span>
        )}
        <span
          className="text-5xl font-black italic leading-none"
          style={{ color: palette.frontText }}
        >
          {num}
        </span>
        <span
          className="absolute bottom-2 text-[6px] font-black uppercase tracking-widest"
          style={{ color: palette.frontText + "66" }}
        >
          {tableConfig.restaurantName}
        </span>
      </div>

      {/* Línea de doblez */}
      {tableConfig.layout === "tent" && (
        <div className="border-t-2 border-dashed border-white/20 bg-neutral-800 py-0.5 text-center">
          <span className="text-[5px] text-neutral-600 uppercase tracking-widest">
            doblar
          </span>
        </div>
      )}

      {/* Reverso */}
      <div
        className="h-28 flex flex-col items-center justify-center gap-1.5"
        style={{ background: palette.back }}
      >
        {tableConfig.showQR && (
          <>
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white p-0.5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableConfig.qrUrl + "?mesa=" + num)}`}
                alt={`QR Mesa ${num}`}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-[6px] font-black uppercase tracking-widest"
              style={{ color: palette.backText }}
            >
              {tableConfig.scanText}
            </span>
          </>
        )}
        <span
          className="text-[6px] font-black uppercase px-2 py-0.5 rounded-full"
          style={{ background: palette.accent, color: "#fff" }}
        >
          MESA {num}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3">
              <Settings size={24} className="md:w-7 md:h-7 text-violet-500" />
              <span>Utilidades</span>
            </h1>
            <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-2 md:mt-3">
              Herramientas para tu restaurante
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 overflow-x-auto pb-2">
          {[
            { id: "qr", label: "Códigos QR", icon: QrCode },
            { id: "pdf", label: "Menús PDF", icon: FileText },

            { id: "tables", label: "Habladores Mesa", icon: Square },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[9px] whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === id
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                  : "bg-neutral-900/40 border border-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ─── QR Tab ─── */}
        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl">
              <h2 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-3">
                <QrCode className="text-violet-500" size={20} />
                QR del Menú
              </h2>
              <div className="space-y-6">
                <div className="p-8 bg-black rounded-xl flex items-center justify-center min-h-[300px]">
                  <img
                    src={generateQRImage()}
                    alt="QR Menu"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    URL del QR
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrUrls.menu}
                      readOnly
                      className="flex-1 bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyURL}
                      className={`px-4 py-2 rounded-lg font-black uppercase text-[8px] transition-all ${copiedQR ? "bg-green-500/20 text-green-400" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"}`}
                    >
                      {copiedQR ? "✓ Copiado" : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={downloadQR}
                  className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={16} /> Descargar QR
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl">
              <h2 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-3">
                <Users className="text-green-500" size={20} />
                QR Empleados
              </h2>
              <div className="space-y-6">
                <div className="p-8 bg-black rounded-xl flex items-center justify-center min-h-[300px]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrls.employees)}`}
                    alt="QR Employees"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    URL de Acceso
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrUrls.employees}
                      readOnly
                      className="flex-1 bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrls.employees);
                        setCopiedQR(true);
                        setTimeout(() => setCopiedQR(false), 2000);
                      }}
                      className={`px-4 py-2 rounded-lg font-black uppercase text-[8px] transition-all ${copiedQR ? "bg-green-500/20 text-green-400" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"}`}
                    >
                      {copiedQR ? "✓ Copiado" : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrls.employees)}`;
                    link.download = "qr-empleados.png";
                    link.click();
                  }}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={16} /> Descargar QR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PDF Tab ─── */}
        {activeTab === "pdf" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* ── Editor de items ── */}
            <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl space-y-6">
              <h2 className="text-lg font-black uppercase flex items-center gap-3">
                <FileText className="text-violet-500" size={18} />
                Carta del menú
              </h2>

              {/* Agregar item */}
              <div className="p-4 bg-neutral-900/60 border border-white/5 rounded-xl space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  Añadir plato
                </p>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Nombre del plato"
                  className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newItem.category || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    placeholder="Categoría (ej: Entradas)"
                    className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                  />
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    placeholder="Precio"
                    className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>
                <input
                  type="text"
                  value={newItem.description || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Descripción breve (opcional)"
                  className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  onClick={handleAddMenuItem}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-black uppercase text-[9px] py-2.5 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={14} /> Añadir plato
                </button>
              </div>

              {/* Lista agrupada */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {Object.entries(
                  menuItems.reduce((acc, item) => {
                    const cat = item.category || "Platos";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {}),
                ).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[8px] font-black uppercase tracking-widest text-amber-500/70 mb-2 border-b border-white/5 pb-1">
                      {cat}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 group py-1.5 px-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[9px] text-neutral-500 italic truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-black text-violet-400 shrink-0">
                            ${formatPrice(item.price)}
                          </span>
                          <button
                            onClick={() => handleRemoveMenuItem(item.id)}
                            className="text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <p className="text-center text-neutral-600 text-sm py-8">
                    Agrega platos para generar la carta
                  </p>
                )}
              </div>

              <button
                onClick={generateMenuPDF}
                disabled={menuItems.length === 0}
                className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
              >
                <Printer size={16} /> Imprimir carta
              </button>
            </div>

            {/* ── Vista previa de la carta ── */}
            <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Eye size={14} className="text-violet-400" />
                  Vista previa
                </h3>
                <p className="text-[8px] text-neutral-600 uppercase font-bold mt-0.5">
                  Así lucirá impresa
                </p>
              </div>

              {/* Mini carta simulada */}
              <div
                className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-amber-900/20 relative"
                style={{
                  background: "#fdf8f0",
                  minHeight: "420px",
                  fontFamily: "Georgia, serif",
                }}
              >
                {/* Borde dorado decorativo */}
                <div
                  style={{
                    position: "absolute",
                    inset: "8px",
                    border: "1px solid #b8975a",
                    pointerEvents: "none",
                    zIndex: 1,
                    borderRadius: "4px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "12px",
                    border: "1px solid rgba(184,151,90,0.2)",
                    pointerEvents: "none",
                    zIndex: 1,
                    borderRadius: "2px",
                  }}
                />

                <div
                  style={{
                    padding: "28px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                  }}
                >
                  {/* Cabecera */}
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#1a1208",
                        lineHeight: 1,
                      }}
                    >
                      {tableConfig.restaurantName}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        margin: "8px 0 4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          background:
                            "linear-gradient(to right, transparent, #b8975a)",
                        }}
                      />
                      <div
                        style={{
                          width: "5px",
                          height: "5px",
                          background: "#b8975a",
                          transform: "rotate(45deg)",
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          background:
                            "linear-gradient(to left, transparent, #b8975a)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "5px",
                        textTransform: "uppercase",
                        color: "#b8975a",
                        fontStyle: "italic",
                      }}
                    >
                      Carta
                    </div>
                  </div>

                  {/* Items agrupados */}
                  {menuItems.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "#ccc",
                          fontSize: "11px",
                          fontStyle: "italic",
                        }}
                      >
                        Añade platos para ver la carta
                      </p>
                    </div>
                  ) : (
                    Object.entries(
                      menuItems.reduce((acc, item) => {
                        const cat = item.category || "Platos";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(item);
                        return acc;
                      }, {}),
                    ).map(([cat, items]) => (
                      <div key={cat} style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "1px",
                              background: "rgba(184,151,90,0.3)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "8px",
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              color: "#b8975a",
                              fontStyle: "italic",
                              fontWeight: 700,
                            }}
                          >
                            {cat}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "1px",
                              background: "rgba(184,151,90,0.3)",
                            }}
                          />
                        </div>
                        {items.map((item) => (
                          <div key={item.id}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                gap: "8px",
                                padding: "3px 0",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    color: "#1a1208",
                                    whiteSpace: "nowrap",
                                    fontFamily: "sans-serif",
                                  }}
                                >
                                  {item.name}
                                </span>
                                <span
                                  style={{
                                    flex: 1,
                                    borderBottom:
                                      "1px dotted rgba(74,63,47,0.2)",
                                    margin: "0 5px 2px",
                                    minWidth: "10px",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#1a1208",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ${formatPrice(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p
                                style={{
                                  fontSize: "8px",
                                  color: "#7a6a50",
                                  fontStyle: "italic",
                                  marginBottom: "2px",
                                  paddingLeft: "2px",
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  )}

                  {/* Pie */}
                  {menuItems.length > 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "auto",
                        paddingTop: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "rgba(184,151,90,0.25)",
                          }}
                        />
                        <div
                          style={{
                            width: "4px",
                            height: "4px",
                            background: "#b8975a",
                            transform: "rotate(45deg)",
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "rgba(184,151,90,0.25)",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "7px",
                          color: "rgba(74,63,47,0.45)",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        Los precios incluyen impuestos
                      </p>
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#b8975a",
                          fontStyle: "italic",
                          marginTop: "3px",
                        }}
                      >
                        {tableConfig.restaurantName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Gestionar Menú Tab ─── */}
        {activeTab === "menu" && (
          <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl">
            <h2 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-3">
              <Menu className="text-violet-500" size={20} />
              Gestionar Menú
            </h2>
            <div className="mb-8 p-6 bg-neutral-900/50 border border-white/5 rounded-xl">
              <h3 className="text-sm font-black uppercase mb-4 text-neutral-400">
                Añadir Nuevo Item
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Nombre del plato"
                  className="bg-neutral-800 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                />
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  placeholder="Precio"
                  className="bg-neutral-800 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  onClick={handleAddMenuItem}
                  className="bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-black uppercase text-[9px] transition-all flex items-center justify-center gap-2 py-2.5"
                >
                  <Plus size={16} /> Añadir
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-neutral-400 mb-4">
                Items del Menú ({menuItems.length})
              </h3>
              {menuItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-neutral-900/50 border border-white/5 rounded-lg flex items-center justify-between group hover:border-violet-500/30 transition-all"
                >
                  <div className="flex gap-4 items-center flex-1">
                    <span className="text-neutral-600 font-black">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-violet-400 text-sm font-black">
                        ${formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMenuItem(item.id)}
                    className="p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── HABLADORES DE MESA Tab ─── */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ── Panel de configuración ── */}
              <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl space-y-6">
                <h2 className="text-lg md:text-xl font-black uppercase flex items-center gap-3">
                  <Square className="text-violet-500" size={20} />
                  Habladores de Mesa
                </h2>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
                  <AlertCircle
                    size={14}
                    className="text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-[8px] md:text-[9px] text-blue-300">
                    Genera tarjetas doblables con número de mesa en el frente y
                    código QR en el reverso. Imprime, recorta y dobla sobre la
                    mesa.
                  </p>
                </div>

                {/* Rango de mesas */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-3">
                    Rango de Mesas
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5">
                        Desde
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tableConfig.startNumber}
                        onChange={(e) =>
                          setTableConfig({
                            ...tableConfig,
                            startNumber: e.target.value,
                          })
                        }
                        className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5">
                        Hasta
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tableConfig.endNumber}
                        onChange={(e) =>
                          setTableConfig({
                            ...tableConfig,
                            endNumber: e.target.value,
                          })
                        }
                        className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5">
                        Total
                      </label>
                      <div className="w-full bg-neutral-900 border border-violet-500/30 rounded-lg px-3 py-2 text-violet-400 font-black text-center">
                        {totalMesas}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nombre del restaurante */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-3">
                    Restaurante
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5">
                        Nombre (aparece en frente)
                      </label>
                      <input
                        type="text"
                        value={tableConfig.restaurantName}
                        onChange={(e) =>
                          setTableConfig({
                            ...tableConfig,
                            restaurantName: e.target.value,
                          })
                        }
                        placeholder="Nombre de tu restaurante"
                        className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5 flex items-center gap-1">
                        <Link size={10} /> URL del QR (menú)
                      </label>
                      <input
                        type="text"
                        value={tableConfig.qrUrl}
                        onChange={(e) =>
                          setTableConfig({
                            ...tableConfig,
                            qrUrl: e.target.value,
                          })
                        }
                        placeholder="https://tu-restaurante.com/menu"
                        className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-1.5">
                        Texto bajo el QR
                      </label>
                      <input
                        type="text"
                        value={tableConfig.scanText}
                        onChange={(e) =>
                          setTableConfig({
                            ...tableConfig,
                            scanText: e.target.value,
                          })
                        }
                        placeholder="Escanea para pedir"
                        className="w-full bg-neutral-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Diseño */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                    <Palette size={12} /> Diseño
                  </p>
                  <div className="space-y-3">
                    {/* Color scheme */}
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-2">
                        Esquema de color
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            id: "dark",
                            label: "Oscuro",
                            bg: "bg-black",
                            text: "text-white",
                          },
                          {
                            id: "light",
                            label: "Claro",
                            bg: "bg-white",
                            text: "text-black",
                          },
                          {
                            id: "branded",
                            label: "Color marca",
                            bg: "",
                            text: "text-white",
                          },
                        ].map((scheme) => (
                          <button
                            key={scheme.id}
                            onClick={() =>
                              setTableConfig({
                                ...tableConfig,
                                colorScheme: scheme.id,
                              })
                            }
                            className={`py-2 px-3 rounded-lg text-[8px] font-black uppercase border transition-all ${
                              tableConfig.colorScheme === scheme.id
                                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                : "border-white/5 bg-neutral-800 text-neutral-400 hover:border-white/20"
                            }`}
                          >
                            {scheme.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color de marca (solo si branded) */}
                    {tableConfig.colorScheme === "branded" && (
                      <div className="flex items-center gap-3">
                        <label className="text-[8px] font-bold uppercase text-neutral-600">
                          Color
                        </label>
                        <input
                          type="color"
                          value={tableConfig.brandColor}
                          onChange={(e) =>
                            setTableConfig({
                              ...tableConfig,
                              brandColor: e.target.value,
                            })
                          }
                          className="w-10 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {tableConfig.brandColor}
                        </span>
                      </div>
                    )}

                    {/* Layout tipo */}
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-600 mb-2">
                        Formato impresión
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            setTableConfig({ ...tableConfig, layout: "tent" })
                          }
                          className={`py-2 px-3 rounded-lg text-[8px] font-black uppercase border transition-all flex flex-col items-center gap-1 ${tableConfig.layout === "tent" ? "border-violet-500 bg-violet-500/20 text-violet-300" : "border-white/5 bg-neutral-800 text-neutral-400"}`}
                        >
                          <LayoutTemplate size={14} />
                          Hablador (doblar)
                        </button>
                        <button
                          onClick={() =>
                            setTableConfig({ ...tableConfig, layout: "flat" })
                          }
                          className={`py-2 px-3 rounded-lg text-[8px] font-black uppercase border transition-all flex flex-col items-center gap-1 ${tableConfig.layout === "flat" ? "border-violet-500 bg-violet-500/20 text-violet-300" : "border-white/5 bg-neutral-800 text-neutral-400"}`}
                        >
                          <Square size={14} />
                          Tarjeta plana
                        </button>
                      </div>
                    </div>

                    {/* Opciones extra */}
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] font-bold uppercase text-neutral-500">
                        Mostrar etiqueta "MESA"
                      </label>
                      <button
                        onClick={() =>
                          setTableConfig({
                            ...tableConfig,
                            showTableLabel: !tableConfig.showTableLabel,
                          })
                        }
                        className={`w-9 h-5 rounded-full transition-all relative ${tableConfig.showTableLabel ? "bg-violet-500" : "bg-neutral-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tableConfig.showTableLabel ? "left-4" : "left-0.5"}`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] font-bold uppercase text-neutral-500">
                        Incluir QR en el reverso
                      </label>
                      <button
                        onClick={() =>
                          setTableConfig({
                            ...tableConfig,
                            showQR: !tableConfig.showQR,
                          })
                        }
                        className={`w-9 h-5 rounded-full transition-all relative ${tableConfig.showQR ? "bg-violet-500" : "bg-neutral-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tableConfig.showQR ? "left-4" : "left-0.5"}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Vista previa ── */}
              <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-2">
                    <Eye size={14} className="text-violet-400" />
                    Vista Previa
                  </h3>
                  <p className="text-[8px] text-neutral-600 uppercase font-bold">
                    Los QRs son reales y funcionan
                  </p>
                </div>

                {/* Preview de 2 habladores */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {mesaNumbers.slice(0, 2).map((n) => (
                    <PreviewCard key={n} num={n} />
                  ))}
                  {totalMesas > 2 && (
                    <div className="flex items-center justify-center w-32">
                      <span className="text-neutral-600 text-[9px] font-black uppercase">
                        +{totalMesas - 2} más
                      </span>
                    </div>
                  )}
                </div>

                {/* Instrucciones de uso */}
                <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-4 space-y-2.5 mt-auto">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                    Instrucciones de impresión
                  </p>
                  {[
                    {
                      n: "1",
                      txt: "Haz clic en Imprimir y selecciona tu impresora",
                    },
                    { n: "2", txt: "Imprime en papel bond o cartulina A4" },
                    {
                      n: "3",
                      txt: "Recorta cada hablador por la línea exterior",
                    },
                    {
                      n: "4",
                      txt: "Dobla por la línea punteada y apoya en la mesa",
                    },
                  ].map(({ n, txt }) => (
                    <div key={n} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[8px] font-black flex items-center justify-center shrink-0">
                        {n}
                      </span>
                      <span className="text-[9px] text-neutral-400">{txt}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={generateTableCardsPDF}
                  disabled={totalMesas <= 0}
                  className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                >
                  <Printer size={16} />
                  Imprimir {totalMesas} Hablador{totalMesas !== 1 ? "es" : ""}
                </button>
              </div>
            </div>

            {/* ── Grid de todas las mesas ── */}
            {totalMesas > 0 && (
              <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-4">
                  Todas las mesas ({totalMesas})
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
                  {mesaNumbers.map((n) => (
                    <div
                      key={n}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center border border-white/5 hover:border-violet-500/30 transition-all cursor-default"
                      style={{ background: palette.front }}
                    >
                      <span
                        className="text-[7px] font-black uppercase tracking-widest"
                        style={{ color: palette.frontText + "66" }}
                      >
                        {tableConfig.showTableLabel ? "MESA" : ""}
                      </span>
                      <span
                        className="text-base font-black italic leading-none"
                        style={{ color: palette.frontText }}
                      >
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// helper: partir array en chunks
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size));
  return result;
}

export default Utilidades;
