"use client";

import React from "react";
import { ApiRequest } from "@/contexts/WorkspaceContext";
import { getMethodColor } from "@/utils/color";

interface RequestItemProps {
  request: ApiRequest;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const RequestItem = ({
  request,
  isActive,
  onSelect,
  onDelete,
  onDragStart,
}: RequestItemProps) => {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, request.id)}
      onClick={() => onSelect(request.id)}
      className={`px-2 py-1.5 rounded cursor-pointer text-sm font-semibold flex items-center justify-between group transition-colors ${
        isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        {/* HTTP 메서드 레이블 */}
        <span
          className={`text-[10px] font-black w-8 shrink-0 uppercase ${getMethodColor(request.method)}`}
        >
          {request.method}
        </span>
        {/* 요청 이름 */}
        <span className="truncate">{request.name}</span>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => onDelete(e, request.id, request.name)}
        className="hidden group-hover:block text-gray-400 hover:text-red-500 font-black"
      >
        ✕
      </button>
    </li>
  );
};
