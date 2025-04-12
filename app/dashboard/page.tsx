"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlaskConical, Plus, Search, Settings, User } from "lucide-react"

export default function DashboardPage() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "MAb Production Process",
      description: "Monoclonal antibody production with CHO cells",
      lastModified: "2023-10-15T14:30:00",
      status: "completed",
    },
    {
      id: 2,
      name: "Enzyme Production",
      description: "Industrial enzyme production with E. coli",
      lastModified: "2023-10-10T09:15:00",
      status: "in-progress",
    },
    {
      id: 3,
      name: "Vaccine Production",
      description: "Viral vaccine production process",
      lastModified: "2023-09-28T16:45:00",
      status: "draft",
    },
  ])

  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateProject = () => {
    const newProject = {
      id: projects.length + 1,
      name: newProjectName,
      description: newProjectDescription,
      lastModified: new Date().toISOString(),
      status: "draft",
    }

    setProjects([...projects, newProject])
    setNewProjectName("")
    setNewProjectDescription("")
    setIsDialogOpen(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">BioProcess Designer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-[200px] pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Projects</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Enter the details for your new bioprocess design project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief description of your project"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Last modified: {formatDate(project.lastModified)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-2 w-2 rounded-full ${
                              project.status === "completed"
                                ? "bg-emerald-500"
                                : project.status === "in-progress"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs capitalize">{project.status.replace("-", " ")}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects
                  .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
                  .slice(0, 3)
                  .map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Last modified: {formatDate(project.lastModified)}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center">
                            <div
                              className={`mr-2 h-2 w-2 rounded-full ${
                                project.status === "completed"
                                  ? "bg-emerald-500"
                                  : project.status === "in-progress"
                                    ? "bg-amber-500"
                                    : "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs capitalize">{project.status.replace("-", " ")}</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter((project) => project.status === "completed")
                  .map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Last modified: {formatDate(project.lastModified)}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-xs">Completed</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="drafts" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter((project) => project.status === "draft")
                  .map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Last modified: {formatDate(project.lastModified)}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
                            <span className="text-xs">Draft</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
