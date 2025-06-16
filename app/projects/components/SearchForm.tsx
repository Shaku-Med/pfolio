'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useCallback } from 'react'
import { useDebounce } from '@/app/hooks/useDebounce'

interface SearchFormProps {
  initialSearch?: string
}

const SearchForm = ({ initialSearch = '' }: SearchFormProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = searchParams.get('page') || '1'

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = useDebounce((value: string) => {
    router.push(`/projects?${createQueryString('search', value)}&page=1`)
  }, 300)

  return (
    <div className="relative w-full max-w-md  mx-auto mb-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} />
        <Input
          type="text"
          placeholder="Search projects..."
          defaultValue={initialSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
    </div>
  )
}

export default SearchForm 