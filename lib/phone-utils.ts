/**
 * Utility functions for parsing and validating phone numbers, specifically
 * supporting Pakistani formats (03001234567, +923001234567) and international formats.
 */

export function parseBookingPhoneDigits(phoneInput: string): string {
  if (!phoneInput) return ""
  
  // Remove spaces, hyphens, parentheses
  let digits = phoneInput.replace(/[\s\-\(\)]/g, "")
  
  // Convert +923001234567 -> 03001234567 or standard digits
  if (digits.startsWith("+92")) {
    digits = "0" + digits.slice(3)
  } else if (digits.startsWith("92") && digits.length === 12) {
    digits = "0" + digits.slice(2)
  }
  
  // Clean non-digit characters
  const cleanDigits = digits.replace(/\D/g, "")
  
  // Validate minimum length (Pakistani numbers are 11 digits starting with 03xx, international 10-15)
  if (cleanDigits.length < 10) {
    return ""
  }
  
  return cleanDigits
}

export function formatPakistaniPhoneNumber(phone: string): string {
  const digits = parseBookingPhoneDigits(phone)
  if (digits.length === 11 && digits.startsWith("03")) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  return phone
}
