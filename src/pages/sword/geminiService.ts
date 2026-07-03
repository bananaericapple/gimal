
const CACHE_KEY = 'sword_master_lore_cache';

const LORE_TEMPLATES = [
  "{name}에서 뿜어져 나오는 기운이 대지를 뒤흔듭니다.",
  "수많은 전장을 누빈 {name}의 칼날에는 여전히 적들의 공포가 서려 있습니다.",
  "대장장이의 혼이 깃든 {name}은(는) 단순한 무기 그 이상의 존재입니다.",
  "신비로운 빛을 내뿜는 {name}의 위용은 보는 이의 숨을 멎게 합니다.",
  "운명을 가르는 검, {name}이(가) 새로운 주인을 기다립니다.",
  "어둠 속에서도 찬란하게 빛나는 {name}은(는) 희망의 상징입니다.",
  "고대의 마법이 깃든 {name}의 날카로움은 공간마저 베어낼 듯합니다.",
  "전설의 서막을 알리는 {name}의 진동이 느껴집니다.",
  "{name}의 검신에 새겨진 룬 문자가 공명하며 강력한 힘을 발산합니다.",
  "세상의 끝에서 제련된 {name}은(는) 절대적인 파괴력을 지니고 있습니다."
];

const getLocalLore = (level: number, name: string) => {
  if (level === 0) return "새로운 여정이 시작되는 평범한 검입니다.";
  
  // 결정론적인 무작위성을 위해 이름과 레벨을 조합한 시드 사용
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + level;
  const templateIndex = seed % LORE_TEMPLATES.length;
  const template = LORE_TEMPLATES[templateIndex];
  
  let result = template.replace('{name}', name);

  if (level >= 40) {
    result = `[신화] ${result} 신의 영역에 도달한 위대한 광채가 서려 있습니다.`;
  } else if (level >= 30) {
    result = `[에픽] ${result} 전설적인 영웅의 기상이 느껴집니다.`;
  } else if (level >= 15) {
    result = `[희귀] ${result} 평범한 무기와는 궤를 달리하는 마력이 흐릅니다.`;
  }

  return result;
};

export const getSwordLore = async (level: number, name: string): Promise<string> => {
  // 로컬 로직이므로 즉시 반환하지만, 기존 비동기 인터페이스 유지를 위해 async 사용
  // 약간의 지연을 주어 "생성 중"인 느낌을 줄 수도 있음
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getLocalLore(level, name));
    }, 500);
  });
};
