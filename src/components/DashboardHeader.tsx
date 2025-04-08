import { PageHeader } from "@/components/ui/page-header"

interface DashboardHeaderProps {
  heading: string
  text?: string
}

export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return <PageHeader heading={heading} text={text} />
} 