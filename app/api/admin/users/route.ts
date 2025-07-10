
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // CLIENT, PROFESSIONAL, ADMIN
    const status = searchParams.get('status') // UNVERIFIED, PENDING, APPROVED, REJECTED
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir filtros
    const where: any = {}
    if (role && role !== 'all') {
      where.role = role
    }
    if (status && status !== 'all') {
      where.verificationStatus = status
    }

    // Obtener usuarios con paginación
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          professionalProfile: true,
          clientProfile: true,
          bookingsAsClient: {
            select: { id: true, status: true }
          },
          bookingsAsProfessional: {
            select: { id: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Formatear datos para el frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      avatar: user.avatar,
      createdAt: user.createdAt,
      businessName: user.professionalProfile?.businessName,
      city: user.professionalProfile?.city || user.clientProfile?.city,
      totalBookings: user.role === 'PROFESSIONAL' 
        ? user.bookingsAsProfessional.length 
        : user.bookingsAsClient.length,
      completedBookings: user.role === 'PROFESSIONAL'
        ? user.bookingsAsProfessional.filter(b => b.status === 'COMPLETED').length
        : user.bookingsAsClient.filter(b => b.status === 'COMPLETED').length,
      averageRating: user.professionalProfile?.averageRating || 0,
      totalReviews: user.professionalProfile?.totalReviews || 0
    }))

    return NextResponse.json({
      users: formattedUsers,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
