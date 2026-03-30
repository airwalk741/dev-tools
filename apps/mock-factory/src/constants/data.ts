export const DATA_TYPES = {
  // 개인 정보
  FULL_NAME: "👤 이름",
  EMAIL: "📧 이메일",
  PHONE: "📱 전화번호",
  JOB_TITLE: "💼 직업",

  // 위치 및 시간
  ADDRESS: "📍 주소",
  DATE_RECENT: "📅 최근 날짜",

  // 텍스트 및 기타
  LOREM_SENTENCE: "📝 한 문장",
  LOREM_PARA: "📖 긴 문단",
  UUID: "🔑 UUID",

  // 시스템/커스텀
  AUTO_INC: "🔢 일련번호",
  RANDOM_PICK: "🎲 무작위 선택",
} as const;

export type DataType = (typeof DATA_TYPES)[keyof typeof DATA_TYPES];
