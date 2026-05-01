import React from 'react';
import { X, Filter, SortAsc, Globe, Calendar, Languages, Clapperboard, Search, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import Select, { StylesConfig } from 'react-select';
import { GENRES, COUNTRIES, LANGUAGES, getYears, SORT_OPTIONS } from '../lib/metadata';

const YEARS = getYears();

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  searchQuery: string;
  genre: string;
  country: string;
  year: string;
  language: string;
  sortBy: string;
}

const customStyles: StylesConfig<any, false> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderColor: state.isFocused ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    minHeight: '44px',
    padding: '0 4px',
    boxShadow: state.isFocused ? '0 0 20px rgba(139, 92, 246, 0.15)' : 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'rgba(139, 92, 246, 0.4)',
      backgroundColor: 'rgba(24, 24, 27, 0.6)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'rgba(15, 15, 18, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '1.25rem',
    padding: '0.5rem',
    marginTop: '8px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    zIndex: 200,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#8b5cf6' : state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    color: state.isSelected ? 'white' : '#9ca3af',
    borderRadius: '0.75rem',
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:active': {
      backgroundColor: '#8b5cf6',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280',
    fontSize: '0.875rem',
    fontWeight: '500',
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? 'white' : '#6b7280',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: 'white',
    },
  }),
};

export default function FilterBar({ onFilterChange, activeFilters }: FilterBarProps) {
  const handleSelect = (category: keyof FilterState, value: string) => {
    onFilterChange({ ...activeFilters, [category]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      genre: 'All',
      country: 'All',
      year: 'All',
      language: 'All',
      sortBy: 'For You'
    });
  };

  const isFiltered = activeFilters.genre !== 'All' || 
                     activeFilters.country !== 'All' || 
                     activeFilters.year !== 'All' || 
                     activeFilters.language !== 'All' ||
                     activeFilters.searchQuery !== '';

  const formatOptions = (options: string[], category: string) => {
    const allOption = { value: category === 'sortBy' ? 'For You' : 'All', label: category === 'sortBy' ? 'For You' : 'All' };
    return [allOption, ...options.map(opt => ({ value: opt, label: opt }))];
  };

  return (
    <div className="flex flex-col space-y-6 py-6">
      {/* Top Row: Search and Reset */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary-purple transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search titles, actors, or keywords..."
            value={activeFilters.searchQuery}
            onChange={(e) => onFilterChange({ ...activeFilters, searchQuery: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 outline-none focus:border-primary-purple focus:ring-4 focus:ring-primary-purple/10 transition-all duration-300"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={clearFilters}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500",
              !isFiltered 
                ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/20" 
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            )}
          >
            <Sparkles className={cn("h-4 w-4", !isFiltered && "animate-pulse")} />
            <span>For You</span>
          </button>
          
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-primary-magenta/10 border border-primary-magenta/20 text-xs font-black text-primary-magenta hover:bg-primary-magenta hover:text-white transition-all duration-300 group"
            >
              <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5">
        <div className="flex items-center space-x-2 text-zinc-500 mr-2">
          <Filter className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refine</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="w-44 group">
            <div className="flex items-center space-x-2 mb-1.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Clapperboard className="h-3 w-3 text-primary-purple" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Genre</span>
            </div>
            <Select
              styles={customStyles}
              placeholder="All Genres"
              options={formatOptions(GENRES, 'genre')}
              value={activeFilters.genre === 'All' ? null : { value: activeFilters.genre, label: activeFilters.genre }}
              onChange={(opt: any) => handleSelect('genre', opt.value)}
            />
          </div>

          <div className="w-48 group">
            <div className="flex items-center space-x-2 mb-1.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Globe className="h-3 w-3 text-primary-purple" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Country</span>
            </div>
            <Select
              styles={customStyles}
              placeholder="All Regions"
              options={formatOptions(COUNTRIES, 'country')}
              value={activeFilters.country === 'All' ? null : { value: activeFilters.country, label: activeFilters.country }}
              onChange={(opt: any) => handleSelect('country', opt.value)}
            />
          </div>

          <div className="w-40 group">
            <div className="flex items-center space-x-2 mb-1.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Calendar className="h-3 w-3 text-primary-purple" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Release</span>
            </div>
            <Select
              styles={customStyles}
              placeholder="Any Year"
              options={formatOptions(YEARS, 'year')}
              value={activeFilters.year === 'All' ? null : { value: activeFilters.year, label: activeFilters.year }}
              onChange={(opt: any) => handleSelect('year', opt.value)}
            />
          </div>

          <div className="w-44 group">
            <div className="flex items-center space-x-2 mb-1.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Languages className="h-3 w-3 text-primary-purple" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Language</span>
            </div>
            <Select
              styles={customStyles}
              placeholder="Any Language"
              options={formatOptions(LANGUAGES, 'language')}
              value={activeFilters.language === 'All' ? null : { value: activeFilters.language, label: activeFilters.language }}
              onChange={(opt: any) => handleSelect('language', opt.value)}
            />
          </div>
        </div>
        
        <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />
        
        <div className="flex flex-col group">
          <div className="flex items-center space-x-2 mb-1.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <SortAsc className="h-3 w-3 text-primary-magenta" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Sort By</span>
          </div>
          <div className="w-44">
            <Select
              styles={customStyles}
              placeholder="For You"
              options={formatOptions(SORT_OPTIONS, 'sortBy')}
              value={{ value: activeFilters.sortBy, label: activeFilters.sortBy }}
              onChange={(opt: any) => handleSelect('sortBy', opt.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
