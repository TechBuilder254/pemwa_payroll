import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { toDateInputValue } from "@/lib/date-utils"

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
  { className, type, size, onWheel, onKeyDown, value, ...props },
  forwardedRef
) => {
  const internalRef = React.useRef<HTMLInputElement | null>(null)

  // Use callback ref to merge forwarded ref
  const refCallback = React.useCallback((node: HTMLInputElement | null) => {
    // Handle forwarded ref
    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef && typeof forwardedRef === 'object' && 'current' in forwardedRef) {
      // Type assertion to handle readonly refs - React.forwardRef can pass readonly refs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(forwardedRef as any).current = node
    }
    
    // Store internally
    internalRef.current = node
  }, [forwardedRef])

  // Attach non-passive wheel listener for number inputs using useEffect
  React.useEffect(() => {
    if (type === 'number' && internalRef.current) {
      const input = internalRef.current
      const handleWheelNonPassive = (e: WheelEvent) => {
        input.blur()
        e.preventDefault()
        e.stopPropagation()
      }
      input.addEventListener('wheel', handleWheelNonPassive, { passive: false })
      return () => {
        input.removeEventListener('wheel', handleWheelNonPassive)
      }
    }
  }, [type])

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  // Convert date values to YYYY-MM-DD format for HTML5 date inputs
  const dateValue = type === 'date' && value 
    ? toDateInputValue(value as string)
    : value

  return (
    <input
      type={type}
      className={cn(inputVariants({ size, className }))}
      ref={refCallback}
      onKeyDown={handleKeyDown}
      onWheel={onWheel}
      value={dateValue}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
