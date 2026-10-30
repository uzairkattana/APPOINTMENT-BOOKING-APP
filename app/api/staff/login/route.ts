import { NextRequest, NextResponse } from "next/server"
import {
  getStaffAccountsFirestore,
  updateStaffAccountFirestore,
  addAuditLogFirestore,
} from "@/lib/firebase-db"

// POST /api/staff/login
// Validates staff credentials against Firestore staff_accounts collection.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const password = typeof body?.password === "string" ? body.password.trim() : ""
    const identifierRaw =
      typeof body?.username === "string"
        ? body.username
        : typeof body?.email === "string"
        ? body.email
        : typeof body?.identifier === "string"
        ? body.identifier
        : ""
    const identifier = identifierRaw.trim().toLowerCase()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required" },
        { status: 400 }
      )
    }

    // Fetch all staff accounts from Firestore
    const staffList = await getStaffAccountsFirestore()

    // Find staff account by username or email
    const staff = staffList.find(
      (s) =>
        (s.username.toLowerCase() === identifier ||
          (s.email && s.email.toLowerCase() === identifier)) &&
        s.active
    )

    if (!staff) {
      return NextResponse.json(
        { error: "Invalid username/email or inactive staff account" },
        { status: 401 }
      )
    }

    // Validate password (direct match or case-sensitive match)
    const isPasswordValid = staff.password && staff.password.trim() === password

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      )
    }

    // Update last_login_at in Firestore
    const now = new Date().toISOString()
    await updateStaffAccountFirestore(staff.id, { last_login_at: now })

    // Log login audit event
    await addAuditLogFirestore({
      action: "staff_login",
      entity_type: "staff",
      entity_id: staff.id,
      source: "staff_login_page",
      meta: { username: staff.username, login_at: now },
    })

    // Safe return object for client
    const safe = {
      id: staff.id,
      username: staff.username,
      display_name: staff.display_name || staff.username,
      role: staff.role || "staff",
      active: true,
    }

    return NextResponse.json({ success: true, data: safe })
  } catch (error: any) {
    console.error("Unexpected staff login error:", error)
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 })
  }
}
