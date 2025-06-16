import React from 'react'
import { getSkills } from '@/app/about/page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Code2, 
  Edit, 
  Trash2, 
  ArrowLeft,
  FileText,
  BarChart3
} from "lucide-react"
import Link from 'next/link'
import DeleteButton from '../[id]/edit/components/DeleteButton'

const page = async ({ params }: { params: { id: string } }) => {
  try {
    let id = [`${params?.id}`]
    let skills = await getSkills(1, ['id', 'name', 'description', 'level', 'color', 'created_at'], {}, id)

    if (!skills || skills.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Skill Not Found</CardTitle>
              <CardDescription>
                The skill you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/admin/skills">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Skills
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/skills/new">
                  Create New Skill
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const skill = skills[0]

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="mb-2">
                <Link href="/admin/skills">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Skills
                </Link>
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Skill Details
              </h1>
              <p className="text-muted-foreground">
                View and manage your technical skill
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/skills/${skill.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteButton id={skill.id} />
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl sm:text-3xl font-bold">
                        {skill.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {skill.level}% Proficiency
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {skill.description}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Proficiency Level
                    </h3>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${skill.level}%`,
                          backgroundColor: skill.color || 'var(--primary)'
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current proficiency level: {skill.level}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Skill Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="font-semibold">
                      {new Date(skill.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Skill Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: skill.color || 'var(--primary)' }}
                      />
                      <span className="font-semibold">
                        {skill.color || 'Default'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Code2 className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Error</CardTitle>
            <CardDescription>
              An error occurred while loading the skill details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/admin/skills">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Skills
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default page
