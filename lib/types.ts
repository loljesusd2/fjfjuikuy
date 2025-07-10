
import { PrismaClient } from '@prisma/client'

export type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  emailVerified?: boolean
  avatar?: string
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  imageUrl?: string
  images?: string[]
  isActive: boolean
  professionalId: string
  professional?: Professional & { user?: User }
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  clientId: string
  professionalId: string
  serviceId: string
  scheduledDate: Date
  scheduledTime: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  service?: Service
  client?: User
  professional?: Professional & { user?: User }
  payment?: Payment
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  professionalAmount: number
  platformFee: number
  paymentMethod: 'CASH'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId: string
  createdAt: Date
  updatedAt: Date
  bookingRef?: Booking
}

export interface Professional {
  id: string
  userId: string
  bio?: string
  experience?: string
  certifications?: string[]
  specialties?: string[]
  address?: string
  city?: string
  state?: string
  zipCode?: string
  businessName?: string
  isVerified: boolean
  averageRating: number
  totalReviews: number
  totalEarnings: number
  services: Service[]
  user?: User
  reviews?: Review[]
  upcomingBookings?: { date: string; time: string }[]
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'NEW' | 'RESPONDED' | 'RESOLVED'
  createdAt: Date
  updatedAt: Date
}

export interface Admin {
  id: string
  userId: string
}



export interface EarningsStats {
  totalEarnings: number
  completedBookings: number
  serviceBreakdown: Record<string, { count: number; earnings: number }>
  dailyEarnings: Record<string, number>
}

export interface PaymentStats {
  totalEarnings: number
  thisMonthEarnings: number
  completedPayments: number
  pendingPayments: number
  averageBookingValue: number
  totalTransactions: number
  monthlyChart: Array<{ month: string; earnings: number }>
}

export interface Review {
  id: string
  bookingId: string
  clientId: string
  professionalId: string
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
  client?: User
  professional?: Professional
}

// Constants
export const BOOKING_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const

export const SERVICE_CATEGORIES = {
  HAIR_STYLING: 'Hair Styling',
  MANICURE: 'Manicure',
  PEDICURE: 'Pedicure', 
  MAKEUP: 'Makeup',
  SKINCARE: 'Skincare',
  EYEBROWS: 'Eyebrows',
  MASSAGE: 'Massage'
} as const
