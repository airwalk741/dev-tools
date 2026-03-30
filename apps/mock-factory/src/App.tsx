import { useState } from "react";
import SchemaEditor from "./components/SchemaEditor";
import ResultPanel from "./components/ResultPanel";

const MockFactory = () => {
  const [previewData, setPreviewData] = useState<any>([]);

  return (
    <div className="h-screen bg-gray-50 p-6 flex flex-col font-sans antialiased text-gray-900 overflow-hidden">
      <div className="max-w-400 mx-auto w-full h-full flex gap-6">
        {/* 설정 사이드바 */}
        <SchemaEditor setPreviewData={setPreviewData} />

        {/* 결과 보기 */}
        <ResultPanel previewData={previewData} />
      </div>
    </div>
  );
};

export default MockFactory;
