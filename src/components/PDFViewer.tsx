// src/components/PDFCanvasViewer.tsx
import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const PDFCanvasViewer = ({ pdfUrl, pageNumber }: { pdfUrl: string; pageNumber: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber); // use dynamic page

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas!.getContext("2d");

      canvas!.height = viewport.height;
      canvas!.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    };

    loadPDF();
  }, [pdfUrl, pageNumber]);

  return <canvas
  ref={canvasRef}
  style={{ display: "block", margin: "auto", transform: "rotate(100deg)" }}
  className="bg-white rounded shadow"
/>
;
};

export default PDFCanvasViewer;
