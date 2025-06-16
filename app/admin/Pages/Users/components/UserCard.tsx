'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, User, ArrowRight, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserCardProps {
  id: string
  name: string
  ip: string
  createdAt: string
  isBlocked: boolean
}

const UserCard: React.FC<UserCardProps> = ({ id, name, ip, createdAt, isBlocked }) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <Link href={`/contact/${id}`} className="flex-1 group-hover:cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground/70 text-xs uppercase tracking-wider font-medium">
                <User className="h-3 w-3" />
                User Profile
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                          {name?.length > 10 ? `${name.substring(0, 10)}...` : name}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md inline-block">
                    {id}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span className={isBlocked ? "text-red-500" : "text-green-500"}>
                      {isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md inline-block">
                    {ip}
                  </p>
                </div>
              </div>
            </div>
          </Link>
          
          <div className="ml-4">
            <Link href={`/contact/${id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserCard