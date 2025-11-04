import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface InactivityTimeoutModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Time remaining in seconds */
  timeRemaining: number
  /** Callback when user chooses to stay logged in */
  onStayLoggedIn: () => void
  /** Callback when user chooses to logout */
  onLogout: () => void
}

/**
 * Modal that warns user about inactivity timeout with countdown
 */
export function InactivityTimeoutModal({
  open,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
}: InactivityTimeoutModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining)

  // Update countdown when timeRemaining changes
  useEffect(() => {
    if (open) {
      setCountdown(timeRemaining)
    }
  }, [open, timeRemaining])

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, countdown])

  // Auto-logout when countdown reaches 0
  useEffect(() => {
    if (open && countdown === 0) {
      onLogout()
    }
  }, [open, countdown, onLogout])

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <AlertDialogTitle className="text-xl">Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p className="text-foreground">
              You are going to be logged out due to inactivity.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Time remaining:</span>
              <motion.div
                key={countdown}
                initial={{ scale: 1.2, color: '#ef4444' }}
                animate={{ scale: 1, color: '#ef4444' }}
                className="text-2xl font-bold text-red-600 tabular-nums"
              >
                {countdown}
              </motion.div>
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Stay Logged In
          </Button>
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full sm:w-auto order-1 sm:order-2 kenya-gradient text-white hover:opacity-90"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

