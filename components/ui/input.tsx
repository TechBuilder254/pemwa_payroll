import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] ring-offset-background file:border-0 file:bg-transparent file:text-[12px] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5 py-1.5",
        sm: "h-7 px-2 py-1 text-[11px]",
        lg: "h-9 px-3 py-2",
        // Mobile-specific sizes
        mobile: "h-9 px-3 py-2 text-[13px]",
        desktop: "h-8 px-2.5 py-1.5 text-[12px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { className, type, size, onWheel, onKeyDown, ...props },
  ref
) => {
  const handleWheel: React.WheelEventHandler<HTMLInputElement> = (e) => {
    if (type === 'number') {
      e.currentTarget.blur()
      e.preventDefault()
    }
    onWheel?.(e)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  return (
    <input
      type={type}
      className={cn(inputVariants({ size, className }))}
      ref={ref}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
