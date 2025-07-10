
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  response.cookies.delete('auth-token')
  
  return response
}
