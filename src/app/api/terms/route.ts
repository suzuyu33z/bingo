import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - ビジネス用語一覧取得
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('business_terms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
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