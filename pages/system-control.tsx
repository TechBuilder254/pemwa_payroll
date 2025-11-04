import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  Shield, 
  Mail, 
  Calendar,
  Search,
  X,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserActive, 
  updateUserPassword,
  type SystemUser 
} from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { PasswordConfirmDialog } from '@/components/password-confirm-dialog'
// Date formatting helper
const formatDate = (dateString: string, formatType: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString)
  if (formatType === 'long') {
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function SystemControlPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<SystemUser | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await fetchUsers()
      setUsers(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      if (!formData.email || !formData.password || !formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }

      if (formData.password.length < 6) {
        toast({
          title: 'Validation Error',
          description: 'Password must be at least 6 characters',
          variant: 'destructive',
        })
        return
      }

      await createUser(formData)
      toast({
        title: 'Success',
        description: 'User created successfully',
      })
      setShowAddDialog(false)
      setFormData({ email: '', password: '', name: '', role: 'admin' })
      loadUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      await updateUser(editingUser.id, {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      })
      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      setShowEditDialog(false)
      setEditingUser(null)
      setFormData({ email: '', password: '', name: '', role: 'admin' })
      loadUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      await deleteUser(deletingUser.id)
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      })
      setShowDeleteDialog(false)
      setDeletingUser(null)
      loadUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      })
      throw error // Re-throw so password dialog can handle it
    }
  }

  const handleToggleActive = async (user: SystemUser) => {
    try {
      await toggleUserActive(user.id)
      toast({
        title: 'Success',
        description: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`,
      })
      loadUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      })
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordUser) return

    try {
      if (!newPassword || newPassword.length < 6) {
        toast({
          title: 'Validation Error',
          description: 'Password must be at least 6 characters',
          variant: 'destructive',
        })
        return
      }

      await updateUserPassword(passwordUser.id, newPassword)
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      })
      setShowPasswordDialog(false)
      setPasswordUser(null)
      setNewPassword('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (user: SystemUser) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
    })
    setShowEditDialog(true)
  }

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    )
  })

  const isCurrentUser = (userId: string) => currentUser?.id === userId
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">System Control</h1>
            <p className="text-[12px] text-muted-foreground truncate">Manage users and access</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                System Control
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Manage users and system access
              </p>
            </div>
            <Button
              onClick={() => {
                setFormData({ email: '', password: '', name: '', role: 'admin' })
                setShowAddDialog(true)
              }}
              className="kenya-gradient text-white hover:opacity-90 gap-2"
              size="lg"
            >
              <UserPlus className="h-5 w-5" />
              Add Admin User
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-3 sm:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10 sm:h-11"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <Card className="px-3 py-2.5 sm:px-4 sm:py-2 flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Total Users</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{users.length}</div>
            </Card>
            <Card className="px-3 py-2.5 sm:px-4 sm:py-2 flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                {users.filter(u => u.is_active).length}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Mobile: Add User Button */}
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => {
              setFormData({ email: '', password: '', name: '', role: 'admin' })
              setShowAddDialog(true)
            }}
            className="kenya-gradient text-white hover:opacity-90 rounded-full w-14 h-14 shadow-lg"
            size="icon"
          >
            <UserPlus className="h-6 w-6" />
          </Button>
        </div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    All Users ({filteredUsers.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Manage system access and user permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 px-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <>
                  {/* Mobile: Card View */}
                  <div className="sm:hidden space-y-3 px-4 pb-4">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card border rounded-lg p-3 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                                  {isCurrentUser(user.id) && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>

                          {expandedUser === user.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 pt-2 border-t"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Role:</span>
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                  {user.role}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge
                                  variant={user.is_active ? 'default' : 'destructive'}
                                  className="text-[10px] flex items-center gap-1"
                                >
                                  {user.is_active ? (
                                    <>
                                      <Power className="h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <PowerOff className="h-3 w-3" />
                                      Inactive
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Last Login:</span>
                                <span className="text-xs">
                                  {user.last_login ? formatDate(user.last_login, 'short') : 'Never'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="text-xs">{formatDate(user.created_at, 'short')}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    openEditDialog(user)
                                    setExpandedUser(null)
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setPasswordUser(user)
                                    setNewPassword('')
                                    setShowPasswordDialog(true)
                                    setExpandedUser(null)
                                  }}
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  Password
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    handleToggleActive(user)
                                    setExpandedUser(null)
                                  }}
                                  disabled={isCurrentUser(user.id)}
                                >
                                  {user.is_active ? (
                                    <>
                                      <PowerOff className="h-3 w-3 mr-1" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Power className="h-3 w-3 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setDeletingUser(user)
                                    setShowDeleteDialog(true)
                                    setExpandedUser(null)
                                  }}
                                  disabled={isCurrentUser(user.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Desktop: Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold text-sm">Name</th>
                          <th className="text-left p-3 font-semibold text-sm">Email</th>
                          <th className="text-left p-3 font-semibold text-sm">Role</th>
                          <th className="text-left p-3 font-semibold text-sm">Status</th>
                          <th className="text-left p-3 font-semibold text-sm">Last Login</th>
                          <th className="text-left p-3 font-semibold text-sm">Created</th>
                          <th className="text-right p-3 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredUsers.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold text-xs">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-sm">{user.name}</span>
                                  {isCurrentUser(user.id) && (
                                    <Badge variant="outline" className="text-xs">You</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  {user.email}
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant="secondary" className="capitalize text-xs">
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={user.is_active ? 'default' : 'destructive'}
                                  className="flex items-center gap-1 w-fit text-xs"
                                >
                                  {user.is_active ? (
                                    <>
                                      <Power className="h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <PowerOff className="h-3 w-3" />
                                      Inactive
                                    </>
                                  )}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {user.last_login
                                  ? formatDate(user.last_login, 'long')
                                  : 'Never'}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(user.created_at, 'short')}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(user)}
                                    title="Edit user"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setPasswordUser(user)
                                      setNewPassword('')
                                      setShowPasswordDialog(true)
                                    }}
                                    title="Change password"
                                  >
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleToggleActive(user)}
                                    disabled={isCurrentUser(user.id)}
                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                  >
                                    {user.is_active ? (
                                      <PowerOff className="h-4 w-4" />
                                    ) : (
                                      <Power className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDeletingUser(user)
                                      setShowDeleteDialog(true)
                                    }}
                                    disabled={isCurrentUser(user.id)}
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Admin User
              </DialogTitle>
              <DialogDescription>
                Create a new user account with system access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name *</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="add-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="add-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="kenya-gradient text-white hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} className="kenya-gradient text-white hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog with Password */}
        <PasswordConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteUser}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          warningMessage="This will permanently remove the user and all associated data from the system."
          itemName={deletingUser?.name}
        />

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                Update password for {passwordUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePassword} className="kenya-gradient text-white hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

