"use client";

import { useWorkspaceStore } from "@/contexts/WorkspaceContext";
import React, { useState, useMemo, useRef } from "react";
import ResponseViewer from "./ResponseViewer";
import RequestEditor from "./RequestEditor";
import RequestHeader from "./RequestHeader";
import Sidebar from "./Sidebar";

export default function WorkspacePage() {
  const { requests, activeId, isHydrated } = useWorkspaceStore();

  const [responseStatus, setResponseStatus] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [responseData, setResponseData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const isDragging = useRef(false);

  function onDrag(e: MouseEvent) {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidthPercentage =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newWidthPercentage > 20 && newWidthPercentage < 80) {
      setLeftWidth(newWidthPercentage);
    }
  }

  function stopDrag() {
    isDragging.current = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  const activeRequest = useMemo(() => {
    return requests.find((r) => r.id === activeId) || null;
  }, [requests, activeId]);

  const sendRequest = async () => {
    if (!activeRequest?.url) return;

    setIsLoading(true);
    setResponseStatus("Sending...");
    setResponseData("");

    try {
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

      let res;

      if (activeRequest.bodyType === "form-data") {
        const formDataPayload = new FormData();

        // 프록시 서버에 필요한 메타 정보 추가
        formDataPayload.append("__proxy_url", urlObj.toString());
        formDataPayload.append("__proxy_method", activeRequest.method);
        formDataPayload.append("__proxy_headers", JSON.stringify(headersObj));
        formDataPayload.append(
          "__proxy_skipSsl",
          String(activeRequest.skipSsl),
        );
        formDataPayload.append("__proxy_bodyType", "form-data");

        // 실제 사용자가 입력한 Form Data 추가
        activeRequest.formData.forEach((item) => {
          if (!item.key.trim()) return;
          if (item.type === "file" && item.value instanceof File) {
            // 파일 객체 그대로 추가
            formDataPayload.append(item.key, item.value);
          } else {
            // 텍스트 값 추가
            formDataPayload.append(item.key, (item.value as string) || "");
          }
        });

        res = await fetch("/api/proxy", {
          method: "POST",
          body: formDataPayload,
        });
      } else {
        let parsedBody = null;
        if (activeRequest.method !== "GET" && activeRequest.body) {
          try {
            parsedBody = JSON.parse(activeRequest.body);
          } catch (e) {
            throw new Error("Body JSON 형식이 올바르지 않습니다.");
          }
        }

        res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: urlObj.toString(),
            method: activeRequest.method,
            headers: headersObj,
            data: parsedBody,
            skipSsl: activeRequest.skipSsl,
            bodyType: "json",
          }),
        });
      }

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

          <div ref={containerRef} className="flex-1 flex overflow-hidden">
            <div
              style={{ width: `${leftWidth}%` }}
              className="h-full border-r border-gray-200"
            >
              <RequestEditor activeRequest={activeRequest} />
            </div>

            <div
              className="w-0 relative z-10 cursor-col-resize group"
              onMouseDown={startDrag}
            >
              <div className="absolute left-[-5px] top-0 bottom-0 w-[10px] cursor-col-resize z-20"></div>
              <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
            </div>

            <div
              style={{ flex: "1 1 0%" }}
              className="h-full min-w-0 overflow-hidden"
            >
              <ResponseViewer
                status={responseStatus}
                time={responseTime}
                data={responseData}
              />
            </div>
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
