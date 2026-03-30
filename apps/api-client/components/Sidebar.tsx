"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "@/contexts/WorkspaceContext";
import { RequestItem } from "./RequestItem";
import { FolderItem } from "./FolderItem";

export default function Sidebar() {
  const {
    folders,
    requests,
    activeId,
    createFolder,
    createRequestInFolder,
    selectRequest,
    moveRequest,
    deleteRequest,
    deleteFolder,
    updateFolder,
  } = useWorkspaceStore();

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFolderId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingFolderId]);

  const confirmDeleteRequest = (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation();
    if (window.confirm(`'${name}' 요청을 삭제하시겠습니까?`)) deleteRequest(id);
  };

  const confirmDeleteFolder = (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation();
    if (
      window.confirm(`'${name}' 폴더와 그 안의 모든 요청을 삭제하시겠습니까?`)
    )
      deleteFolder(id);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData("requestId");
    if (requestId) moveRequest(requestId, folderId);
  };

  return (
    <aside
      className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 select-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, null)} // 루트 영역 드롭
    >
      {/* 1. 사이드바 상단 헤더 */}
      <div className="h-16 p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
        <span className="font-black text-lg text-blue-600 tracking-tighter">
          ⚡ API Client
        </span>
        <div className="flex gap-1">
          <button
            onClick={createFolder}
            className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded font-black hover:bg-gray-100 uppercase transition-colors"
          >
            Fld+
          </button>
          <button
            onClick={() => createRequestInFolder(null)}
            className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded font-black hover:bg-gray-100 uppercase transition-colors"
          >
            Req+
          </button>
        </div>
      </div>

      {/* 2. 컬렉션 목록 영역 */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2 mt-4 opacity-70">
          Collections
        </div>

        <ul className="space-y-1">
          {/* 폴더 기반 목록 */}
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              requests={requests.filter((r) => r.folderId === folder.id)}
              activeId={activeId}
              editingFolderId={editingFolderId}
              inputRef={inputRef}
              onToggle={(id, isOpen) => updateFolder(id, { isOpen })}
              onEditStart={setEditingFolderId}
              onEditSave={(id, name) => updateFolder(id, { name })}
              onDeleteFolder={confirmDeleteFolder}
              onCreateRequest={createRequestInFolder}
              onDropToFolder={handleDrop}
              onSelectRequest={selectRequest}
              onDeleteRequest={confirmDeleteRequest}
              onDragStartRequest={(e, id) =>
                e.dataTransfer.setData("requestId", id)
              }
            />
          ))}

          {/* 루트(폴더 없음) 요청 목록 */}
          {requests
            .filter((r) => !r.folderId)
            .map((req) => (
              <RequestItem
                key={req.id}
                request={req}
                isActive={activeId === req.id}
                onSelect={selectRequest}
                onDelete={confirmDeleteRequest}
                onDragStart={(e, id) => e.dataTransfer.setData("requestId", id)}
              />
            ))}
        </ul>
      </div>
    </aside>
  );
}
