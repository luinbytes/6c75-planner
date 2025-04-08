interface DashboardHeaderProps {
  heading: string
  text?: string
}

export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  )
} 