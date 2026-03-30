import { NextResponse } from "next/server";
import { Agent, fetch } from "undici";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let url = "";
    let method = "";
    let headers: Record<string, string> = {};
    let skipSsl = false;
    let outboundBody: any = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      url = formData.get("__proxy_url") as string;
      method = formData.get("__proxy_method") as string;
      headers = JSON.parse((formData.get("__proxy_headers") as string) || "{}");
      skipSsl = formData.get("__proxy_skipSsl") === "true";

      const outboundFormData = new FormData();
      formData.forEach((value, key) => {
        if (!key.startsWith("__proxy_")) {
          outboundFormData.append(key, value);
        }
      });
      outboundBody = outboundFormData;

      Object.keys(headers).forEach((key) => {
        if (key.toLowerCase() === "content-type") delete headers[key];
      });
    } else {
      const body = await request.json();
      url = body.url;
      method = body.method;
      headers = body.headers || {};
      skipSsl = body.skipSsl;

      if (method !== "GET" && method !== "HEAD" && body.data) {
        outboundBody = JSON.stringify(body.data);
        if (!headers["Content-Type"] && !headers["content-type"]) {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    // 한글이 있으면 인코딩
    const safeHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      const isNonAscii = /[^\x00-\x7F]/.test(value);
      safeHeaders[key] = isNonAscii ? encodeURIComponent(value) : value;
    });

    // URL에 한글이 있을 경우를 대비해 인코딩
    const safeUrl = url.includes("%") ? url : encodeURI(url);

    const dispatcher = new Agent({
      connect: { rejectUnauthorized: !skipSsl },
    });

    const startTime = Date.now();

    const response = await fetch(safeUrl, {
      method,
      headers: safeHeaders,
      body: outboundBody,
      dispatcher,
    });

    const text = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = text;
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      time: Date.now() - startTime,
      data: responseData,
    });
  } catch (error: any) {
    console.error("[Proxy Error]:", error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        statusText: "Proxy Request Failed",
        data: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
