import React from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";
import { FiUploadCloud } from "react-icons/fi";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

type Props = {
  setPdfFile: (file: File | null) => void;
  setChunks: (chunks: any[]) => void;
  setPdfUrl: (url: string) => void;
  setPdfPages: (n: number) => void;
};

const PDFUpload: React.FC<Props> = ({
  setPdfFile,
  setChunks,
  setPdfUrl,
  setPdfPages,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPdfFile(file);
    setPdfUrl(url);

    const pdf = await pdfjsLib.getDocument(url).promise;
    const chunks: any[] = [];
    setPdfPages(pdf.numPages);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      chunks.push({ text, page });
    }

    setChunks(chunks);
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center h-[70vh] w-full">
      <div
        onClick={triggerFileDialog}
        className="cursor-pointer p-8 w-xl bg-[#4d4d4d] rounded-xl shadow-lg flex flex-col items-center gap-4 hover:shadow-xl transition"
      >
        <div className="bg-purple-100 p-4 rounded-full">
          <FiUploadCloud className="text-slate-700 text-4xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-100">
          Upload PDF to start chatting
        </h2>
        <p className="text-sm text-gray-100">Click or drag and drop your file here</p>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PDFUpload;
