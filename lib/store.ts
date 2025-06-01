"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Member, Project, ProjectMember } from "@/lib/types"

interface StoreState {
  members: Member[]
  projects: Project[]
  addMember: (member: Member) => void
  updateMember: (member: Member) => void
  deleteMember: (id: string) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
  assignMemberToProject: (projectId: string, projectMember: ProjectMember) => void
  removeMemberFromProject: (projectId: string, memberId: string) => void
  updateMemberInProject: (projectId: string, projectMember: ProjectMember) => void
  updateProjectEndDate: (projectId: string, newEndDate: string) => void
  updateActualHours: (projectId: string, hours: number) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      members: [],
      projects: [],

      addMember: (member) => {
        try {
          set((state) => ({ members: [...state.members, member] }))
        } catch (error) {
          console.error("Error adding member to store:", error)
          throw error // Re-throw to allow handling in components
        }
      },

      updateMember: (member) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === member.id ? member : m)),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          projects: state.projects.map((project) => ({
            ...project,
            members: project.members.filter((m) => m.memberId !== id),
          })),
        })),

      addProject: (project) => {
        try {
          set((state) => ({ projects: [...state.projects, project] }))
        } catch (error) {
          console.error("Error adding project to store:", error)
          throw error // Re-throw to allow handling in components
        }
      },

      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === project.id ? project : p)),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      assignMemberToProject: (projectId, projectMember) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  members: [...p.members.filter((m) => m.memberId !== projectMember.memberId), projectMember],
                }
              : p,
          ),
        })),

      removeMemberFromProject: (projectId, memberId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  members: p.members.filter((m) => m.memberId !== memberId),
                }
              : p,
          ),
        })),

      updateMemberInProject: (projectId, projectMember) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  members: p.members.map((m) => (m.memberId === projectMember.memberId ? projectMember : m)),
                }
              : p,
          ),
        })),

      updateProjectEndDate: (projectId, newEndDate) =>
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
        })),

      updateActualHours: (projectId, hours) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  actualHours: hours,
                }
              : p,
          ),
        })),
    }),
    {
      name: "squaads-project-management",
    },
  ),
)
