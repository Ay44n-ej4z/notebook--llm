// src/components/ChatBox.tsx
import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { GiNextButton, GiPreviousButton } from "react-icons/gi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
  chunks: { text: string; page: number }[];
  pdfUrl: string;
  totalPages: number;
};

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

const ChatBox: React.FC<Props> = ({ chunks, pdfUrl, totalPages }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; cites?: number[] }[]
  >([]);
  const [pageNumber, setPageNumber] = useState(1);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", text: input }]);

    try {
      const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input,
          model: "text-embedding-3-small",
        }),
      });

      const embeddingData = await embeddingRes.json();
      const embedding = embeddingData?.data?.[0]?.embedding;
      if (!embedding) throw new Error("Failed to get embedding");

      const scoredChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const chunkEmbeddingRes = await fetch(
            "https://api.openai.com/v1/embeddings",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                input: chunk.text,
                model: "text-embedding-3-small",
              }),
            }
          );

          const chunkData = await chunkEmbeddingRes.json();
          const chunkEmbedding = chunkData?.data?.[0]?.embedding;

          const score = cosineSimilarity(embedding, chunkEmbedding);
          return { ...chunk, score };
        })
      );

      const topChunks = scoredChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const prompt = `Use the following context to answer:\n\n${topChunks
        .map((c) => `Page ${c.page}: ${c.text}`)
        .join("\n\n")}\n\nQ: ${input}`;

      const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const completionData = await completionRes.json();
      const messageContent = completionData?.choices?.[0]?.message?.content;

      if (!messageContent) throw new Error("No message content in completion");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: messageContent,
          cites: topChunks.map((c) => c.page),
        },
      ]);

      setInput("");
    } catch (err) {
      console.error("Error during chat handling:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="w-full h-[80vh] flex rounded-xl shadow-xl overflow-hidden">
      {/* Chat Panel */}
      <div className="w-[35%] flex flex-col justify-between p-4">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineDocumentText className="text-purple-600 text-2xl" />
            <div>
              <h2 className="font-semibold text-lg">Your document is ready!</h2>
              <p className="text-sm text-gray-600 mt-1">
                You can now ask questions about your document.
              </p>
              <ul className="mt-2 text-sm text-gray-500 list-disc ml-5">
                <li>What is the main topic of this document?</li>
                <li>Can you summarize the key points?</li>
              </ul>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="overflow-y-auto max-h-[50vh] pr-2 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`flex  items-center max-w-[90%] p-3 rounded-lg shadow-sm ${msg.role === "user"
                    ? "bg-slate-800 flex-row-reverse"
                    : "bg-slate-600"
                    }`}
                >
                  {/* Avatar */}
                  <div className="text-2xl bg-gray-100 rounded-full">
                    {msg.role === "user" ? "🧑" : "🤖"}
                  </div>
                  {/* Message Text */}
                  <div className="text-sm m-2 text-gray-100 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="mt-4 flex items-center gap-2">
          <input
            className="flex-1 bg-[#3b3b3b] px-4 py-2 rounded-2xl shadow-sm focus:outline-none transition-shadow duration-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the document..."
          />

          <button
            className="bg-purple-800 text-white p-2 rounded-lg hover:cursor-pointer hover:bg-purple-900 transition"
            onClick={handleSend}
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* PDF Panel */}
      <div className="w-[65%] p-4 flex flex-col items-center">
        <Document file={pdfUrl}>
          <Page pageNumber={pageNumber} width={500} />
        </Document>
        <div className="flex gap-4 mt-4">
          <button
            className="px-4 py-2 rounded-lg hover:bg-gray-600 bg-gray-800 hover:cursor-pointer"
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          >
            <GiPreviousButton />
          </button>
          <span>
            Page {pageNumber} of {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-lg hover:bg-gray-600 bg-gray-800 hover:cursor-pointer"
            onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
          >
            <GiNextButton />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
