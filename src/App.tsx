import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { BRIDGE_CMYK_VALS } from './lib/pantoneData';
import { cmykToRgb, rgbToHex } from './lib/colors';
import { Printer, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [generating, setGenerating] = useState(false);

  const generatePDF = () => {
    setGenerating(true);
    
    // Slight delay to allow UI to update
    setTimeout(() => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const colorsPerPage = 36; // 6 columns x 6 rows
      const totalColors = BRIDGE_CMYK_VALS.length;
      const totalPages = Math.ceil(totalColors / colorsPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();

        const startIdx = page * colorsPerPage;
        const pageColors = BRIDGE_CMYK_VALS.slice(startIdx, startIdx + colorsPerPage);

        // Layout Constants (A4: 210 x 297 mm)
        const squareSize = 25; 
        const colSpacing = 6; 
        const rowSpacing = 19; 
        
        const gridWidth = (6 * squareSize) + (5 * colSpacing);
        const marginX = (210 - gridWidth) / 2;
        const marginY = 15;

        pageColors.forEach((cmyk, index) => {
          const col = index % 6;
          const row = Math.floor(index / 6);

          const x = marginX + col * (squareSize + colSpacing);
          const y = marginY + row * (squareSize + rowSpacing);

          const rgb = cmykToRgb(cmyk);
          const hex = rgbToHex(rgb);

          // Draw the square
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          doc.rect(x, y, squareSize, squareSize, 'F');

          // Light border for very light colors
          // Sum of CMY < 20 and K < 5
          if ((cmyk.c + cmyk.m + cmyk.y < 20) && cmyk.k < 5) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.rect(x, y, squareSize, squareSize, 'S');
          }

          // Labels
          const labelY = y + squareSize + 4;
          doc.setTextColor(40, 40, 40); 

          // CMYK: C M Y K (Highlighted)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(`C:${cmyk.c} M:${cmyk.m} Y:${cmyk.y} K:${cmyk.k}`, x, labelY);

          // RGB: R G B
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.text(`RGB:${rgb.r} ${rgb.g} ${rgb.b}`, x, labelY + 3.5);

          // HEX: #XXXXXX
          doc.text(`HEX:${hex.toUpperCase()}`, x, labelY + 7);
        });

        // Footer
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("colorpro è un progetto di plumacreativa.it - tutti i diritti riservati", 105, 288, { align: 'center' });
      }

      doc.save('ColorPro_Print_6x6.pdf');
      setGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-stone-200 border border-stone-100 p-10 text-center"
      >
        <div className="bg-[#9D7068] w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-[#9D7068]/30">
          <Printer size={40} />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-stone-800 uppercase mb-4">
          COLORPRO<span className="text-[#D0A49B]">.</span>PDF
        </h1>
        
        <p className="text-stone-500 text-sm leading-relaxed mb-10">
          Generatore automatico del documento PDF stampabile basato sui valori Color Bridge. 
          Griglia 6x6 (36 colori per pagina) con valori CMYK, RGB e HEX.
        </p>

        <button
          onClick={generatePDF}
          disabled={generating}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-stone-900/20 group active:scale-[0.98]"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>GENERAZIONE IN CORSO...</span>
            </>
          ) : (
            <>
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              <span>SCARICA PDF STAMPABILE</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-8 border-t border-stone-50 flex justify-between items-center text-[10px] font-bold text-stone-300 uppercase tracking-widest">
          <span>A4 PORTRAIT</span>
          <span>6x6 GRID</span>
          <span>{BRIDGE_CMYK_VALS.length} COLORI</span>
        </div>
      </motion.div>
    </div>
  );
}
