// src/App.tsx
import { useState } from "react";
import PDFUpload from "./components/PDFUpload";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfPages, setPdfPages] = useState<number>(0);

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <h1 className="text-2xl font-bold">NotebookLM Clone</h1>
      <PDFUpload
        setPdfFile={setPdfFile}
        setChunks={setChunks}
        setPdfUrl={setPdfUrl}
        setPdfPages={setPdfPages}
      />
      {pdfFile && chunks.length > 0 && (
        <ChatBox chunks={chunks} pdfUrl={pdfUrl} totalPages={pdfPages} />
      )}
    </div>
  );
}
