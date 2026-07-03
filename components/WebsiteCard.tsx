import React from 'react';
import { Link } from 'react-router-dom';
import type { Website } from '../types';

interface WebsiteCardProps {
  website: Website;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website }) => {
  const isInternal = website.linkType === 'internal' && website.route;
  const isPlaceholder = website.status === 'placeholder';

  const Wrapper: React.ElementType = isPlaceholder ? 'div' : isInternal ? Link : 'a';
  const wrapperProps = isPlaceholder
    ? {}
    : isInternal
    ? { to: website.route as string }
    : { href: website.url, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group block h-full ${isPlaceholder ? 'cursor-default' : ''}`}
    >
      <div
        className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col border h-full ${
          isPlaceholder
            ? 'border-dashed border-gray-600/80 opacity-85'
            : 'border-gray-700/60 hover:border-indigo-500/50 hover:shadow-indigo-500/30 group-hover:-translate-y-1 group-hover:scale-[1.02]'
        }`}
      >
        <div className="relative w-full aspect-video overflow-hidden bg-gray-900/70 flex items-center justify-center">
          {isPlaceholder ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-500">
              <span className="text-5xl font-light leading-none">+</span>
            </div>
          ) : (
            <img
              className="w-full h-full object-contain object-center"
              src={website.imageUrl}
              alt={website.name}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2 text-white">{website.name}</h3>
          <p className="text-gray-400 text-sm mb-4 h-20 overflow-hidden">{website.description}</p>
          <div className="flex-grow"></div>
          <div className="flex flex-wrap gap-2">
            {website.tags.map((tag) => (
              <span key={tag} className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default WebsiteCard;
