import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.ComponentProps<"div"> {
  heading: string
  text?: string
}

function PageHeader({
  heading,
  text,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn("mb-8", className)}
      {...props}
    >
      <h1 className="text-4xl font-bold mb-2">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  )
}

export { PageHeader } 