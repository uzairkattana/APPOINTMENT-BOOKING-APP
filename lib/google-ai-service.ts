"use client"

// Client wrapper that calls server API; removes any direct key usage
interface GoogleAIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
  error?: {
    message: string
    code: number
  }
}

interface ChatMessage {
  role: 'user' | 'model'
  parts: Array<{
    text: string
  }>
}

export class GoogleAIService {
  private static instance: GoogleAIService
  // no client-side keys

  constructor() {}

  static getInstance(): GoogleAIService {
    if (!GoogleAIService.instance) {
      GoogleAIService.instance = new GoogleAIService()
    }
    return GoogleAIService.instance
  }

  // Generate response for medical questions
  async generateMedicalResponse(
    userMessage: string, 
    context: 'patient' | 'doctor' = 'patient',
    conversationHistory: ChatMessage[] = []
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      // Create system prompt based on context
      const systemPrompt = this.createSystemPrompt(context)
      
      // Prepare the conversation history
      const messages: ChatMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: conversationHistory })
      })

      if (!response.ok) {
        return { success: false, error: `API Error: ${response.status}` }
      }

      const data = await response.json()
      const generatedText = data?.text as string | undefined
      if (generatedText) return { success: true, response: generatedText }
      return { success: false, error: 'No response generated' }

    } catch (error) {
      // Error logging removed to prevent runtime issues
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private createSystemPrompt(context: 'patient' | 'doctor'): string {
    const basePrompt = `You are an AI assistant for Gonstead Chiropractic Clinic, specializing in chiropractic care and spinal health. 

CLINIC INFORMATION:
- Clinic: Gonstead Chiropractic Clinic
- Doctor: Dr. Bashir Khan
- Location: Near Peshawar Model School, Tehsil Road, Nowshera, KPK
- Phone: +92 304 699 6267
- Email: gonsteadchiropractic.org@gmail.com
- Specialization: Gonstead Technique (precise spinal analysis and targeted adjustments)

IMPORTANT GUIDELINES:
1. Always provide educational information only
2. Include medical disclaimers when discussing conditions
3. Encourage users to consult healthcare professionals for diagnosis
4. For emergencies, immediately direct to call emergency services
5. Focus on chiropractic care, spinal health, and musculoskeletal conditions
6. Be professional, caring, and informative
7. Promote appointment booking when appropriate`

    if (context === 'patient') {
      return `${basePrompt}

PATIENT-FOCUSED APPROACH:
- Use simple, easy-to-understand language
- Provide reassuring and supportive responses
- Explain medical terms clearly
- Focus on patient education and comfort
- Emphasize the importance of professional evaluation
- Encourage appointment booking for proper assessment

When discussing conditions, always include: "This information is for educational purposes only. Please consult with Dr. Bashir Khan or a healthcare professional for proper diagnosis and treatment."`
    } else {
      return `${basePrompt}

DOCTOR/ADMIN CONTEXT:
- You can use more technical medical terminology
- Provide detailed clinical information when appropriate
- Focus on professional medical insights
- Support clinical decision-making processes
- Provide comprehensive condition information
- Assist with patient education materials

Remember to maintain professional medical standards and evidence-based information.`
    }
  }

  // Quick response for common medical questions
  async getQuickMedicalResponse(
    question: string, 
    context: 'patient' | 'doctor' = 'patient'
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const enhancedQuestion = `As a ${context} asking about: ${question}. Please provide a helpful, accurate response about this medical/chiropractic topic.`
    
    return this.generateMedicalResponse(enhancedQuestion, context)
  }

  // Generate appointment-related responses
  async generateAppointmentResponse(
    userMessage: string,
    context: 'patient' | 'doctor' = 'patient'
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const appointmentPrompt = `User wants to know about appointments: ${userMessage}. 
    
    Provide helpful information about:
    - Booking appointments with Dr. Bashir Khan at Gonstead Chiropractic Clinic
    - Available appointment types (in-clinic Gonstead adjustments, consultations)
    - Clinic hours and contact information
    - What to expect during appointments
    
    Always encourage booking through the website or calling +92 304 699 6267.`
    
    return this.generateMedicalResponse(appointmentPrompt, context)
  }

  // Check if the service is available
  async checkServiceHealth(): Promise<boolean> {
    try {
      const testResponse = await this.generateMedicalResponse("Hello", 'patient')
      return testResponse.success
    } catch (error) {
      // Error logging removed to prevent runtime issues
      return false
    }
  }
}

// Export singleton instance
export const googleAIService = GoogleAIService.getInstance()

// Export types for external use
export type { ChatMessage, GoogleAIResponse }
