import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks",
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 