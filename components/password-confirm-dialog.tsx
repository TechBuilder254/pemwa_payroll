import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PasswordConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  warningMessage?: string
  itemName?: string
}

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirm Deletion',
  description = 'This action cannot be undone. Please enter your password to confirm.',
  warningMessage = 'This action is permanent and cannot be reversed.',
  itemName,
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Password is required')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Verify password with backend
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        : null

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Password verification failed')
      }

      // Password verified, proceed with delete
      await onConfirm()
      
      // Reset form
      setPassword('')
      setError(null)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setError(null)
    onOpenChange(false)
  }

  // Debug logging
  React.useEffect(() => {
    if (open) {
      console.log('PasswordConfirmDialog opened', { title, itemName })
    }
  }, [open, title, itemName])

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="w-[95vw] sm:max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description}
            {itemName && (
              <span className="block mt-2 font-semibold text-foreground">
                Item: {itemName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {warningMessage}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Enter your password to confirm
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Your password"
                className={error ? 'border-destructive' : ''}
                disabled={isVerifying}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifying && password.trim()) {
                    handleConfirm()
                  }
                }}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isVerifying}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isVerifying || !password.trim()}
            className="w-full sm:w-auto"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Confirm Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

