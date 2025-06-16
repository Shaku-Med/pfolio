import React from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const tasks = [
  {
    id: 1,
    title: "Review Security Logs",
    priority: "High",
    dueDate: "Today",
    status: "pending",
    description: "Check for any suspicious activities in the system logs"
  },
  {
    id: 2,
    title: "Update System Documentation",
    priority: "Medium",
    dueDate: "Tomorrow",
    status: "pending",
    description: "Update the system documentation with latest changes"
  },
  {
    id: 3,
    title: "Backup Database",
    priority: "High",
    dueDate: "In 2 days",
    status: "pending",
    description: "Perform weekly database backup"
  }
]

const TaskList = () => {
  return (
    <Card className='bg-card/60 backdrop-blur-2xl'>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Tasks & Reminders
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            Add Task
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={
                      task.priority === "High" ? "destructive" :
                      task.priority === "Medium" ? "default" :
                      "secondary"
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Due {task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskList 