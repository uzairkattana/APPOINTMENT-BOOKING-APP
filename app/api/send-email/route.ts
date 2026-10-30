import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting (simple in-memory store - consider using Redis in production)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 emails per 15 minutes per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || request.ip || 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(key);

  if (!userLimit) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input: string): string {
  return input.trim().substring(0, 1000); // Limit length and trim
}

// Create email transporter
function createTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    throw new Error('Email credentials not configured');
  }

  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password for Gmail
      },
    });
  } else {
    // Custom SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }
}

// Generate email HTML template
function generateEmailHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d5c75, #2a9d8f); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #0d5c75; }
            .field-label { font-weight: bold; color: #0d5c75; margin-bottom: 5px; }
            .field-value { color: #555; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🦴 Gonstead Chiropractic Clinic</div>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${data.name}</div>
            </div>
            <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">${data.email}</div>
            </div>
            ${data.phone ? `
            <div class="field">
                <div class="field-label">Phone:</div>
                <div class="field-value">${data.phone}</div>
            </div>
            ` : ''}
            ${data.subject ? `
            <div class="field">
                <div class="field-label">Subject:</div>
                <div class="field-value">${data.subject}</div>
            </div>
            ` : ''}
            ${data.healthConcerns ? `
            <div class="field">
                <div class="field-label">Health Concerns:</div>
                <div class="field-value">${data.healthConcerns}</div>
            </div>
            ` : ''}
            <div class="field">
                <div class="field-label">Message:</div>
                <div class="field-value">${data.message}</div>
            </div>
            <div class="field">
                <div class="field-label">Submitted:</div>
                <div class="field-value">${new Date().toLocaleString()}</div>
            </div>
        </div>
        <div class="footer">
            <p>This email was sent from your Gonstead Chiropractic Clinic website contact form.</p>
            <p>📍 Near Peshawar Model School, Tehsil Road, Nowshera</p>
            <p>📞 +92 304 699 6267</p>
        </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, phone, subject, message, healthConcerns } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: phone ? sanitizeInput(phone) : '',
      subject: subject ? sanitizeInput(subject) : 'New Contact Form Submission',
      message: sanitizeInput(message),
      healthConcerns: healthConcerns ? sanitizeInput(healthConcerns) : '',
    };

    // Create transporter
    const transporter = createTransporter();

    // Email to clinic
    const clinicEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.CLINIC_EMAIL || 'gonsteadchiropractic.org@gmail.com',
      subject: `New Contact Form: ${sanitizedData.subject}`,
      html: generateEmailHTML(sanitizedData),
      replyTo: sanitizedData.email,
    };

    // Auto-reply to user
    const autoReplyEmail = {
      from: process.env.EMAIL_USER,
      to: sanitizedData.email,
      subject: 'Thank you for contacting Gonstead Chiropractic Clinic',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You - Gonstead Chiropractic Clinic</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0d5c75, #2a9d8f); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .cta { background: #0d5c75; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
                .cta a { color: white; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🦴 Gonstead Chiropractic Clinic</div>
                <h2>Thank You for Reaching Out!</h2>
            </div>
            <div class="content">
                <p>Dear ${sanitizedData.name},</p>
                <p>Thank you for contacting Gonstead Chiropractic Clinic. We have received your message and our team will review it shortly.</p>
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our medical team will review your message within 24 hours</li>
                    <li>We'll contact you via phone or email to discuss your health concerns</li>
                    <li>If needed, we'll schedule a consultation appointment</li>
                </ul>
                <div class="cta">
                    <p><strong>Need Immediate Assistance?</strong></p>
                    <p>📞 Call us at: +92 304 699 6267</p>
                    <p>💬 <a href="https://wa.me/923046996267">WhatsApp: +92 304 699 6267</a></p>
                </div>
                <p>We're committed to providing you with the best chiropractic care using the Gonstead technique.</p>
                <p>Best regards,<br>
                <strong>Dr. Bashir Khan</strong><br>
                Gonstead Chiropractic Clinic</p>
            </div>
            <div class="footer">
                <p>📍 Near Peshawar Model School, Tehsil Road, Nowshera</p>
                <p>🌐 gonsteadchiropractic.org</p>
            </div>
        </body>
        </html>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(clinicEmail),
      transporter.sendMail(autoReplyEmail),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ message: 'Email API endpoint' });
}
