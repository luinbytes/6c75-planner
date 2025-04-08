interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="container mx-auto p-4">
      {children}
    </div>
  )
} 