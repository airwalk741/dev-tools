"use client";

import { useState } from "react";

interface ResponseViewerProps {
  status: string;
  time: string;
  data: string;
}

export default function ResponseViewer({
  status,
  time,
  data,
}: ResponseViewerProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);

      const el = document.createElement("textarea");
      el.value = data;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <section className="w-1/2 flex flex-col bg-white min-w-0 border-l border-gray-200">
      <div className="h-12 flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>Response</span>
          {status && (
            <div className="flex gap-4">
              <span className="text-green-600">Status: {status}</span>
              <span className="text-gray-400">Time: {time}</span>
            </div>
          )}
        </div>

        {data && (
          <button
            onClick={copyToClipboard}
            className={`transition-all duration-200 px-2 py-1 rounded hover:bg-gray-200 active:scale-95 ${
              isCopied ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      <div className="flex-1 p-4 bg-gray-900 overflow-y-auto custom-scrollbar">
        <pre className="font-mono text-sm text-green-400 w-full whitespace-pre-wrap break-words">
          <code>{data || "Send a request to see the response here."}</code>
        </pre>
      </div>
    </section>
  );
}
