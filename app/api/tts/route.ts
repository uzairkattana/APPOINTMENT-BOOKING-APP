import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'gOkFV1JMCt0G0n9xmBwV'

export async function POST(req: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Text-to-speech is not configured on the server.' },
        {
          status: 500,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    const body = await req.json()
    const rawText = typeof body?.text === 'string' ? body.text.trim() : ''

    if (!rawText) {
      return NextResponse.json(
        { error: 'Missing text.' },
        {
          status: 400,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    // Keep TTS requests reasonably short for latency and provider limits
    const text = rawText.slice(0, 1000)

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
          },
        }),
      },
    )

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(() => '')
      console.error('ElevenLabs TTS error', elevenRes.status, errText)
      return NextResponse.json(
        { error: 'Voice provider error.' },
        {
          status: 502,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    const audioBuffer = await elevenRes.arrayBuffer()
    const audio = Buffer.from(audioBuffer)

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS route error', err)
    return NextResponse.json(
      { error: 'Server error in TTS route.' },
      {
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-store',
        },
      },
    )
  }
}

