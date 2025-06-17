import { getSkills } from '@/app/about/page';
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ChevronLeft, ChevronRight, Code2 } from "lucide-react"
import Link from 'next/link'

const page = async ({ searchParams }: { searchParams: Promise<{page?: string}> }) => {
    const {page} = await searchParams
    const currentPage = Number(page) || 1;
    const itemsPerPage = 6;
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
  
    let skills = await getSkills(itemsPerPage, ['id', 'name', 'description', 'level', 'color'], { from, to })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Skills Management
                </h1>
                <Link href="/admin/skills/new">
                    <Button className="flex items-center gap-2 group">
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Add New Skill
                    </Button>
                </Link>
            </div>

            {!skills || skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-24 h-24 mb-6 text-muted-foreground/50">
                        <Code2 className="w-full h-full" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Skills Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Start showcasing your technical expertise by adding your skills. Each skill helps demonstrate your capabilities.
                    </p>
                    <Link href="/admin/skills/new">
                        <Button className="flex items-center gap-2 group">
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            Add Your First Skill
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {skills.map((skill) => (
                            <Card key={skill.id} className="group hover:shadow-lg transition-all duration-300">
                                <div className="relative">
                                    <Link href={`/admin/skills/${skill.id}`} className="block">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                                        {skill.name}
                                                    </CardTitle>
                                                    <div className="mt-2">
                                                        <div className="w-full bg-secondary h-2 rounded-full">
                                                            <div 
                                                                className="h-2 rounded-full transition-all duration-300"
                                                                style={{ 
                                                                    width: `${skill.level}%`,
                                                                    backgroundColor: skill.color || 'var(--primary)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {skill.description}
                                            </p>
                                        </CardContent>
                                    </Link>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Link href={`/admin/skills/${skill.id}/edit`}>
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
                                        <Link href={`/admin/skills/${skill.id}`}>
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
                        {skills.length === itemsPerPage && (
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
