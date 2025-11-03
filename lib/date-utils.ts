/**
 * Date utility functions for converting between formats
 */

/**
 * Converts a date string (ISO or other formats) to YYYY-MM-DD format for HTML5 date inputs
 * @param date - Date string in any format (ISO, YYYY-MM-DD, etc.) or Date object
 * @returns Date string in YYYY-MM-DD format, or empty string if invalid
 */
export function toDateInputValue(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return ''
    
    // Convert to YYYY-MM-DD format (local time, not UTC)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Converts a YYYY-MM-DD date string to ISO string for API/database
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns ISO date string, or null if invalid
 */
export function fromDateInputValue(dateString: string | null | undefined): string | null {
  if (!dateString || !dateString.trim()) return null
  
  try {
    // Parse YYYY-MM-DD format
    const date = new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

