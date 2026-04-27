import { NextResponse } from 'next/server'

// High-quality ElevenLabs voices — male/female variety
const MALE_VOICES  = ['pNInz6obpgDQGcFmaJgB', 'TxGEqnHWrfWFTfGW9XjX', 'ErXwobaYiN019PkySvjV']
const FEMALE_VOICES = ['21m00Tcm4TlvDq8ikWAM', 'EXAVITQu4vr4xnSDxMaL', 'MF3mGyEYCl7XYWbV9V6O']
const FEMALE_FIRST_NAMES = new Set(['Sofia','Priya','Rachel','Lisa','Amara','Nina','Sandra','Jennifer','Michelle','Yuki','Christine','Emma','Maya','Natasha','Alicia','Dana','Sarah','Maria','Allison','Beth'])

function getVoiceId(advisorName: string, seed = 0): string {
  const first = advisorName.split(' ')[0].replace('Dr.', '').trim()
  const voices = FEMALE_FIRST_NAMES.has(first) ? FEMALE_VOICES : MALE_VOICES
  return voices[seed % voices.length]
}

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 })
  }

  try {
    const { text, voiceId } = await req.json()
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

    const voice = voiceId ?? MALE_VOICES[0]

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs error:', err)
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    }

    const audio = await res.arrayBuffer()
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Voice route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
