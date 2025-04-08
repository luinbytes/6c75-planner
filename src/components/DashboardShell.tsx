import { Shell } from "@/components/ui/shell"

interface DashboardShellProps {
  children: React.ReactNode
  fixedFooter?: React.ReactNode
}

export function DashboardShell({ children, fixedFooter }: DashboardShellProps) {
  return (
    <>
      <Shell className="pb-24">{children}</Shell>
      {fixedFooter}
    </>
  )
} 