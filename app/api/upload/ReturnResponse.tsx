import { NextResponse } from "next/server"

export const ReturnResponse = async (status = 401, message = 'Unable to complete your request! Some information are missing.', added = {}, success = false) => {
    try {
        return NextResponse.json({ success, status, message, ...added }, { status })
    } catch {
        return NextResponse.json({ success: false, status: 401, message: 'Unable to complete your request! Some information are missing.', action: null }, { status: 401 })
    }
}
