'use client'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Save, Mail, MapPin, Phone, Briefcase, PenLine } from 'lucide-react'

const ProfileSettings = () => {
  const [avatar, setAvatar] = useState('/avatars/admin.png')

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={avatar} alt="Profile" className="object-cover" />
              <AvatarFallback className="text-3xl">AD</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform"
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Admin User</h2>
            <p className="text-sm text-muted-foreground">admin@example.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <span>First Name</span>
            </Label>
            <Input id="firstName" placeholder="John" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <span>Last Name</span>
            </Label>
            <Input id="lastName" placeholder="Doe" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Label>
            <Input id="email" type="email" placeholder="john@example.com" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Phone</span>
            </Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </Label>
            <Input id="location" placeholder="City, Country" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Role</span>
            </Label>
            <Input id="role" placeholder="Your role" className="h-11" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">About Me</h3>
          </div>
          <p className="text-sm text-muted-foreground">Share a brief description about yourself</p>
          <Textarea
            id="bio"
            placeholder="Write something about yourself..."
            className="min-h-[150px] resize-none text-base leading-relaxed border-2"
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
