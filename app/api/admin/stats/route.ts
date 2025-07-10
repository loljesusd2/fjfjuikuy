
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

    // Obtener estadísticas generales
    const [
      totalUsers,
      totalProfessionals,
      totalClients,
      totalBookings,
      totalRevenue,
      pendingBookings,
      completedBookings,
      totalServices,
      pendingVerifications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { platformFee: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.service.count(),
      prisma.user.count({ 
        where: { 
          role: 'PROFESSIONAL',
          verificationStatus: 'PENDING'
        }
      })
    ])

    // Estadísticas por mes (últimos 6 meses)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const [monthlyBookings, monthlyRevenue, newUsers] = await Promise.all([
        prisma.booking.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }),
        prisma.payment.aggregate({
          _sum: { platformFee: true },
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })
      ])

      monthlyStats.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        bookings: monthlyBookings,
        revenue: monthlyRevenue._sum.platformFee || 0,
        newUsers
      })
    }

    // Top profesionales por ganancias
    const topProfessionals = await prisma.user.findMany({
      where: { role: 'PROFESSIONAL' },
      include: {
        professionalProfile: true,
        bookingsAsProfessional: {
          where: { status: 'COMPLETED' },
          include: { payment: true }
        }
      },
      take: 10
    })

    const professionalStats = topProfessionals.map(prof => {
      const totalEarnings = prof.bookingsAsProfessional.reduce((sum, booking) => {
        return sum + (booking.payment?.professionalAmount || 0)
      }, 0)
      const totalBookings = prof.bookingsAsProfessional.length

      return {
        id: prof.id,
        name: prof.name,
        businessName: prof.professionalProfile?.businessName,
        totalEarnings,
        totalBookings,
        averageRating: prof.professionalProfile?.averageRating || 0,
        isVerified: prof.verificationStatus === 'APPROVED'
      }
    }).sort((a, b) => b.totalEarnings - a.totalEarnings)

    const stats = {
      overview: {
        totalUsers,
        totalProfessionals,
        totalClients,
        totalBookings,
        totalRevenue: totalRevenue._sum.platformFee || 0,
        pendingBookings,
        completedBookings,
        totalServices,
        pendingVerifications
      },
      monthlyStats,
      topProfessionals: professionalStats
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
