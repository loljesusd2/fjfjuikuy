
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Users, Search, Filter, UserCheck, 
  UserX, Shield, Edit, Trash2, Eye 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'

interface User {
  id: string
  name: string
  email: string
  role: string
  verificationStatus: string
  avatar?: string
  createdAt: string
  businessName?: string
  city?: string
  totalBookings: number
  completedBookings: number
  averageRating: number
  totalReviews: number
}

const ROLE_LABELS = {
  CLIENT: 'Cliente',
  PROFESSIONAL: 'Profesional',
  ADMIN: 'Administrador'
}

const STATUS_LABELS = {
  UNVERIFIED: 'Sin Verificar',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
}

const STATUS_COLORS = {
  UNVERIFIED: 'secondary',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserStatus = async () => {
    if (!selectedUser || !newStatus) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: newStatus,
          notes: adminNotes
        })
      })

      if (response.ok) {
        toast({
          title: "Usuario actualizado",
          description: "El estado del usuario ha sido actualizado",
        })
        fetchUsers()
        setSelectedUser(null)
        setNewStatus('')
        setAdminNotes('')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al actualizar usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente",
        })
        fetchUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al eliminar usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Filters */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="CLIENT">Clientes</SelectItem>
                    <SelectItem value="PROFESSIONAL">Profesionales</SelectItem>
                    <SelectItem value="ADMIN">Administradores</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="UNVERIFIED">Sin Verificar</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobado</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No se encontraron usuarios
                </h3>
                <p className="text-gray-500">
                  No hay usuarios que coincidan con los filtros seleccionados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {user.name}
                            </h3>
                            <Badge variant="outline">
                              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                            </Badge>
                            <Badge variant={STATUS_COLORS[user.verificationStatus as keyof typeof STATUS_COLORS] as any}>
                              {STATUS_LABELS[user.verificationStatus as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Email:</strong> {user.email}
                            </div>
                            {user.businessName && (
                              <div>
                                <strong>Negocio:</strong> {user.businessName}
                              </div>
                            )}
                            {user.city && (
                              <div>
                                <strong>Ciudad:</strong> {user.city}
                              </div>
                            )}
                            <div>
                              <strong>Registro:</strong> {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {user.role === 'PROFESSIONAL' && (
                            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <strong>Citas:</strong> {user.completedBookings}/{user.totalBookings}
                              </div>
                              <div>
                                <strong>Calificación:</strong> ⭐ {user.averageRating.toFixed(1)}
                              </div>
                              <div>
                                <strong>Reseñas:</strong> {user.totalReviews}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setNewStatus(user.verificationStatus)
                            setAdminNotes('')
                          }}
                        >
                          <Edit size={16} className="mr-1" />
                          Editar
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                              <Trash2 size={16} className="mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta de {user.name} y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar Usuario
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Editar Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>
                      {selectedUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Estado de Verificación
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNVERIFIED">Sin Verificar</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="APPROVED">Aprobado</SelectItem>
                      <SelectItem value="REJECTED">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Notas del Administrador
                  </label>
                  <Textarea
                    placeholder="Agregar notas sobre la decisión..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={updateUserStatus}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button
                    onClick={() => setSelectedUser(null)}
                    variant="outline"
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
