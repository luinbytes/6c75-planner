import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your task management dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 