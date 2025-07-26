// src/components/ChatBox.tsx
import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";

type Props = {
  chunks: { text: string; page: number }[];
  pdfUrl: string;
  totalPages: number;
};


const ChatBox: React.FC<Props> = ({ chunks, pdfUrl }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; cites?: number[] }[]
  >([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    // Funny loaders list
    const funnyLoaders = [
      "🤖 Thinking really hard... maybe too hard... 🧠💥",
      "📚 Reading the whole PDF like it's a bedtime story...",
      "🧠 Crunching numbers and flipping pages...",
      "👓 Looking for answers with microscopic precision...",
      "☕ Brewing the perfect answer... stand by!",
      "🕵️ Investigating your question like Sherlock Holmes...",
      "👾 Fighting document goblins to extract truth...",
    ];
    const randomLoader =
      funnyLoaders[Math.floor(Math.random() * funnyLoaders.length)];

    const loadingMessage = { role: "assistant", text: randomLoader };

    // Show user message + funny assistant loading message
    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    try {
      const context = chunks
        .map((c) => `Page ${c.page}: ${c.text}`)
        .join("\n\n");

      const prompt = `${input}:\n\n${context}\n\nQuestion: ${input}`;

      const completionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_MISTRALAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "PDF Q&A ChatBox",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const completionData = await completionRes.json();
      const messageContent = completionData?.choices?.[0]?.message?.content;

      if (!messageContent) throw new Error("No message content in completion");

      // Replace loading message with actual response
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove the loading message
        {
          role: "assistant",
          text: messageContent,
          cites: [],
        },
      ]);

      setInput("");
    } catch (err) {
      console.error("Error during chat handling:", err);

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove loading message
        {
          role: "assistant",
          text: "⚠️ Something went wrong. Try again in a moment.",
        },
      ]);
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
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex  items-center max-w-[90%] p-3 rounded-lg shadow-sm ${msg.role === "user"
                    ? "bg-slate-800 flex-row-reverse"
                    : "bg-slate-600"
                    }`}
                >
                  <div className="text-2xl bg-gray-100 rounded-full">
                    {msg.role === "user" ? "🧑" : "🤖"}
                  </div>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
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
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          width="100%"
          height="100%"
          className="rounded-lg shadow-inner border-0"
          title="PDF Viewer"
        ></iframe>
        {/* <div className="flex gap-4 mt-4">

        </div> */}
      </div>
    </div>
  );
};

export default ChatBox;
