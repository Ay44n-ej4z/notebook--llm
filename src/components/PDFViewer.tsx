import React, { useState } from "react";
// import workerSrc from "pdfjs-dist/build/pdf.worker.min?url"; // ✅ Vite-friendly way
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 👇 use worker from unpkg CDN or local copy if needed
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
  pdfUrl: string;
  totalPages: number;
};

const PDFViewer: React.FC<Props> = ({ pdfUrl, totalPages }) => {
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div>
      <Document file={pdfUrl}>
        <Page pageNumber={pageNumber} width={600} />
      </Document>
      <div className="flex gap-2 items-center mt-2">
        <button onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}>
          Prev
        </button>
        <span>
          Page {pageNumber} of {totalPages}
        </span>
        <button
          onClick={() => setPageNumber(Math.min(pageNumber + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
