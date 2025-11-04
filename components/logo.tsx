import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact'
  className?: string
  showText?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

// Size presets for different contexts - optimized for 1024x1024 source images
// Increased sizes for better visibility
const sizeMap = {
  xs: { image: 'w-8 h-8', text: 'text-[10px]' },      // 32px - tiny icons (increased from 20px)
  sm: { image: 'w-12 h-12', text: 'text-xs' },         // 48px - small icons, collapsed sidebar (increased from 32px)
  md: { image: 'w-16 h-16', text: 'text-sm' },         // 64px - compact variant, medium icons (increased from 48px)
  lg: { image: 'w-28 h-28', text: 'text-base' },       // 112px - full logo standard size (increased from 80px)
  xl: { image: 'w-40 h-40', text: 'text-lg' },        // 160px - large displays (increased from 128px)
  '2xl': { image: 'w-64 h-64', text: 'text-xl' },      // 256px - hero sections (increased from 192px)
}

export function Logo({ 
  variant = 'full', 
  className, 
  showText = true,
  size 
}: LogoProps) {
  // Determine which logo to use based on variant
  // logo.png is the full logo with text (1024x1024, transparent background)
  // logo1.png is just the icon (1024x1024, transparent background)
  const logoSrc = variant === 'icon' ? '/logo/logo1.png' : '/logo/logo.png'
  
  // Auto-determine size based on variant if not specified
  const logoSize = size || (variant === 'icon' ? 'sm' : variant === 'compact' ? 'md' : 'lg')
  const { image: imageSize, text: textSize } = sizeMap[logoSize]

  if (variant === 'icon') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <img
          src={logoSrc}
          alt="PEMWA Agency Logo"
          className={cn(
            "object-contain drop-shadow-lg",
            imageSize
          )}
          style={{ 
            aspectRatio: '1 / 1',
            imageRendering: 'auto' as const,
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))'
          }}
          loading="lazy"
        />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("flex-shrink-0", imageSize)}>
          <img
            src="/logo/logo1.png"
            alt="PEMWA Agency Logo"
            className="object-contain drop-shadow-lg w-full h-full"
            style={{ 
              aspectRatio: '1 / 1',
              imageRendering: 'auto' as const,
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))'
            }}
            loading="lazy"
          />
        </div>
        {showText && (
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "font-bold text-[#1e3a8a] dark:text-blue-400 truncate uppercase",
              textSize
            )}>
              PEMWA AGENCY
            </span>
            <span className={cn(
              "font-medium text-[#84cc16] dark:text-green-400 truncate uppercase",
              textSize === 'text-xs' ? 'text-[10px]' : 'text-xs'
            )}>
              PAYROLL
            </span>
          </div>
        )}
      </div>
    )
  }

  // Full variant - use the full logo with text (logo.png is cropped and transparent)
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center max-w-full", imageSize)}>
        <img
          src="/logo/logo.png"
          alt="PEMWA Agency Limited - Payroll System"
          className="object-contain drop-shadow-xl w-auto h-auto max-w-full max-h-full"
          style={{ 
            imageRendering: 'auto' as const,
            filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))'
          }}
          loading="eager"
        />
      </div>
      {!showText && (
        <div className="text-center space-y-1">
          <h2 className={cn(
            "font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight",
            textSize
          )}>
            PEMWA AGENCY LIMITED
          </h2>
          <p className={cn(
            "font-medium text-[#84cc16] dark:text-green-400 uppercase tracking-wide",
            textSize === 'text-lg' ? 'text-sm' : 'text-xs'
          )}>
            PAYROLL SYSTEM
          </p>
        </div>
      )}
    </div>
  )
}
