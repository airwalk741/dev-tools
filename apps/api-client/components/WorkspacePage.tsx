"use client";

import { useState, useMemo } from "react";
import RequestHeader from "./RequestHeader";
import Sidebar from "./Sidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import { useWorkspaceStore } from "@/contexts/WorkspaceContext";

export default function WorkspacePage() {
  const { requests, activeId, isHydrated } = useWorkspaceStore();

  const [responseStatus, setResponseStatus] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [responseData, setResponseData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeRequest = useMemo(() => {
    return requests.find((r) => r.id === activeId) || null;
  }, [requests, activeId]);

  const sendRequest = async () => {
    if (!activeRequest?.url) return;

    setIsLoading(true);
    setResponseStatus("Sending...");
    setResponseData("");

    try {
      let parsedBody = null;
      if (activeRequest.method !== "GET" && activeRequest.body) {
        try {
          parsedBody = JSON.parse(activeRequest.body);
        } catch (e) {
          throw new Error("Body JSON 형식이 올바르지 않습니다.");
        }
      }

      const headersObj: Record<string, string> = {};
      activeRequest.headers?.forEach((h) => {
        if (h.key.trim()) headersObj[h.key.trim()] = h.value.trim();
      });

      if (activeRequest.authType === "Bearer" && activeRequest.bearerToken) {
        headersObj["Authorization"] = `Bearer ${activeRequest.bearerToken}`;
      }

      const targetUrl = activeRequest.url;
      const urlWithProtocol = targetUrl.includes("://")
        ? targetUrl
        : `http://${targetUrl}`;
      const urlObj = new URL(urlWithProtocol);

      activeRequest.params?.forEach((p) => {
        if (p.key.trim()) {
          urlObj.searchParams.append(p.key.trim(), p.value.trim());
        }
      });

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: urlObj.toString(),
          method: activeRequest.method,
          headers: headersObj,
          data: parsedBody,
          skipSsl: activeRequest.skipSsl,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Request Failed");

      setResponseStatus(`${result.status} ${result.statusText}`);
      setResponseTime(`${result.time}ms`);
      setResponseData(JSON.stringify(result.data, null, 2));
    } catch (error: any) {
      setResponseStatus("Error");
      setResponseData(error.message || "Request Failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="h-screen w-full flex bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <Sidebar />

      {activeRequest ? (
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <RequestHeader
            activeRequest={activeRequest}
            sendRequest={sendRequest}
            isLoading={isLoading}
          />

          <div className="flex-1 flex overflow-hidden">
            <RequestEditor activeRequest={activeRequest} />

            <ResponseViewer
              status={responseStatus}
              time={responseTime}
              data={responseData}
            />
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          요청을 선택하거나 새로 생성하세요.
        </div>
      )}
    </div>
  );
}
