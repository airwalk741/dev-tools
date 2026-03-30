import { useState } from "react";

interface PropsTypes {
  previewData: any;
}

const DownloadButton = ({ previewData }: PropsTypes) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadJson = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const dataString = JSON.stringify(previewData, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mock.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  return (
    <button
      onClick={downloadJson}
      className="flex items-center gap-1.5 text-[12px] font-black text-gray-600 hover:text-blue-600 transition-colors duration-200 group disabled:opacity-50"
      disabled={isDownloading}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-300 ease-out 
      ${isDownloading ? "animate-download-bounce text-blue-600" : "group-hover:-translate-y-0.5"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>

      <span>{isDownloading ? "Downloading..." : "Download"}</span>
    </button>
  );
};

export default DownloadButton;
