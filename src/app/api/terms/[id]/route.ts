import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT - ビジネス用語更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { term } = await request.json()
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (!term || term.trim() === '') {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('business_terms')
      .update({ term: term.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update term' }, { status: 500 })
  }
}

// DELETE - ビジネス用語削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    const { error } = await supabase
      .from('business_terms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Term deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete term' }, { status: 500 })
  }
}