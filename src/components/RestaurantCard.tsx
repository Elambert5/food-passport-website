import React from 'react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite: boolean;
  onToggleFavorite: (restaurant: Restaurant) => void;
  onClick?: (restaurant: Restaurant) => void;
  disableClick?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  isFavorite, 
  onToggleFavorite, 
  onClick,
  disableClick = false
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(restaurant);
  };

  return (
    <div 
      onClick={disableClick ? undefined : () => onClick && onClick(restaurant)}
      className={[
        "bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all flex-shrink-0 snap-center select-none",
        "w-[22rem] md:w-[24rem] lg:w-[26rem] xl:w-[28rem]",
        disableClick ? "cursor-default" : "group cursor-pointer active:scale-[0.98]"
      ].join(' ')}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onCopy={e => e.preventDefault()}
      onMouseDown={e => { if (e.detail > 1) e.preventDefault(); }}
      onDragStart={e => e.preventDefault()}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="relative h-56 sm:h-48 overflow-hidden bg-gray-100 dark:bg-zinc-800">
          {/* Gradient overlay for image fade */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)'}} />
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600 font-black">
            No image
          </div>
        )}

        {/* Heart Favorite Icon */}


        {/* Offer badge (top-left) */}
        {restaurant.discount != null && String(restaurant.discount).trim() !== '' ? (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-xl shadow-lg transition-all active:scale-90 text-xs font-black text-black dark:text-white">
              {String(restaurant.discount)}
            </span>
          </div>
        ) : null}

        {/* Overlay restaurant name over image */}
        <div className="absolute bottom-4 left-4 w-auto z-30">
          <h3
            className="font-black text-3xl sm:text-4xl text-white drop-shadow-lg leading-tight tracking-tighter px-0 py-0 mb-0 text-left"
            style={{
              position: 'relative',
              bottom: '-18px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
              maxHeight: '2.8em', // ~2 lines for 1.4em line height
              lineHeight: '1.4em',
              width: '100%',
            }}
          >
            {restaurant.name}
          </h3>
        </div>
      </div>
      <div className="px-4 py-3.5">
        <div className="flex items-center text-xs text-gray-400 dark:text-zinc-600 font-black uppercase tracking-widest mb-0.5">
          <span className="text-black dark:text-white mr-1">{'£'.repeat(restaurant.priceLevel)}</span>
          <span className="mx-2 opacity-30 text-white">•</span>
          {restaurant.rating != null && restaurant.rating !== '' ? (
            <span className="text-[10px] font-black bg-gray-50 dark:bg-zinc-800 text-white px-2 py-1 rounded-md tracking-widest mr-2 flex items-center">
              <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {(typeof restaurant.rating === 'number' ? restaurant.rating : (Number(restaurant.rating))).toFixed(1)}
            </span>
          ) : null}
          <span className="text-white">{restaurant.reviewCount} reviews</span>
          <span className="flex-1" />
          {/* Distance badge styled like rating */}
          {restaurant.distance !== undefined && (
            <span className="text-[10px] font-black bg-gray-50 dark:bg-zinc-800 text-white px-2 py-1 rounded-md tracking-widest whitespace-nowrap ml-2 flex items-center">
              {restaurant.distance.toFixed(1)} mi
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
