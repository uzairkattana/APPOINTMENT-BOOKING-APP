import { NextRequest, NextResponse } from "next/server"
import {
  getPaymentRecordsFirestore,
  createPaymentRecordFirestore,
  updatePaymentRecordFirestore,
  deletePaymentRecordFirestore,
} from "@/lib/firebase-db"

// Shared CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

function json(data: any, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200, headers: corsHeaders })
}

function mapRowToPayment(record: any) {
  const metadata = record.metadata || {}
  const paymentDate: string = record.payment_date
    ? new Date(record.payment_date).toISOString()
    : new Date().toISOString()

  return {
    id: record.id as string,
    transactionId: (record.transaction_id as string) || (record.id as string),
    paymentDate,
    amount: record.amount as number,
    paymentMethod: record.payment_method as string,
    status: record.status as string,
    serviceType: record.service_type as string | null,
    notes: record.notes as string | null,
    metadata,
  }
}

// GET /api/payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "200")
    const offset = Number(searchParams.get("offset") || "0")

    const { items: rawItems, total } = await getPaymentRecordsFirestore(limit, offset)
    const items = rawItems.map(mapRowToPayment)

    return json({ success: true, items, total })
  } catch (error: any) {
    console.error("Payments API: GET unexpected error", error)
    return json({ success: false, error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

// POST /api/payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const amount = Number(body.amount)
    if (!amount || isNaN(amount) || amount <= 0) {
      return json({ success: false, error: "Invalid or missing amount" }, { status: 400 })
    }

    const paymentMethod = body.paymentMethod as string | undefined
    if (!paymentMethod) {
      return json({ success: false, error: "paymentMethod is required" }, { status: 400 })
    }

    const status = (body.status as string) || "completed"
    const serviceType = (body.serviceType as string | null) ?? null
    const notes = (body.notes as string | null) ?? null
    const metadata = (body.metadata as Record<string, any> | undefined) || {}
    const transactionId = (body.transactionId as string | undefined) || undefined

    const paymentDate = body.paymentDate
      ? new Date(body.paymentDate)
      : new Date()

    const insertRow = {
      patient_id: null,
      appointment_id: null,
      transaction_type: "payment",
      payment_method: paymentMethod,
      amount,
      currency: "PKR",
      status,
      transaction_id: transactionId ?? null,
      reference_number: null,
      payment_date: paymentDate.toISOString(),
      due_date: null,
      service_type: serviceType,
      session_count: 1,
      discount_applied: 0,
      tax_amount: 0,
      notes,
      payment_proof_url: null,
      receipt_number: null,
      recorded_by: null,
      approved_by: null,
      approval_date: null,
      metadata,
    }

    const created = await createPaymentRecordFirestore(insertRow)
    if (!created) {
      return json({ success: false, error: "Failed to create payment record" }, { status: 500 })
    }

    return json({ success: true, item: mapRowToPayment(created) })
  } catch (error: any) {
    console.error("Payments API: POST unexpected error", error)
    return json({ success: false, error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

// PATCH /api/payments
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const transactionId = body.transactionId as string | undefined

    if (!transactionId) {
      return json({ success: false, error: "transactionId is required" }, { status: 400 })
    }

    const updates: Record<string, any> = {}

    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!amount || isNaN(amount) || amount <= 0) {
        return json({ success: false, error: "Invalid amount" }, { status: 400 })
      }
      updates.amount = amount
    }

    if (body.paymentMethod !== undefined) {
      updates.payment_method = body.paymentMethod
    }

    if (body.status !== undefined) {
      updates.status = body.status
    }

    if (body.serviceType !== undefined) {
      updates.service_type = body.serviceType
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes
    }

    if (body.paymentDate !== undefined) {
      updates.payment_date = new Date(body.paymentDate).toISOString()
    }

    if (body.metadata !== undefined) {
      updates.metadata = body.metadata
    }

    if (Object.keys(updates).length === 0) {
      return json({ success: false, error: "No updatable fields provided" }, { status: 400 })
    }

    const updated = await updatePaymentRecordFirestore(transactionId, updates)
    if (!updated) {
      return json({ success: false, error: "Payment record update failed" }, { status: 500 })
    }

    return json({ success: true, item: mapRowToPayment(updated) })
  } catch (error: any) {
    console.error("Payments API: PATCH unexpected error", error)
    return json({ success: false, error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

// DELETE /api/payments?transactionId=MR-...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return json({ success: false, error: "transactionId is required" }, { status: 400 })
    }

    const success = await deletePaymentRecordFirestore(transactionId)
    if (!success) {
      return json({ success: false, error: "Delete failed or record not found" }, { status: 500 })
    }

    return json({ success: true })
  } catch (error: any) {
    console.error("Payments API: DELETE unexpected error", error)
    return json({ success: false, error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

// OPTIONS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
