import { NextRequest, NextResponse } from "next/server"
import {
  getStaffAccountsFirestore,
  createStaffAccountFirestore,
  updateStaffAccountFirestore,
  deleteStaffAccountFirestore,
  addAuditLogFirestore,
} from "@/lib/firebase-db"

// GET - Fetch all staff accounts from Firestore
export async function GET() {
  try {
    const data = await getStaffAccountsFirestore()
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("GET /api/staff error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch staff accounts" }, { status: 500 })
  }
}

// POST - Create new staff account in Firestore
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, ...accountData } = body

    if (!accountData.username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const existingStaff = await getStaffAccountsFirestore()
    const duplicate = existingStaff.find(
      (s) =>
        s.username.toLowerCase() === accountData.username.toLowerCase() ||
        (accountData.email && s.email && s.email.toLowerCase() === accountData.email.toLowerCase())
    )

    if (duplicate) {
      return NextResponse.json(
        { error: "Staff username or email already exists. Please choose another." },
        { status: 409 }
      )
    }

    const staffId = accountData.id || `staff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const newStaff = await createStaffAccountFirestore({
      id: staffId,
      username: accountData.username,
      display_name: accountData.display_name || accountData.username,
      email: accountData.email || "",
      phone: accountData.phone || "",
      role: accountData.role || "staff",
      active: accountData.active !== undefined ? accountData.active : true,
      password: password,
    })

    if (!newStaff) {
      return NextResponse.json({ error: "Failed to create staff account in Firestore" }, { status: 500 })
    }

    // Add audit log entry
    await addAuditLogFirestore({
      action: "create_staff",
      entity_type: "staff",
      entity_id: staffId,
      source: "admin_dashboard",
      meta: { username: accountData.username, role: accountData.role },
    })

    return NextResponse.json({ success: true, data: newStaff })
  } catch (error: any) {
    console.error("POST /api/staff error:", error)
    return NextResponse.json({ error: error.message || "Failed to create staff account" }, { status: 500 })
  }
}

// PATCH - Update staff account in Firestore
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, password, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    const payload: any = { ...updates }
    if (typeof password === "string" && password.trim().length > 0) {
      payload.password = password.trim()
    }

    const ok = await updateStaffAccountFirestore(id, payload)
    if (!ok) {
      return NextResponse.json({ error: "Failed to update staff account" }, { status: 500 })
    }

    await addAuditLogFirestore({
      action: "update_staff",
      entity_type: "staff",
      entity_id: id,
      source: "admin_dashboard",
      meta: { updates: Object.keys(payload) },
    })

    return NextResponse.json({ success: true, data: { id, ...payload } })
  } catch (error: any) {
    console.error("PATCH /api/staff error:", error)
    return NextResponse.json({ error: error.message || "Failed to update staff account" }, { status: 500 })
  }
}

// DELETE - Remove staff account from Firestore
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    const ok = await deleteStaffAccountFirestore(id)
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete staff account" }, { status: 500 })
    }

    await addAuditLogFirestore({
      action: "delete_staff",
      entity_type: "staff",
      entity_id: id,
      source: "admin_dashboard",
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE /api/staff error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete staff account" }, { status: 500 })
  }
}
