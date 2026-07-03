import React, { useCallback, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { GlobeIcon } from './icons/GlobeIcon';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stackRef = useRef<string[]>([]);

  // Keep a simple app-level navigation stack so back button respects in-app route order.
  useEffect(() => {
    const current = `${location.pathname}${location.search}${location.hash}`;

    if (stackRef.current.length === 0) {
      const stored = sessionStorage.getItem('nav_stack');
      if (stored) {
        try {
          stackRef.current = JSON.parse(stored);
        } catch {
          stackRef.current = [];
        }
      }
    }

    if (stackRef.current[stackRef.current.length - 1] !== current) {
      stackRef.current.push(current);
      sessionStorage.setItem('nav_stack', JSON.stringify(stackRef.current));
    }
  }, [location.pathname, location.search, location.hash]);

  const handleBack = useCallback(() => {
    const stack = stackRef.current;
    if (stack.length <= 1) {
      navigate('/');
      return;
    }

    // Pop current and go to the previous path.
    stack.pop();
    const target = stack[stack.length - 1] ?? '/';
    sessionStorage.setItem('nav_stack', JSON.stringify(stack));
    navigate(target, { replace: true });
  }, [navigate]);

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10 h-16">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-semibold"
            aria-label="뒤로가기"
          >
            <span className="text-lg">←</span>
            <span>뒤로가기</span>
          </button>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-white hover:text-indigo-400'}`
            }
          >
            <GlobeIcon />
            <h1 className="text-xl font-bold tracking-wider">My Websites</h1>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
