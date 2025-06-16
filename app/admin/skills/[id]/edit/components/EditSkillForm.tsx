'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Slider } from "@/components/ui/slider"
import HandleSkills from '@/app/admin/skills/new/components/Action/HandleSkills'

interface SkillFormData {
  id: string
  name: string
  description: string
  level: number
  color: string
}

interface EditSkillFormProps {
  skill: SkillFormData
}

export const EditSkillForm = ({ skill }: EditSkillFormProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<SkillFormData>({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    level: skill.level,
    color: skill.color || "bg-destructive"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? Number(value) : value
    }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      level: value[0]
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await HandleSkills(formData, true, skill.id)
      if (success) {
        toast.success('Skill updated successfully')
        router.push('/admin/skills')
        router.refresh()
      } else {
        throw new Error('Failed to update skill')
      }
    } catch (error) {
      toast.error('Failed to update skill')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-2">
      <Card className={`bg-card/10 backdrop-blur-lg`}>
        <CardHeader>
          <CardTitle>Edit Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, Python"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the skill"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Proficiency Level (0-100)</Label>
            <div className="space-y-4">
              <Slider
                id="level"
                name="level"
                value={[formData.level]}
                max={100}
                min={0}
                step={1}
                onValueChange={handleSliderChange}
              />
              <Input
                id="level"
                name="level"
                type="number"
                min="0"
                max="100"
                value={formData.level}
                onChange={handleChange}
                className="w-20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              type="text"
              value={formData.color}
              onChange={handleChange}
              placeholder="bg-destructive"  
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
} 