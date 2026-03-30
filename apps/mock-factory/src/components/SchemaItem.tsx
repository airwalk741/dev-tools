// src/components/SchemaItem.ts

import { type Dispatch, type SetStateAction } from "react";
import { DATA_TYPES, type DataType } from "../constants/data";
import type { Field } from "../types/data";

interface PropsTypes {
  field: Field;
  setFields: Dispatch<SetStateAction<Field[]>>;
}

const SchemaItem = ({ field, setFields }: PropsTypes) => {
  return (
    <>
      <div
        key={field.id}
        className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 space-y-3"
      >
        <div className="flex gap-2">
          <input
            value={field.keyName}
            onChange={(e) =>
              setFields((pre) =>
                pre.map((f) =>
                  f.id === field.id ? { ...f, keyName: e.target.value } : f,
                ),
              )
            }
            className="flex-1 border-2 border-transparent rounded-lg px-3 py-1.5 text-sm font-bold bg-white outline-none focus:border-blue-400 shadow-sm"
          />
          <select
            value={field.type}
            onChange={(e) =>
              setFields((pre) =>
                pre.map((f) =>
                  f.id === field.id
                    ? { ...f, type: e.target.value as DataType }
                    : f,
                ),
              )
            }
            className="w-32 border-2 border-transparent rounded-lg px-2 py-1.5 text-sm font-bold bg-white outline-none shadow-sm"
          >
            {Object.values(DATA_TYPES).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setFields((pre) => pre.filter((f) => f.id !== field.id))
            }
            className="text-gray-300 hover:text-red-500 font-bold px-1"
          >
            ✕
          </button>
        </div>

        {/* 일련번호용 추가 설정 */}
        {field.type === DATA_TYPES.AUTO_INC && (
          <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-blue-50 shadow-inner">
            <input
              placeholder="접두사"
              className="border-b border-gray-100 text-[12px] font-bold p-1 outline-none focus:border-blue-300"
              onChange={(e) =>
                setFields((pre) =>
                  pre.map((f) =>
                    f.id === field.id
                      ? {
                          ...f,
                          config: {
                            ...f.config,
                            prefix: e.target.value,
                          },
                        }
                      : f,
                  ),
                )
              }
            />
            <input
              type="number"
              placeholder="시작"
              className="border-b border-gray-100 text-[12px] font-bold p-1 outline-none focus:border-blue-300 text-right"
              onChange={(e) =>
                setFields((pre) =>
                  pre.map((f) =>
                    f.id === field.id
                      ? {
                          ...f,
                          config: {
                            ...f.config,
                            startFrom: parseInt(e.target.value) || 1,
                          },
                        }
                      : f,
                  ),
                )
              }
            />
          </div>
        )}

        {/* 무작위 선택용 추가 설정 */}
        {field.type === DATA_TYPES.RANDOM_PICK && (
          <input
            placeholder="옵션들을 콤마(,)로 구분"
            className="w-full bg-white p-3 rounded-xl border border-purple-50 shadow-inner text-[12px] font-bold outline-none focus:border-purple-300"
            onChange={(e) =>
              setFields((pre) =>
                pre.map((f) =>
                  f.id === field.id
                    ? {
                        ...f,
                        config: {
                          ...f.config,
                          options: e.target.value,
                        },
                      }
                    : f,
                ),
              )
            }
          />
        )}
      </div>
    </>
  );
};

export default SchemaItem;
