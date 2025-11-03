import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthRequest extends Request {
  user?: UserPayload
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }

  return null
}

/**
 * Authentication middleware
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' })
    return
  }

  const payload = verifyToken(token)

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' })
    return
  }

  req.user = payload
  next()
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req)

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}

