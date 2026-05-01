import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

type Props = {
  keyword: string;
  setKeyword: (value: string) => void;
};

export default function KeywordFilter({ keyword, setKeyword }: Props) {
  return (
    <div className="relative w-full md:w-64 group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary-purple transition-colors" />
      </div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search by keyword..."
        className={cn(
          "w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all",
          "focus:border-primary-purple focus:ring-1 focus:ring-primary-purple/50",
          "placeholder:text-gray-500"
        )}
      />
    </div>
  );
}
