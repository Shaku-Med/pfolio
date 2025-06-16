'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  search?: string
}

const Pagination = ({ currentPage, totalPages, search }: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-8">
      <Link
        href={`/projects?${createQueryString('page', String(Math.max(currentPage - 1, 1)))}${search ? `&search=${search}` : ''}`}
      >
        <Button
          variant="outline"
          disabled={currentPage === 1}
        >
          Previous
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`/projects?${createQueryString('page', String(page))}${search ? `&search=${search}` : ''}`}
          >
            <Button
              variant={currentPage === page ? "default" : "outline"}
            >
              {page}
            </Button>
          </Link>
        ))}
      </div>
      <Link
        href={`/projects?${createQueryString('page', String(Math.min(currentPage + 1, totalPages)))}${search ? `&search=${search}` : ''}`}
      >
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Link>
    </div>
  )
}

export default Pagination 