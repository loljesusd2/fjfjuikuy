
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in correct order for foreign key constraints)
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()  // Delete reviews first
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()
  await prisma.professionalProfile.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create test client users
  const client1 = await prisma.user.create({
    data: {
      email: 'maria@client.com',
      password: hashedPassword,
      name: 'María García',
      phone: '+1234567890',
      role: 'CLIENT',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  const client2 = await prisma.user.create({
    data: {
      email: 'ana@client.com',
      password: hashedPassword,
      name: 'Ana López',
      phone: '+1234567891',
      role: 'CLIENT',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create test professional users
  const professional1 = await prisma.user.create({
    data: {
      email: 'sofia@professional.com',
      password: hashedPassword,
      name: 'Sofía Rodríguez',
      phone: '+1234567892',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  const professional2 = await prisma.user.create({
    data: {
      email: 'carlos@professional.com',
      password: hashedPassword,
      name: 'Carlos Mendoza',
      phone: '+1234567893',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@beautygo.com',
      password: hashedPassword,
      name: 'Admin Beauty GO',
      phone: '+1234567894',
      role: 'ADMIN',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create professional profiles
  const professionalProfile1 = await prisma.professionalProfile.create({
    data: {
      userId: professional1.id,
      businessName: 'Salón Sofía',
      bio: 'Especialista en cortes y peinados con más de 5 años de experiencia.',
      address: 'Calle Gran Vía 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28013',
      mobileProfessional: true,
      hasStudio: false,
      yearsExperience: 5,
      certifications: ['Certificación en Colorimetría', 'Curso de Peinados'],
      portfolio: [],
      workingHours: {
        monday: { available: true, start: '09:00', end: '18:00' },
        tuesday: { available: true, start: '09:00', end: '18:00' },
        wednesday: { available: true, start: '09:00', end: '18:00' },
        thursday: { available: true, start: '09:00', end: '18:00' },
        friday: { available: true, start: '09:00', end: '18:00' },
        saturday: { available: true, start: '10:00', end: '16:00' },
        sunday: { available: false, start: '', end: '' }
      },
      averageRating: 4.8,
      totalReviews: 25,
      isVerified: true,
      isActive: true
    }
  })

  const professionalProfile2 = await prisma.professionalProfile.create({
    data: {
      userId: professional2.id,
      businessName: 'Barbería Carlos',
      bio: 'Barbero profesional especializado en cortes masculinos y arreglo de barba.',
      address: 'Avenida de la Constitución 456',
      city: 'Barcelona',
      state: 'Barcelona',
      zipCode: '08002',
      mobileProfessional: true,
      hasStudio: true,
      yearsExperience: 8,
      certifications: ['Certificación en Barbería Clásica', 'Curso de Afeitado'],
      portfolio: [],
      workingHours: {
        monday: { available: true, start: '10:00', end: '19:00' },
        tuesday: { available: true, start: '10:00', end: '19:00' },
        wednesday: { available: true, start: '10:00', end: '19:00' },
        thursday: { available: true, start: '10:00', end: '19:00' },
        friday: { available: true, start: '10:00', end: '19:00' },
        saturday: { available: true, start: '09:00', end: '17:00' },
        sunday: { available: false, start: '', end: '' }
      },
      averageRating: 4.6,
      totalReviews: 18,
      isVerified: true,
      isActive: true
    }
  })

  // Create services
  const service1 = await prisma.service.create({
    data: {
      professionalId: professionalProfile1.id,
      name: 'Corte y Peinado',
      description: 'Corte de cabello profesional con peinado incluido',
      category: 'HAIR_STYLING',
      price: 45.00,
      duration: 90,
      images: [],
      isActive: true
    }
  })

  const service2 = await prisma.service.create({
    data: {
      professionalId: professionalProfile1.id,
      name: 'Tratamiento Capilar',
      description: 'Tratamiento hidratante y nutritivo para el cabello',
      category: 'SKINCARE',
      price: 65.00,
      duration: 120,
      images: [],
      isActive: true
    }
  })

  const service3 = await prisma.service.create({
    data: {
      professionalId: professionalProfile2.id,
      name: 'Corte Masculino + Barba',
      description: 'Corte de cabello masculino con arreglo de barba',
      category: 'HAIR_STYLING',
      price: 35.00,
      duration: 60,
      images: [],
      isActive: true
    }
  })

  const service4 = await prisma.service.create({
    data: {
      professionalId: professionalProfile2.id,
      name: 'Arreglo de Barba',
      description: 'Recorte y perfilado profesional de barba',
      category: 'HAIR_STYLING',
      price: 20.00,
      duration: 30,
      images: [],
      isActive: true
    }
  })

  // Create sample bookings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const booking1 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      professionalId: professional1.id,
      serviceId: service1.id,
      scheduledDate: tomorrow,
      scheduledTime: '10:00',
      totalAmount: 45.00,
      address: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      notes: 'Primera cita, quiero un cambio de look',
      status: 'CONFIRMED'
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      clientId: client2.id,
      professionalId: professional1.id,
      serviceId: service2.id,
      scheduledDate: nextWeek,
      scheduledTime: '14:00',
      totalAmount: 65.00,
      address: 'Avenida Libertad 456',
      city: 'Barcelona',
      state: 'Barcelona',
      zipCode: '08001',
      notes: 'Tengo el cabello muy dañado, necesito tratamiento',
      status: 'PENDING'
    }
  })

  const booking3 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      professionalId: professional2.id,
      serviceId: service3.id,
      scheduledDate: tomorrow,
      scheduledTime: '16:00',
      totalAmount: 35.00,
      address: 'Plaza Mayor 789',
      city: 'Valencia',
      state: 'Valencia',
      zipCode: '46001',
      notes: 'Corte clásico y barba bien perfilada',
      status: 'IN_PROGRESS'
    }
  })

  // Create payments for completed bookings
  const yesterdayBooking = await prisma.booking.create({
    data: {
      clientId: client2.id,
      professionalId: professional2.id,
      serviceId: service4.id,
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      scheduledTime: '11:00',
      totalAmount: 20.00,
      address: 'Calle Sol 321',
      city: 'Sevilla',
      state: 'Sevilla',
      zipCode: '41001',
      notes: 'Solo arreglo de barba',
      status: 'COMPLETED'
    }
  })

  const payment1 = await prisma.payment.create({
    data: {
      bookingId: yesterdayBooking.id,
      userId: client2.id,
      amount: 20.00,
      platformFee: 4.00,
      professionalAmount: 16.00,
      paymentMethod: 'CASH',
      status: 'COMPLETED'
    }
  })

  // Create some notifications
  await prisma.notification.create({
    data: {
      userId: professional1.id,
      title: 'Nueva Cita Confirmada',
      message: `Tienes una nueva cita confirmada para mañana a las 10:00`,
      type: 'BOOKING_CONFIRMED',
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      userId: client1.id,
      title: 'Cita Confirmada',
      message: `Tu cita de Corte y Peinado está confirmada para mañana`,
      type: 'BOOKING_CONFIRMED',
      isRead: false
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📧 Test User Credentials:')
  console.log('Client 1: maria@client.com / password123')
  console.log('Client 2: ana@client.com / password123')
  console.log('Professional 1: sofia@professional.com / password123')
  console.log('Professional 2: carlos@professional.com / password123')
  console.log('Admin: admin@beautygo.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
