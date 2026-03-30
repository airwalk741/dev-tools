"use client";

import React from "react";
import { RequestItem } from "./RequestItem";
import { ApiRequest, Folder } from "@/contexts/WorkspaceContext";

interface FolderItemProps {
  folder: Folder;
  requests: ApiRequest[];
  activeId: string;
  editingFolderId: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onToggle: (id: string, isOpen: boolean) => void;
  onEditStart: (id: string) => void;
  onEditSave: (id: string, name: string) => void;
  onDeleteFolder: (e: React.MouseEvent, id: string, name: string) => void;
  onCreateRequest: (folderId: string) => void;
  onDropToFolder: (e: React.DragEvent, folderId: string) => void;
  onSelectRequest: (id: string) => void;
  onDeleteRequest: (e: React.MouseEvent, id: string, name: string) => void;
  onDragStartRequest: (e: React.DragEvent, id: string) => void;
}

export const FolderItem = ({
  folder,
  requests,
  activeId,
  editingFolderId,
  inputRef,
  onToggle,
  onEditStart,
  onEditSave,
  onDeleteFolder,
  onCreateRequest,
  onDropToFolder,
  onSelectRequest,
  onDeleteRequest,
  onDragStartRequest,
}: FolderItemProps) => {
  return (
    <li
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        onDropToFolder(e, folder.id);
      }}
    >
      {/* 폴더 헤더 영역 */}
      <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 rounded cursor-pointer group">
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => onToggle(folder.id, !folder.isOpen)}
        >
          {/* 화살표 아이콘 */}
          <span
            className="text-[10px] transition-transform duration-200 text-gray-400"
            style={{
              transform: folder.isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▼
          </span>

          {/* 폴더 이름 편집 모드 vs 일반 모드 */}
          {editingFolderId === folder.id ? (
            <input
              ref={inputRef}
              value={folder.name}
              onChange={(e) => onEditSave(folder.id, e.target.value)}
              onBlur={() => onEditStart("")} // 편집 종료
              onKeyDown={(e) => e.key === "Enter" && onEditStart("")}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-blue-400 rounded px-1 text-sm font-bold w-full outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                onEditStart(folder.id);
              }}
              className="text-sm font-bold text-gray-700 truncate"
            >
              📁 {folder.name}
            </span>
          )}
        </div>

        {/* 폴더 액션 버튼들 */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditStart(folder.id);
            }}
            title="이름 수정"
            className="text-gray-400 hover:text-blue-500 text-[10px]"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateRequest(folder.id);
            }}
            title="요청 추가"
            className="text-blue-600 font-black px-1"
          >
            +
          </button>
          <button
            onClick={(e) => onDeleteFolder(e, folder.id, folder.name)}
            title="폴더 삭제"
            className="text-red-400 font-black px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 폴더 하위 요청 목록  */}
      {folder.isOpen && (
        <ul className="ml-4 border-l border-gray-100 pl-1 mt-1 space-y-0.5">
          {requests.map((req) => (
            <RequestItem
              key={req.id}
              request={req}
              isActive={activeId === req.id}
              onSelect={onSelectRequest}
              onDelete={onDeleteRequest}
              onDragStart={onDragStartRequest}
            />
          ))}
          {requests.length === 0 && (
            <li className="text-[10px] text-gray-400 py-1 pl-2 italic">
              No requests
            </li>
          )}
        </ul>
      )}
    </li>
  );
};
