import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This is a simple fallback for browser TTS requests
  // In a real application, you might want to implement actual TTS functionality here
  
  return new NextResponse(
    JSON.stringify({ 
      message: 'Browser TTS endpoint', 
      status: 'available',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle TTS request - for now just return success
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: 'TTS request received',
        data: body
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Invalid request body'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
