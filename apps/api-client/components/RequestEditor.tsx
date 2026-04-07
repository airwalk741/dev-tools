"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { ApiRequest, useWorkspaceStore } from "../contexts/WorkspaceContext";

interface RequestEditorProps {
  activeRequest: ApiRequest;
}

export default function RequestEditor({ activeRequest }: RequestEditorProps) {
  const {
    updateRequest,
    addFormDataItem,
    updateFormDataItem,
    removeFormDataItem,
  } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState("Params");
  const tabs = ["Params", "Body", "Headers", "Auth"];
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFieldChange = (field: keyof ApiRequest, value: any) => {
    updateRequest(activeRequest.id, { [field]: value });
  };

  const updateArrayItem = (
    field: "params" | "headers",
    index: number,
    keyOrValue: "key" | "value",
    newValue: string,
  ) => {
    const newArray = [...activeRequest[field]];
    newArray[index] = { ...newArray[index], [keyOrValue]: newValue };
    handleFieldChange(field, newArray);
  };

  const addArrayItem = (field: "params" | "headers") => {
    handleFieldChange(field, [...activeRequest[field], { key: "", value: "" }]);
  };

  const removeArrayItem = (field: "params" | "headers", index: number) => {
    handleFieldChange(
      field,
      activeRequest[field].filter((_, i) => i !== index),
    );
  };

  const commonInputClass =
    "h-[38px] border border-gray-200 rounded px-3 text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all";

  return (
    <section className="w-full h-full flex flex-col min-w-0 bg-white">
      <div className="flex border-b border-gray-200 bg-gray-50/5 h-12">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-xs font-black transition-all focus:outline-none ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/20">
        {activeTab === "Params" && (
          <div className="space-y-2">
            {activeRequest.params.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p.key || ""}
                  onChange={(e) =>
                    updateArrayItem("params", i, "key", e.target.value)
                  }
                  placeholder="Key"
                  className={`flex-1 ${commonInputClass}`}
                />
                <input
                  value={p.value || ""}
                  onChange={(e) =>
                    updateArrayItem("params", i, "value", e.target.value)
                  }
                  placeholder="Value"
                  className={`flex-1 ${commonInputClass}`}
                />
                <button
                  onClick={() => removeArrayItem("params", i)}
                  className="text-gray-400 hover:text-red-500 font-black px-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("params")}
              className="text-xs text-blue-600 mt-2 font-black uppercase tracking-tighter hover:underline"
            >
              + Add Param
            </button>
          </div>
        )}

        {activeTab === "Body" && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex gap-4 text-xs font-black p-1">
              {["json", "form-data"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={activeRequest.bodyType === type}
                    onChange={() => handleFieldChange("bodyType", type)}
                    className="accent-blue-600 w-3.5 h-3.5"
                  />
                  <span
                    className={
                      activeRequest.bodyType === type
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    {type === "json" ? "JSON (raw)" : "Form-Data"}
                  </span>
                </label>
              ))}
            </div>

            {activeRequest.bodyType === "json" && (
              <div className="flex-1 border border-gray-200 rounded-md overflow-hidden bg-white min-h-[350px]">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={activeRequest.body || ""}
                  onChange={(value) => handleFieldChange("body", value || "")}
                  options={{
                    automaticLayout: true,
                    fontSize: 13,
                    fontFamily: "Pretendard, monospace",
                    minimap: { enabled: false },
                  }}
                />
              </div>
            )}

            {activeRequest.bodyType === "form-data" && (
              <div className="space-y-2">
                {activeRequest.formData.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item.key || ""}
                      onChange={(e) =>
                        updateFormDataItem(activeRequest.id, i, {
                          key: e.target.value,
                        })
                      }
                      placeholder="Key"
                      className={`flex-1 ${commonInputClass}`}
                    />

                    <select
                      value={item.type || "text"}
                      onChange={(e) =>
                        updateFormDataItem(activeRequest.id, i, {
                          type: e.target.value as "text" | "file",
                          value: "",
                        })
                      }
                      className={`w-20 bg-gray-50 text-[10px] font-black cursor-pointer ${commonInputClass} px-1`}
                    >
                      <option value="text">TEXT</option>
                      <option value="file">FILE</option>
                    </select>

                    <div className="flex-[1.5] relative">
                      {item.type === "text" ? (
                        <input
                          value={(item.value as string) || ""}
                          onChange={(e) =>
                            updateFormDataItem(activeRequest.id, i, {
                              value: e.target.value,
                            })
                          }
                          placeholder="Value"
                          className={`w-full ${commonInputClass}`}
                        />
                      ) : (
                        <div className="flex-[1.5] relative">
                          <input
                            type="file"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[
                                `${activeRequest.id}-${i}`
                              ] = el;
                            }}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              updateFormDataItem(activeRequest.id, i, {
                                value: file,
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRefs.current[
                                `${activeRequest.id}-${i}`
                              ]?.click()
                            }
                            className={`w-full text-left truncate flex items-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 ${commonInputClass}`}
                          >
                            <span className="truncate">
                              {item.value instanceof File
                                ? `📄 ${item.value.name}`
                                : "📁 Select File"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFormDataItem(activeRequest.id, i)}
                      className="text-gray-300 hover:text-red-500 px-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFormDataItem(activeRequest.id)}
                  className="text-[10px] text-blue-600 mt-2 font-black uppercase tracking-widest"
                >
                  + Add Field
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "Headers" && (
          <div className="space-y-2">
            {activeRequest.headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={h.key || ""}
                  onChange={(e) =>
                    updateArrayItem("headers", i, "key", e.target.value)
                  }
                  placeholder="Key"
                  className={`flex-1 ${commonInputClass}`}
                />
                <input
                  value={h.value || ""}
                  onChange={(e) =>
                    updateArrayItem("headers", i, "value", e.target.value)
                  }
                  placeholder="Value"
                  className={`flex-1 ${commonInputClass}`}
                />
                <button
                  onClick={() => removeArrayItem("headers", i)}
                  className="text-gray-400 hover:text-red-500 font-black px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("headers")}
              className="text-xs text-blue-600 mt-2 font-black uppercase tracking-tighter hover:underline"
            >
              + Add Header
            </button>
          </div>
        )}

        {activeTab === "Auth" && (
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
            <select
              value={activeRequest.authType || "None"}
              onChange={(e) => handleFieldChange("authType", e.target.value)}
              className={`w-full bg-gray-50 ${commonInputClass}`}
            >
              <option value="None">No Auth</option>
              <option value="Bearer">Bearer Token</option>
              <option value="Basic">Basic Auth</option>
            </select>
            {activeRequest.authType === "Bearer" && (
              <textarea
                value={activeRequest.bearerToken || ""}
                onChange={(e) =>
                  handleFieldChange("bearerToken", e.target.value)
                }
                className="w-full border border-gray-200 rounded-md p-3 text-sm font-mono h-32 focus:border-blue-500 outline-none resize-none bg-gray-50/30"
                placeholder="Paste your token here..."
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
