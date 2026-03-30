"use client";

import { ApiRequest, useWorkspaceStore } from "@/contexts/WorkspaceContext";
import { getMethodColor } from "@/utils/color";

interface HeaderProps {
  activeRequest: ApiRequest;
  sendRequest: () => void;
  isLoading: boolean;
}

export default function RequestHeader({
  activeRequest,
  sendRequest,
  isLoading,
}: HeaderProps) {
  const { updateRequest } = useWorkspaceStore();

  const handleChange = (field: keyof ApiRequest, value: any) => {
    updateRequest(activeRequest.id, { [field]: value });
  };

  return (
    <header className="h-16 border-b border-gray-200 flex items-center px-4 gap-3 bg-white shrink-0">
      {/* Request Name */}
      <input
        value={activeRequest.name}
        onChange={(e) => handleChange("name", e.target.value)}
        className="w-32 border border-gray-200 rounded-md px-2 py-1.5 text-sm font-black bg-gray-50 focus:outline-none"
      />

      {/* HTTP Method Select */}
      <select
        value={activeRequest.method}
        onChange={(e) => handleChange("method", e.target.value)}
        className={`border border-gray-200 rounded-md px-2 py-1.5 text-xs font-black bg-gray-50 focus:outline-none transition-colors ${getMethodColor(activeRequest.method)}`}
      >
        <option value="GET" className={`${getMethodColor("GET")} font-bold`}>
          GET
        </option>
        <option value="POST" className={`${getMethodColor("POST")} font-bold`}>
          POST
        </option>
        <option value="PUT" className={`${getMethodColor("PUT")} font-bold`}>
          PUT
        </option>
        <option
          value="DELETE"
          className={`${getMethodColor("DELETE")} font-bold`}
        >
          DELETE
        </option>
      </select>

      {/* URL Input */}
      <input
        type="text"
        value={activeRequest.url}
        onChange={(e) => handleChange("url", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendRequest()}
        placeholder="URL을 입력하세요"
        className="flex-1 border border-gray-200 rounded-md px-4 py-1.5 text-sm font-bold focus:border-blue-500 font-mono"
      />

      {/* SSL Toggle */}
      <label
        className={`flex items-center gap-1 px-2 py-1.5 rounded border cursor-pointer transition-all select-none ${
          activeRequest.skipSsl
            ? "bg-orange-50 border-orange-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <input
          type="checkbox"
          checked={activeRequest.skipSsl}
          onChange={(e) => handleChange("skipSsl", e.target.checked)}
          className="hidden"
        />
        <span
          className={`text-[10px] font-black ${activeRequest.skipSsl ? "text-orange-600" : "text-gray-400"}`}
        >
          SSL
        </span>
      </label>

      {/* Send Button */}
      <button
        onClick={sendRequest}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-md text-sm font-black transition-all shadow-sm disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </header>
  );
}
