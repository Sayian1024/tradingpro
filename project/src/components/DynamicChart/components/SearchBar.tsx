import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { LuSend  } from "react-icons/lu";
import type { SearchBarProps } from '../types';

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex flex-col w-full items-start rounded-md border">
          <Search className="absolute left-3 top-2 h-5 w-5 text-gray-500" />
          <Textarea
            placeholder="Enter your Prompt... (Press Shift + Enter for new line)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 min-h-[6rem] border-transparent max-h-32 w-full rounded-lg resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-gray-400"
            rows={1}
          />
          <div className="flex justify-end w-full mt-auto">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-11 w-11 bg-[#475977] hover:bg-black mb-1 mr-1"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LuSend className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};