"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// --- Types ---

export interface Folder {
  id: string;
  name: string;
  isOpen: boolean;
}

export interface FormDataItem {
  key: string;
  value: string | File | null;
  type: "text" | "file";
}

export interface ApiRequest {
  id: string;
  folderId: string | null;
  name: string;
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  params: { key: string; value: string }[];
  body: string;
  authType: string;
  bearerToken: string;
  skipSsl: boolean;
  bodyType: "json" | "form-data";
  formData: FormDataItem[];
}

interface WorkspaceContextType {
  folders: Folder[];
  requests: ApiRequest[];
  activeId: string;
  isHydrated: boolean;
  createFolder: () => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (folderId: string) => void;
  createRequestInFolder: (folderId?: string | null) => void;
  updateRequest: (id: string, updates: Partial<ApiRequest>) => void;
  deleteRequest: (id: string) => void;
  selectRequest: (id: string) => void;
  moveRequest: (requestId: string, targetFolderId: string | null) => void;
  addFormDataItem: (requestId: string) => void;
  updateFormDataItem: (
    requestId: string,
    index: number,
    updates: Partial<FormDataItem>,
  ) => void;
  removeFormDataItem: (requestId: string, index: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);
const STORAGE_KEY = "api-client-safe-final-v1";

const createNewRequestObject = (
  id: string,
  folderId: string | null,
): ApiRequest => ({
  id,
  folderId,
  name: "New Request",
  method: "GET",
  url: "",
  headers: [{ key: "", value: "" }],
  params: [{ key: "", value: "" }],
  body: "",
  authType: "None",
  bearerToken: "",
  skipSsl: false,
  bodyType: "json",
  formData: [{ key: "", value: "", type: "text" }],
});

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsHydrated(true);
      const newId = Date.now().toString();
      setRequests([createNewRequestObject(newId, null)]);
      setActiveId(newId);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        setFolders(Array.isArray(parsed.folders) ? parsed.folders : []);

        const loadedReqs = (
          Array.isArray(parsed.requests) ? parsed.requests : []
        ).map((req: any) => ({
          ...req,
          url: req.url || "",
          body: req.body || "",
          bearerToken: req.bearerToken || "",
          headers: (req.headers || []).map((h: any) => ({
            key: h.key || "",
            value: h.value || "",
          })),
          params: (req.params || []).map((p: any) => ({
            key: p.key || "",
            value: p.value || "",
          })),
          bodyType: req.bodyType || "json",
          formData: (req.formData || []).map((f: any) => ({
            key: f.key || "",
            type: f.type || "text",
            value: f.type === "file" ? null : f.value || "",
          })),
        }));

        setRequests(loadedReqs);
        const isValidActiveId = loadedReqs.some(
          (r: ApiRequest) => r.id === parsed.activeId,
        );
        setActiveId(
          isValidActiveId ? parsed.activeId : loadedReqs[0]?.id || "",
        );
      }
    } catch (e) {
      console.error("Failed to load storage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ folders, requests, activeId }),
      );
    }
  }, [folders, requests, activeId, isHydrated]);

  const createFolder = () =>
    setFolders((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "New Folder", isOpen: false },
    ]);
  const updateFolder = (id: string, updates: Partial<Folder>) =>
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  const deleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setRequests((prev) => prev.filter((r) => r.folderId !== folderId));
  };

  const createRequestInFolder = (folderId: string | null = null) => {
    const newId = Date.now().toString();
    setRequests((prev) => [...prev, createNewRequestObject(newId, folderId)]);
    if (folderId)
      setFolders((pre) =>
        pre.map((f) => (f.id === folderId ? { ...f, isOpen: true } : f)),
      );
    setActiveId(newId);
  };

  const updateRequest = (id: string, updates: Partial<ApiRequest>) =>
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  const deleteRequest = (id: string) =>
    setRequests((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (activeId === id) setActiveId(filtered[0]?.id || "");
      return filtered;
    });

  const selectRequest = (id: string) => setActiveId(id);
  const moveRequest = (requestId: string, targetFolderId: string | null) =>
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, folderId: targetFolderId } : r,
      ),
    );

  const addFormDataItem = (requestId: string) =>
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              formData: [...r.formData, { key: "", value: "", type: "text" }],
            }
          : r,
      ),
    );
  const updateFormDataItem = (
    requestId: string,
    index: number,
    updates: Partial<FormDataItem>,
  ) =>
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newFormData = [...r.formData];
        newFormData[index] = { ...newFormData[index], ...updates };
        return { ...r, formData: newFormData };
      }),
    );
  const removeFormDataItem = (requestId: string, index: number) =>
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, formData: r.formData.filter((_, i) => i !== index) }
          : r,
      ),
    );

  return (
    <WorkspaceContext.Provider
      value={{
        folders,
        requests,
        activeId,
        isHydrated,
        createFolder,
        updateFolder,
        deleteFolder,
        createRequestInFolder,
        updateRequest,
        deleteRequest,
        selectRequest,
        moveRequest,
        addFormDataItem,
        updateFormDataItem,
        removeFormDataItem,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceStore = () => {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspaceStore must be used within WorkspaceProvider");
  return context;
};
