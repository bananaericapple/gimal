
import React from 'react';

export const INITIAL_GOLD = 1000000;
export const PROTECTION_TICKET_PRICE = 3000; // 1개당 가격
export const MATERIAL_UNIT_PRICE = 5000; // 1개당 가격
export const MAX_LEVEL = 50;

export const SWORD_DATA = [
  "낡은 단검", "녹슨 장검", "단단한 강철검", "빛나는 세이버", "숙련자의 카타나",
  "화염의 불꽃검", "빙결의 서리검", "전격의 라이트닝", "대지의 수호자", "그림자 암살검",
  "은하의 파편", "성검 엑스칼리버", "마검 다인슬라이프", "용살자의 대검", "공허의 집행자",
  "심판의 망치", "태양의 흑점", "달의 사신", "천계의 칼날", "지옥의 가시",
  "차원의 파괴자", "영혼의 수확자", "절대자의 증표", "카오스의 칼날", "창조주의 손길",
  "불멸의 진리", "시공의 지배자", "무의 경계", "신의 눈물", "종언의 선포",
  "영원의 불꽃", "무한의 칼날", "절대자의 유산", "별의 숨결", "차원의 균열",
  "신의 분노", "천년의 약속", "심연의 주시자", "빛의 전령", "어둠의 제왕",
  "공허의 지배자", "최후의 심판", "기원의 파편", "우주의 먼지", "불멸의 심장",
  "용의 비늘", "별의 바다", "시간의 모래", "진리의 열쇠", "신화의 끝"
];

export const getEnhanceCost = (level: number) => {
  // 지수적 증가
  return Math.floor(1000 * Math.pow(1.5, level));
};

export const getSellPrice = (level: number) => {
  if (level === 0) return 0;
  // 판매가는 투자 비용을 상회하도록 설정
  return Math.floor(5000 * Math.pow(1.8, level));
};

export const getReviveTicketCost = (level: number) => {
  if (level < 10) return 1;
  if (level < 20) return 3;
  if (level < 30) return 10;
  if (level < 40) return 30;
  if (level < 45) return 80;
  return 200; // 46~50강 신화 구간: 엄청난 수의 방지권 요구
};

export const getMaterialCost = (level: number) => {
  if (level < 5) return 0;
  if (level < 15) return level; // 5~14강: 단계만큼 소모
  if (level < 30) return level * 3; // 15~29강: 단계 3배 소모
  if (level < 45) return level * 10; // 30~44강: 단계 10배 소모
  return level * 50; // 45~50강: 극한의 재료 요구
};

export const getRates = (level: number) => {
  let success = 100;
  let destroy = 0;

  if (level < 5) {
    success = 100 - (level * 10);
    destroy = 0;
  } else if (level < 10) {
    success = 60 - ((level - 5) * 8);
    destroy = 1;
  } else if (level < 20) {
    success = 20 - ((level - 10) * 1.5);
    destroy = 5 + ((level - 10) * 2.5);
  } else if (level < 40) {
    success = Math.max(1, 5 - ((level - 20) * 0.2));
    destroy = 30 + ((level - 20) * 1.5);
  } else {
    success = Math.max(0.1, 1 - ((level - 40) * 0.09));
    destroy = Math.min(90, 60 + ((level - 40) * 3));
  }

  const fail = Math.max(0, 100 - success - destroy);

  return { 
    success: Number(success.toFixed(1)), 
    destroy: Number(destroy.toFixed(1)), 
    fail: Number(fail.toFixed(1)) 
  };
};
