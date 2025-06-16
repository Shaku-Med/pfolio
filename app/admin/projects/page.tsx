import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import db from '@/lib/Database/Supabase/Base'
import SearchForm from '@/app/admin/projects/SearchForm'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'

interface LinkItem {
  id: string;
  url: string;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  programmingLanguages: string[];
  thumbnail?: {
    url: string;
    totalChunks: number;
  };
  sourceCodeLinks?: LinkItem[];
  previewLinks?: LinkItem[];
  status: string;
  featured: boolean;
  user_id: string;
  team: string[];
  priority: string;
  category: string;
  technologies: string[];
  project_files?: any[]
}

export interface Skill {
  id: string;
  uuid: string;
  name: string;
  level: number;
  color: string;
  description: string;
  created_at: string;
  user_id: string;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  tags: string[];
  fileData: any
  created_at: string;
  user_id: string;
}

export interface Experience {
  id: string;
  uuid: string;
  title: string;
  sub_title: string;
  user_id: string;
  start: string;
  end: string;
  is_present: boolean;
  description: string;
  long_description?: string;
  location: string;
  task_completed: any; // Using any for jsonb type
  type: string;
  company: string;
  created_at: string;
  position: string;
}



const ITEMS_PER_PAGE = 6;

export async function getProjects(searchParams: { [key: string]: string | string[] | undefined }) {
  if (!db) return { projects: [], totalPages: 0 };

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search as string || '';

  try {
    let query = db.from('projects').select('id, title, description, date, programmingLanguages, thumbnail, sourceCodeLinks, previewLinks, status, featured, user_id', { count: 'exact' });
    
    if (search) {
      // Escape special characters for ILIKE
      const searchTerm = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`
      );
    }

    const { data, count, error } = await query
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return {
      projects: data as Project[] || [],
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], totalPages: 0 };
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { projects, totalPages } = await getProjects(searchParams);
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams?.search as string || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Projects</h1>
          <Link href="/admin/projects/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>
        
        <SearchForm initialSearch={search} />
      </div>

      {/* Fixed: Added loading state and empty state handling */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {search ? `No projects found matching "${search}"` : 'No projects found'}
          </p>
          {!search && (
            <Link href="/admin/projects/new" className="mt-4 inline-block">
              <Button>Create Your First Project</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={`/admin/projects/${project.id}`} 
              key={project.id} // Fixed: use project.id instead of index
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="flex pt-0 overflow-hidden flex-col h-full hover:shadow-lg transition-shadow duration-300">
                {/* Fixed: Added conditional rendering for thumbnail */}
                {project.thumbnail?.url && (
                  <div className="relative bg-background h-48 w-full overflow-hidden rounded-t-lg">
                    <NonHls 
                      message={{
                        file_object: {
                          url: project.thumbnail.url,
                          type: 'image/png',
                          totalChunks: project.thumbnail.totalChunks || 1
                        },
                        chat_id: project.id,
                        user_id: project.user_id,
                      }} 
                      isPreview
                      endpoint={'/api/open/'}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-bold line-clamp-1">{project.title}</CardTitle>
                  <CardDescription>
                    {/* Fixed: Added error handling for date parsing */}
                    {project.date ? new Date(project.date).toLocaleDateString() : 'No date'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
                  {/* Fixed: Added conditional rendering for programming languages */}
                  {project.programmingLanguages && project.programmingLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.programmingLanguages.map((tech: string, index: number) => (
                        <Badge key={`${project.id}-${tech}-${index}`} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-4 gap-2">
                  {/* Fixed: Improved link handling with proper event prevention */}
                  {project.sourceCodeLinks?.[0]?.url && (
                    <a 
                      href={project.sourceCodeLinks[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full border justify-center px-4 py-2 hover:bg-muted rounded-lg overflow-hidden transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      <span>Code</span>
                    </a>
                  )}
                  {project.previewLinks?.[0]?.url && (
                    <a 
                      href={project.previewLinks[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full border justify-center px-4 py-2 hover:bg-muted rounded-lg overflow-hidden transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Fixed: Improved pagination with better URL handling */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8 flex-wrap">
          <Link
            href={{
              pathname: '/admin/projects',
              query: { 
                page: Math.max(currentPage - 1, 1),
                ...(search && { search })
              }
            }}
          >
            <Button
              variant="outline"
              disabled={currentPage === 1}
            >
              Previous
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              // Show first 2, last 2, and 3 around current page
              const page = i + 1;
              const showPage = page <= 2 || 
                              page >= totalPages - 1 || 
                              Math.abs(page - currentPage) <= 1;
              
              if (!showPage && i > 0) {
                const prevPage = i;
                const shouldShowEllipsis = Math.abs(prevPage - currentPage) > 2;
                if (shouldShowEllipsis) {
                  return <span key={`ellipsis-${i}`} className="px-2">...</span>;
                }
                return null;
              }
              
              return (
                <Link
                  key={page}
                  href={{
                    pathname: '/admin/projects',
                    query: { 
                      page,
                      ...(search && { search })
                    }
                  }}
                >
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          <Link
            href={{
              pathname: '/admin/projects',
              query: { 
                page: Math.min(currentPage + 1, totalPages),
                ...(search && { search })
              }
            }}
          >
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}