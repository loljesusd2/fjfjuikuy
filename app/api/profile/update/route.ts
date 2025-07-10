
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, avatar, address, city, state, zipCode, businessName, bio, yearsExperience, certifications, portfolio } = body

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        name,
        phone,
        avatar,
      },
      include: {
        clientProfile: true,
        professionalProfile: true,
      }
    })

    // Update profile based on role
    if (updatedUser.role === 'CLIENT' && (address || city || state || zipCode)) {
      if (updatedUser.clientProfile) {
        await prisma.clientProfile.update({
          where: { userId: authUser.userId },
          data: {
            address,
            city,
            state,
            zipCode,
          }
        })
      } else {
        await prisma.clientProfile.create({
          data: {
            userId: authUser.userId,
            address,
            city,
            state,
            zipCode,
          }
        })
      }
    }

    if (updatedUser.role === 'PROFESSIONAL') {
      if (updatedUser.professionalProfile) {
        await prisma.professionalProfile.update({
          where: { userId: authUser.userId },
          data: {
            businessName: businessName || updatedUser.professionalProfile.businessName,
            bio,
            address: address || updatedUser.professionalProfile.address,
            city: city || updatedUser.professionalProfile.city,
            state: state || updatedUser.professionalProfile.state,
            zipCode: zipCode || updatedUser.professionalProfile.zipCode,
            yearsExperience,
            certifications: certifications || [],
            portfolio: portfolio || [],
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
