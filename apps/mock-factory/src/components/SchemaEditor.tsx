import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DATA_TYPES } from "../constants/data";
import { fakerKO as faker } from "@faker-js/faker";
import type { Field } from "../types/data";
import SchemaItem from "./SchemaItem";

interface PropsTypes {
  setPreviewData: Dispatch<SetStateAction<any>>;
}

const SchemaEditor = ({ setPreviewData }: PropsTypes) => {
  const [globalConfig, setGlobalConfig] = useState({
    outputType: "v_list",
    count: 5,
  });
  const [fields, setFields] = useState<Field[]>([
    { id: "1", keyName: "id", type: DATA_TYPES.UUID, config: {} },
    { id: "2", keyName: "이름", type: DATA_TYPES.FULL_NAME, config: {} },
    { id: "3", keyName: "연락처", type: DATA_TYPES.PHONE, config: {} },
    { id: "4", keyName: "주소", type: DATA_TYPES.ADDRESS, config: {} },
  ]);

  // --- 1. 데이터 생성 엔진 (Faker 매핑) ---
  const generateData = () => {
    const { count } = globalConfig;

    const createSingleItem = (index: number) => {
      const item: Record<string, any> = {};

      fields.forEach((field) => {
        switch (field.type) {
          case DATA_TYPES.FULL_NAME:
            item[field.keyName] = faker.person.fullName();
            break;
          case DATA_TYPES.EMAIL:
            item[field.keyName] = faker.internet.email();
            break;
          case DATA_TYPES.PHONE:
            item[field.keyName] = faker.phone.number();
            break;
          case DATA_TYPES.JOB_TITLE:
            item[field.keyName] = faker.person.jobTitle();
            break;
          case DATA_TYPES.ADDRESS:
            item[field.keyName] =
              `${faker.location.state()} ${faker.location.city()} ${faker.location.streetAddress()}`;
            break;
          case DATA_TYPES.DATE_RECENT:
            item[field.keyName] = faker.date.recent().toISOString();
            break;
          case DATA_TYPES.LOREM_SENTENCE:
            item[field.keyName] = faker.lorem.sentence();
            break;
          case DATA_TYPES.LOREM_PARA:
            item[field.keyName] = faker.lorem.paragraph();
            break;
          case DATA_TYPES.UUID:
            item[field.keyName] = faker.string.uuid();
            break;
          case DATA_TYPES.AUTO_INC:
            const start = field.config.startFrom ?? 1;
            item[field.keyName] =
              `${field.config.prefix ?? ""}${start + index}`;
            break;
          case DATA_TYPES.RANDOM_PICK:
            const opts = field.config.options
              ?.split(",")
              .map((o) => o.trim()) || [""];
            item[field.keyName] = faker.helpers.arrayElement(opts);
            break;
        }
      });
      return item;
    };

    const result =
      globalConfig.outputType === "v_unit"
        ? createSingleItem(0)
        : Array.from({ length: count }, (_, i) => createSingleItem(i));

    setPreviewData(result);
  };

  useEffect(() => {
    generateData();
  }, []);

  // --- 2. 핸들러 ---
  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now().toString(),
        keyName: `field_${fields.length + 1}`,
        type: DATA_TYPES.LOREM_SENTENCE,
        config: {},
      },
    ]);
  };

  return (
    <aside className="w-120 bg-white rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
      <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter uppercase">
          Mock Factory
        </h1>
        <button
          onClick={generateData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          데이터 생성
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* 설정 그룹 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest">
              출력 형식
            </label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold bg-gray-50 outline-none focus:border-blue-500"
              onChange={(e) =>
                setGlobalConfig({
                  ...globalConfig,
                  outputType: e.target.value,
                })
              }
            >
              <option value={"v_list"}>리스트 (배열)</option>
              <option value={"v_unit"}>단일 객체</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest">
              개수
            </label>
            <input
              type="number"
              value={globalConfig.count}
              onChange={(e) =>
                setGlobalConfig({
                  ...globalConfig,
                  count: parseInt(e.target.value) || 1,
                })
              }
              disabled={globalConfig.outputType === "v_unit"}
              className="w-full border-2 border-gray-100 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-sm font-bold bg-gray-50 outline-none focus:border-blue-500 text-right"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 필드 목록 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
              필드 구성
            </h3>
            <button
              onClick={addField}
              className="text-sm font-black text-blue-600 hover:underline"
            >
              + 필드 추가
            </button>
          </div>

          {fields.map((field) => (
            <SchemaItem key={field.id} field={field} setFields={setFields} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SchemaEditor;
