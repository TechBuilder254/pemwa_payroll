import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-[12px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      // Mobile-first responsive text sizing - compact
      "text-[11px] sm:text-[12px]",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
