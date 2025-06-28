"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Member, Project, ProjectMember } from "@/lib/types"
import { StoreError, NotFoundError, ValidationError } from "@/lib/errors"
import { memberSchema, projectSchema, projectMemberSchema } from "@/lib/validation"

interface StoreState {
  members: Member[]
  projects: Project[]
  loading: boolean
  error: string | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Member actions
  addMember: (member: Member) => Promise<void>
  updateMember: (member: Member) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  getMember: (id: string) => Member | undefined
  
  // Project actions
  addProject: (project: Project) => Promise<void>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProject: (id: string) => Project | undefined
  
  // Project member actions
  assignMemberToProject: (projectId: string, projectMember: ProjectMember) => Promise<void>
  removeMemberFromProject: (projectId: string, memberId: string) => Promise<void>
  updateMemberInProject: (projectId: string, projectMember: ProjectMember) => Promise<void>
  updateProjectEndDate: (projectId: string, newEndDate: string) => Promise<void>
  updateActualHours: (projectId: string, hours: number) => Promise<void>
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      members: [],
      projects: [],
      loading: false,
      error: null,

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      getMember: (id) => {
        const { members } = get()
        return members.find(m => m.id === id)
      },

      getProject: (id) => {
        const { projects } = get()
        return projects.find(p => p.id === id)
      },

      addMember: async (member) => {
        try {
          set({ loading: true, error: null })
          
          // Validate member data
          const validatedMember = memberSchema.parse(member)
          
          const { members } = get()
          
          // Check for duplicate names
          if (members.some(m => m.name.toLowerCase() === validatedMember.name.toLowerCase())) {
            throw new ValidationError('A member with this name already exists')
          }
          
          set((state) => ({ 
            members: [...state.members, validatedMember],
            loading: false 
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add member'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'addMember')
        }
      },

      updateMember: async (member) => {
        try {
          set({ loading: true, error: null })
          
          const validatedMember = memberSchema.parse(member)
          const { members } = get()
          
          if (!members.some(m => m.id === validatedMember.id)) {
            throw new NotFoundError('Member', validatedMember.id)
          }
          
          set((state) => ({
            members: state.members.map((m) => (m.id === validatedMember.id ? validatedMember : m)),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update member'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'updateMember')
        }
      },

      deleteMember: async (id) => {
        try {
          set({ loading: true, error: null })
          
          const { members, projects } = get()
          
          if (!members.some(m => m.id === id)) {
            throw new NotFoundError('Member', id)
          }
          
          // Check if member is assigned to any projects
          const assignedProjects = projects.filter(p => p.members.some(m => m.memberId === id))
          if (assignedProjects.length > 0) {
            throw new ValidationError(`Cannot delete member. They are assigned to ${assignedProjects.length} project(s)`)
          }
          
          set((state) => ({
            members: state.members.filter((m) => m.id !== id),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete member'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'deleteMember')
        }
      },

      addProject: async (project) => {
        try {
          set({ loading: true, error: null })
          
          const validatedProject = projectSchema.parse(project)
          const { projects } = get()
          
          // Check for duplicate titles
          if (projects.some(p => p.title.toLowerCase() === validatedProject.title.toLowerCase())) {
            throw new ValidationError('A project with this title already exists')
          }
          
          const newProject = {
            ...validatedProject,
            originalEndDate: validatedProject.endDate,
            actualHours: 0,
            members: []
          }
          
          set((state) => ({ 
            projects: [...state.projects, newProject],
            loading: false 
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'addProject')
        }
      },

      updateProject: async (project) => {
        try {
          set({ loading: true, error: null })
          
          const validatedProject = projectSchema.parse(project)
          const { projects } = get()
          
          if (!projects.some(p => p.id === validatedProject.id)) {
            throw new NotFoundError('Project', validatedProject.id)
          }
          
          set((state) => ({
            projects: state.projects.map((p) => (p.id === validatedProject.id ? { ...p, ...validatedProject } : p)),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'updateProject')
        }
      },

      deleteProject: async (id) => {
        try {
          set({ loading: true, error: null })
          
          const { projects } = get()
          
          if (!projects.some(p => p.id === id)) {
            throw new NotFoundError('Project', id)
          }
          
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'deleteProject')
        }
      },

      assignMemberToProject: async (projectId, projectMember) => {
        try {
          set({ loading: true, error: null })
          
          const validatedProjectMember = projectMemberSchema.parse(projectMember)
          const { projects, members } = get()
          
          const project = projects.find(p => p.id === projectId)
          if (!project) {
            throw new NotFoundError('Project', projectId)
          }
          
          const member = members.find(m => m.id === validatedProjectMember.memberId)
          if (!member) {
            throw new NotFoundError('Member', validatedProjectMember.memberId)
          }
          
          // Check if member is already assigned
          if (project.members.some(m => m.memberId === validatedProjectMember.memberId)) {
            throw new ValidationError('Member is already assigned to this project')
          }
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    members: [...p.members, validatedProjectMember],
                  }
                : p,
            ),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to assign member to project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'assignMemberToProject')
        }
      },

      removeMemberFromProject: async (projectId, memberId) => {
        try {
          set({ loading: true, error: null })
          
          const { projects } = get()
          
          const project = projects.find(p => p.id === projectId)
          if (!project) {
            throw new NotFoundError('Project', projectId)
          }
          
          if (!project.members.some(m => m.memberId === memberId)) {
            throw new NotFoundError('Project member', memberId)
          }
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    members: p.members.filter((m) => m.memberId !== memberId),
                  }
                : p,
            ),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove member from project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'removeMemberFromProject')
        }
      },

      updateMemberInProject: async (projectId, projectMember) => {
        try {
          set({ loading: true, error: null })
          
          const validatedProjectMember = projectMemberSchema.parse(projectMember)
          const { projects } = get()
          
          const project = projects.find(p => p.id === projectId)
          if (!project) {
            throw new NotFoundError('Project', projectId)
          }
          
          if (!project.members.some(m => m.memberId === validatedProjectMember.memberId)) {
            throw new NotFoundError('Project member', validatedProjectMember.memberId)
          }
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    members: p.members.map((m) => 
                      m.memberId === validatedProjectMember.memberId ? validatedProjectMember : m
                    ),
                  }
                : p,
            ),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update member in project'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'updateMemberInProject')
        }
      },

      updateProjectEndDate: async (projectId, newEndDate) => {
        try {
          set({ loading: true, error: null })
          
          if (!newEndDate || isNaN(Date.parse(newEndDate))) {
            throw new ValidationError('Invalid end date')
          }
          
          const { projects } = get()
          const project = projects.find(p => p.id === projectId)
          
          if (!project) {
            throw new NotFoundError('Project', projectId)
          }
          
          if (new Date(newEndDate) < new Date(project.startDate)) {
            throw new ValidationError('End date cannot be before start date')
          }
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    originalEndDate: p.originalEndDate || p.endDate,
                    endDate: newEndDate,
                  }
                : p,
            ),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update project end date'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'updateProjectEndDate')
        }
      },

      updateActualHours: async (projectId, hours) => {
        try {
          set({ loading: true, error: null })
          
          if (hours < 0) {
            throw new ValidationError('Actual hours cannot be negative')
          }
          
          const { projects } = get()
          
          if (!projects.some(p => p.id === projectId)) {
            throw new NotFoundError('Project', projectId)
          }
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    actualHours: hours,
                  }
                : p,
            ),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update actual hours'
          set({ error: errorMessage, loading: false })
          throw new StoreError(errorMessage, 'updateActualHours')
        }
      },
    }),
    {
      name: "squaads-project-management",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle data migration if schema changes
        if (version === 0) {
          // Migration logic for version 0 to 1
          return {
            ...persistedState,
            loading: false,
            error: null,
          }
        }
        return persistedState
      },
    },
  ),
)