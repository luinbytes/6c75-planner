import * as React from "react"
import { cn } from "@/lib/utils"

function Shell({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell"
      className={cn(
        "container mx-auto p-4",
        className
      )}
      {...props}
    />
  )
}

export { Shell } 