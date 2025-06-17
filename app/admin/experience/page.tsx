import { getExperience } from '@/app/about/components/GetInfos'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, MapPin, Building2, Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from 'date-fns'
import Link from 'next/link'

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'MMM yyyy');
}

const page = async ({ searchParams }: { searchParams: Promise<{page?: string}> }) => {
  const {page} = await searchParams
  const currentPage = Number(page) || 1;
  const itemsPerPage = 6;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let experience = await getExperience(itemsPerPage, ['id', 'title', 'company', 'location', 'start', 'end', 'description'], { from, to })
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Experience Management
        </h1>
        <Link href="/admin/experience/new">
          <Button className="flex items-center gap-2 group">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Add New Experience
          </Button>
        </Link>
      </div>

      {experience.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-24 h-24 mb-6 text-muted-foreground/50">
            <Briefcase className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Experiences Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start building your professional journey by adding your work experiences. Each experience helps tell your story.
          </p>
          <Link href="/admin/experience/new">
            <Button className="flex items-center gap-2 group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Add Your First Experience
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experience.map((exp) => (
              <Card key={exp.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <Link href={`/admin/experience/${exp.id}`} className="block">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {exp.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4" />
                            {exp.company}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(exp.start)} - {formatDate(exp.end)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{exp.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {exp.description}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link href={`/admin/experience/${exp.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Edit</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                    </Link>
                    <Link href={`/admin/experience/${exp.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link href={`?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground">Page {currentPage}</span>
            {experience.length === itemsPerPage && (
              <Link href={`?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default page
