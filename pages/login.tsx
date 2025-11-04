import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { login } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login: setAuthUser, isLoading: isAuthLoading } = useAuth()

  // Prevent back navigation to protected pages after logout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token && window.history.length > 1) {
        window.history.replaceState(null, '', window.location.href)
      }
    }

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate, location])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    try {
      const response = await login({ email, password })

      if (response.user) {
        setAuthUser(response.user)
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col p-4 sm:p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo at the very top - centered, minimal spacing */}
      <div className="relative z-10 w-full flex justify-center pt-6 sm:pt-8 pb-4">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <Logo variant="icon" size="xl" />
        </div>
      </div>

      {/* Main content - centered vertically */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md z-10">

          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to access your payroll dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
                    focusedField === 'email' && "opacity-100"
                  )} />
                  <div className="relative">
                    <Mail className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                      focusedField === 'email' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-12 h-12 text-base border-2 transition-all duration-200",
                        focusedField === 'email' && "border-primary ring-2 ring-primary/20",
                        error && "border-destructive"
                      )}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
                    focusedField === 'password' && "opacity-100"
                  )} />
                  <div className="relative">
                    <Lock className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                      focusedField === 'password' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-12 pr-12 h-12 text-base border-2 transition-all duration-200",
                        focusedField === 'password' && "border-primary ring-2 ring-primary/20",
                        error && "border-destructive"
                      )}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold kenya-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground mb-1">Secure & Protected</h3>
                <p className="text-xs text-muted-foreground">Enterprise-grade security with encrypted data</p>
              </div>
            </div>
            
            <div className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground mb-1">KRA Compliant</h3>
                <p className="text-xs text-muted-foreground">Automated tax calculations & remittances</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 Pemwa Payroll System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
