import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mobile-first responsive utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Mobile-specific classes
export const mobileClasses = {
  container: 'px-4 py-2',
  card: 'rounded-lg p-4 shadow-sm',
  button: 'w-full py-3 px-4 text-sm font-medium',
  input: 'w-full py-3 px-4 text-base',
  text: 'text-sm leading-relaxed',
  heading: 'text-lg font-semibold',
  subheading: 'text-base font-medium',
}

// Desktop-specific classes
export const desktopClasses = {
  container: 'px-6 py-4',
  card: 'rounded-xl p-6 shadow-md',
  button: 'px-6 py-2 text-sm font-medium',
  input: 'py-2 px-3 text-sm',
  text: 'text-sm leading-normal',
  heading: 'text-2xl font-bold',
  subheading: 'text-lg font-semibold',
}

// Responsive utility function
export const responsive = {
  mobile: (classes: string) => `sm:hidden ${classes}`,
  desktop: (classes: string) => `hidden sm:block ${classes}`,
  both: (mobileClasses: string, desktopClasses: string) => 
    `${mobileClasses} sm:${desktopClasses}`,
}
