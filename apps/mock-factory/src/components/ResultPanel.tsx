import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";

interface PropsTypes {
  previewData: any;
}

const ResultPanel = ({ previewData }: PropsTypes) => {
  return (
    <main className="flex-1 flex flex-col bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <div className="h-16 border-b-2 border-gray-100 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
            JSON Output
          </span>
        </div>
        <div className="flex items-center gap-4">
          <CopyButton previewData={previewData} />
          <DownloadButton previewData={previewData} />
        </div>
      </div>
      <div className="flex-1 bg-[#0d1117] p-8 overflow-y-auto custom-scrollbar">
        <pre className="text-[12px] font-mono text-emerald-400 font-bold leading-relaxed">
          <code>{JSON.stringify(previewData, null, 2)}</code>
        </pre>
      </div>
    </main>
  );
};

export default ResultPanel;
