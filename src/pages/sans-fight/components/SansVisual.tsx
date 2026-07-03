
import React from 'react';
import sansImage from '../sans.png';

interface SansVisualProps {
  isAttacking: boolean;
  isTired?: boolean;
}

const SansVisual: React.FC<SansVisualProps> = ({ isAttacking, isTired }) => {
  return (
    <div className="flex justify-center items-center py-8 select-none relative">
      {/* 샌즈 이미지 컨테이너 */}
      <div 
        className={`relative transition-all duration-300 ${isAttacking ? 'sans-attacking' : 'sans-idle'}`}
        style={{
          width: '200px',
          height: '240px',
        }}
      >
        {/* 실제 이미지 파일 (sans.png 파일을 이 경로에 두시면 됩니다) */}
        <img 
          src={sansImage} 
          alt="Sans"
          className="w-full h-full object-contain sans-contrast"
          onError={(e) => {
            // 이미지가 없을 경우를 대비한 텍스트 피드백 (개발용)
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<div class="text-white text-center border-2 border-dashed border-white/30 p-4">Put "sans.png" here</div>';
          }}
        />

        {/* 공격 중일 때 나타나는 눈 광채 효과 (선택 사항) */}
        {isAttacking && (
          <div className="absolute inset-0 pointer-events-none animate-pulse">
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-cyan-400 rounded-full blur-md opacity-70"></div>
          </div>
        )}
      </div>

      <style>{`
        /* 둠칫둠칫 기본 대기 애니메이션 */
        @keyframes sans-bounce {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          50% { 
            transform: translateY(-8px) scale(1.02); 
          }
        }

        /* 공격 시 더 빠르고 강한 움직임 */
        @keyframes sans-attack-bounce {
          0%, 100% { 
            transform: translateY(0) scale(1);
            filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.8));
          }
          25% {
            filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.8));
          }
          50% { 
            transform: translateY(-12px) scale(1.05);
            filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.8));
          }
          75% {
            filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.8));
          }
        }

        .sans-idle {
          animation: sans-bounce 1.2s ease-in-out infinite;
        }

        .sans-attacking {
          animation: sans-attack-bounce 0.4s ease-in-out infinite;
        }

        /* 발 밑 그림자 */
        .sans-idle::after, .sans-attacking::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 10%;
          width: 80%;
          height: 10px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          z-index: -1;
        }

        .sans-contrast {
          filter: brightness(1.45) contrast(1.22) drop-shadow(0 0 16px rgba(255, 255, 255, 0.8));
        }
      `}</style>
    </div>
  );
};

export default SansVisual;
