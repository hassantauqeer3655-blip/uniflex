import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RatingStarsProps {
  initialRating?: number;
  maxRating?: number;
  onRate: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  initialRating = 0,
  maxRating = 10,
  onRate,
  size = 20,
  interactive = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getStarColor = (index: number) => {
    const currentRating = hoverRating || initialRating;
    if (index <= currentRating) return 'fill-primary-purple text-primary-purple';
    return 'text-gray-600 fill-transparent';
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }).map((_, i) => {
        const ratingValue = i + 1;
        return (
          <motion.button
            key={i}
            type="button"
            whileHover={interactive ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            onMouseEnter={() => interactive && setHoverRating(ratingValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate(ratingValue)}
            className={cn(
              "transition-colors duration-200",
              !interactive && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(getStarColor(ratingValue), "transition-all")}
            />
          </motion.button>
        );
      })}
      {interactive && (
        <span className="ml-3 text-xs font-black text-primary-purple uppercase tracking-widest min-w-[2.5rem]">
          {hoverRating || initialRating || 0} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
