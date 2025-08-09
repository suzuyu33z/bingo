import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - ビジネス用語一覧取得
export async function GET() {
  try {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data, error } = await supabase
      .from('business_terms')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch terms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - 新しいビジネス用語追加
export async function POST(request: Request) {
  try {
    const { term } = await request.json()

    if (!term || term.trim() === '') {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('business_terms')
      .insert([{ term: term.trim() }])
      .select()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add term' }, { status: 500 })
  }
}