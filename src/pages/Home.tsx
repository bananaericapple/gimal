import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WebsiteCard from '@/components/WebsiteCard';
import squareAdventureCover from './square_adventure/jump_king.jpeg';
import flappyBirdCover from './flappy_bird/flappy_bird_logo.jpeg';
import infiniteStairsCover from './infinite_stairs/infinite_stairs.png';
import type { Website } from '@/types';

const assetBase = import.meta.env.BASE_URL || '/';
const lifeBreathingCover = `${assetBase}life-breathing.jpeg`;
const hackerMungCover = `${assetBase}hacker_mung.jpeg`;
const jjeunjjaCover = `${assetBase}jjeunjja-dressup.jpg`;
const hypnosisCover = `${assetBase}hypnosis-app.jpg`;
const bananaCover = `${assetBase}banana-peeler.jpg`;
const sansFightGif = `${assetBase}sans-fight.gif`;
const circleMasterCover = `${assetBase}circle-master.png`;
const yutnoriCover = `${assetBase}Yutnori.jpeg`;
const drawFlowersCover = `${assetBase}flower.jpeg`;
const neonFlowCover = `${assetBase}aim.png`;
const tajaGameCover = `${assetBase}taja.png`;
const swordCover = `${assetBase}fire_sword.png`;
const mondrianCover = `${assetBase}mondrian.png`;
const blockBlastCover = `${assetBase}ggo.jpg`;
const bubblePopCover = `${assetBase}bubble.avif`;
const airDrumCover = `${assetBase}airdrum.jpeg`;

const initialWebsites: Website[] = [
  {
    id: '9',
    name: 'Life Breathing Challenge',
    url: 'https://example.com/life-breathing-challenge',
    description: '리듬에 맞춰 호흡을 따라가며 마음을 다독이는 라이프 브리딩 챌린지입니다.',
    imageUrl: lifeBreathingCover,
    tags: ['힐링', '리듬', '집중'],
    linkType: 'internal',
    route: '/life-breathing-challenge',
  },
  {
    id: '10',
    name: 'Sans Fight',
    url: 'https://example.com/sans-fight',
    description: '새로운 Sans Fight 폴더를 헤더와 풋터 사이에 렌더링합니다. 내부 페이지로 연결됩니다.',
    imageUrl: sansFightGif,
    tags: ['실험', '액션', '스릴'],
    linkType: 'internal',
    route: '/sans-fight',
  },
  {
    id: '11',
    name: 'Hacker Mung',
    url: 'https://example.com/hacker-mung',
    description: '키 입력만으로 초고속 해커 콘솔이 채워지고 점프스케어가 터지는 내부 데모입니다.',
    imageUrl: hackerMungCover,
    tags: ['실험', '스릴', '몰입'],
    linkType: 'internal',
    route: '/hacker-mung',
  },
  {
    id: '12',
    name: 'Jjeunjja Dress-up Tycoon',
    url: 'https://example.com/jjeunjja-dressup-tycoon',
    description: '옷을 갈아입히며 스토리를 진행하는 드레스업 타이쿤 미니게임입니다.',
    imageUrl: jjeunjjaCover,
    tags: ['드레스업', '모험', '스토리'],
    linkType: 'internal',
    route: '/jjeunjja',
  },
  {
    id: '13',
    name: 'Hypnosis App',
    url: 'https://example.com/hypnosis-app',
    description: '몰입감 있는 최면 연출과 인터랙션을 실험하는 데모 앱입니다.',
    imageUrl: hypnosisCover,
    tags: ['실험', '몰입', '집중'],
    linkType: 'internal',
    route: '/hypnosis-app',
  },
  {
    id: '14',
    name: 'Banana Peeler Fight',
    url: 'https://example.com/banana-peeler-fight',
    description: '바나나 필러와 고양이의 한판 승부를 그린 액션 데모입니다.',
    imageUrl: bananaCover,
    tags: ['액션', '모험', '코미디'],
    linkType: 'internal',
    route: '/banana-peeler-fight',
  },
  {
    id: '15',
    name: 'Circle Master',
    url: 'https://example.com/circle-master',
    description: '마우스로 원을 그려 정확도를 채점받는 정밀도 게임입니다.',
    imageUrl: circleMasterCover,
    tags: ['정밀', '아케이드', '집중'],
    linkType: 'internal',
    route: '/circle-master',
  },
  {
    id: '16',
    name: 'Sleepy Giant Wake Up',
    url: 'https://example.com/square-adventure',
    description: '책상 위와 잠든 거인을 누비며 귓속으로 뛰어드는 스퀘어 어드벤처입니다.',
    imageUrl: squareAdventureCover,
    tags: ['모험', '액션', '스토리'],
    linkType: 'internal',
    route: '/square-adventure',
  },
  {
    id: '17',
    name: 'Flappy Bird Clone',
    url: 'https://example.com/flappy-bird',
    description: 'React와 Tailwind로 구현한 클래식 플래피 버드 아케이드입니다.',
    imageUrl: flappyBirdCover,
    tags: ['아케이드', '정밀', '반응속도'],
    linkType: 'internal',
    route: '/flappy-bird',
  },
  {
    id: '18',
    name: 'Infinite Stairs: Business Man',
    url: 'https://example.com/infinite-stairs',
    description: '바쁜 직장인이 끝없이 계단을 오르는 속도감 있는 러너 게임입니다.',
    imageUrl: infiniteStairsCover,
    tags: ['러너', '아케이드', '반응속도'],
    linkType: 'internal',
    route: '/infinite-stairs',
  },
  {
    id: '21',
    name: 'Yutnori',
    url: 'https://example.com/yutnori',
    description: '한국 전통 놀이 윷놀이를 디지털 보드로 즐길 수 있는 미니게임입니다.',
    imageUrl: yutnoriCover,
    tags: ['전통', '보드게임', '전략'],
    linkType: 'internal',
    route: '/yutnori',
  },
  {
    id: '22',
    name: 'draw_flowers',
    url: 'https://example.com/draw-flowers',
    description: '클릭으로 꽃이 자라고 흔들리는 캔버스 인터랙션을 즐길 수 있는 데모입니다.',
    imageUrl: drawFlowersCover,
    tags: ['인터랙션', '캔버스', '힐링'],
    linkType: 'internal',
    route: '/draw-flowers',
  },
  {
    id: '23',
    name: 'neon_flow',
    url: '/neon-flow',
    description: '네온 궤적이 번져가는 neon_flow 컨셉을 실험한 인터랙션 데모입니다.',
    imageUrl: neonFlowCover,
    tags: ['실험', '인터랙션', '모험'],
    linkType: 'internal',
    route: '/neon-flow',
  },
  {
    id: '24',
    name: 'taja_game',
    url: '/taja-game',
    description: '타자 감각을 올리는 taja_game 타이핑 트레이닝 데모입니다.',
    imageUrl: tajaGameCover,
    tags: ['타이핑', '반응속도', '집중'],
    linkType: 'internal',
    route: '/taja-game',
  },
  {
    id: '25',
    name: 'sword',
    url: '/sword',
    description: '검을 강화하며 성장하는 sword 강화 시뮬레이션 게임입니다.',
    imageUrl: swordCover,
    tags: ['강화', 'RPG', '수집'],
    linkType: 'internal',
    route: '/sword',
  },
  {
    id: '26',
    name: 'Mondrian Art Maker',
    url: '/mondrian-art-maker',
    description: '클릭으로 분할하며 몬드리안 스타일의 추상화를 만드는 아트 메이커입니다.',
    imageUrl: mondrianCover,
    tags: ['아트', '인터랙션', '창작'],
    linkType: 'internal',
    route: '/mondrian-art-maker',
  },
  {
    id: '27',
    name: 'Block Blast Hand Tracking',
    url: '/block-blast-handtracking',
    description: 'MediaPipe 손 추적으로 블록을 집고 놓는 Block Blast 인터랙션 게임입니다.',
    imageUrl: blockBlastCover,
    tags: ['MediaPipe', '손 추적', '퍼즐'],
    linkType: 'internal',
    route: '/block-blast-handtracking',
  },
  {
    id: '28',
    name: 'Handtracking Bubble Popper',
    url: '/handtracking-bubble-popper',
    description: 'MediaPipe 손 추적으로 화면의 버블을 터뜨리는 카메라 인터랙션 게임입니다.',
    imageUrl: bubblePopCover,
    tags: ['MediaPipe', '손 추적', '아케이드'],
    linkType: 'internal',
    route: '/handtracking-bubble-popper',
  },
  {
    id: '29',
    name: 'AirDrum',
    url: '/airdrum',
    description: 'MediaPipe 손 추적으로 공중에서 드럼 패드를 치는 가상 드럼 앱입니다.',
    imageUrl: airDrumCover,
    tags: ['MediaPipe', '손 추적', '음악'],
    linkType: 'internal',
    route: '/airdrum',
  },
];

const Home: React.FC = () => {
  const [websites] = useState<Website[]>(initialWebsites);
  const [searchParams, setSearchParams] = useSearchParams();

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    websites.forEach((site) => site.tags.forEach((tag) => tagSet.add(tag)));
    return ['전체', ...Array.from(tagSet)];
  }, [websites]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    websites.forEach((site) => {
      site.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return counts;
  }, [websites]);

  const activeTag = useMemo(() => {
    const fromQuery = searchParams.get('tag');
    if (fromQuery && tags.includes(fromQuery)) return fromQuery;
    return '전체';
  }, [searchParams, tags]);

  const filteredWebsites = useMemo(
    () => (activeTag === '전체' ? websites : websites.filter((site) => site.tags.includes(activeTag))),
    [activeTag, websites],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">나의 웹사이트 목록</h1>
          <p className="text-sm text-gray-400 mt-1">태그로 빠르게 필터링하거나 전체를 한눈에 확인하세요.</p>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800/60 px-3 py-2 rounded-lg border border-gray-700">
          현재 표시: <span className="text-indigo-300 font-semibold">{activeTag === '전체' ? '전체' : `#${activeTag}`}</span> · {filteredWebsites.length}개
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 bg-gray-800/40 border border-gray-700 rounded-xl px-4 py-3">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          const count = tag === '전체' ? websites.length : tagCounts.get(tag) ?? 0;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchParams(tag === '전체' ? {} : { tag })}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                  : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-indigo-500/80 hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span>{tag === '전체' ? '전체 보기' : `#${tag}`}</span>
              <span className={`ml-2 text-xs font-bold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>· {count}</span>
            </button>
          );
        })}
      </div>

      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-300">웹사이트가 없습니다.</h2>
          <p className="text-gray-400 mt-2">새로운 웹사이트를 추가하여 목록을 채워보세요!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
