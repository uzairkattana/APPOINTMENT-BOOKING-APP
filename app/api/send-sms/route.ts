import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, type } = await request.json()

    // Log the message for admin review instead of sending SMS
    console.log(`SMS Log - Phone: ${phone}, Type: ${type}, Message: ${message}`)

    // Store in database for admin notification instead of SMS
    // This could be expanded to store in a notifications table

    return NextResponse.json({
      success: true,
      message: "Notification logged successfully",
      id: "LOG_" + Date.now(),
    })
  } catch (error) {
    console.error("Notification Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to log notification",
      },
      { status: 500 },
    )
  }
}
