import { Shell } from "@/components/ui/shell"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <Shell>{children}</Shell>
} 