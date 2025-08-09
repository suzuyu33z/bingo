import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      message: 'Test API working',
      env_check: {
        url_exists: !!supabaseUrl,
        key_exists: !!supabaseKey,
        url_value: supabaseUrl ? `${supabaseUrl.slice(0, 20)}...` : 'missing',
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}