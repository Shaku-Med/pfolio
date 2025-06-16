'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function SearchForm({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParamsHook.toString());
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/projects?${params.toString()}`);
  }, [searchValue, router, searchParamsHook]);

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        name="search"
        placeholder="Search projects..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10 w-full"
      />
    </form>
  );
} 