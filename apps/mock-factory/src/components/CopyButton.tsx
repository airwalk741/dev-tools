import { useRef, useState } from "react";

interface PropsTypes {
  previewData: any;
}

const CopyButton = ({ previewData }: PropsTypes) => {
  const [isCopied, setIsCopied] = useState(false);

  const timerRef = useRef<number | null>(null);

  const copyToClipboard = () => {
    const data = JSON.stringify(previewData);

    const el = document.createElement("textarea");
    el.value = data;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    setIsCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setIsCopied(false);
      timerRef.current = null;
    }, 2000);
  };
  return (
    <button
      onClick={copyToClipboard}
      className="flex items-center gap-1 text-[12px] font-black  hover:text-blue-700 transition-transform active:scale-95"
    >
      {isCopied ? (
        <div className="flex items-center animate-in zoom-in duration-300">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-500">Copied!</span>
        </div>
      ) : (
        "Copy"
      )}
    </button>
  );
};

export default CopyButton;
