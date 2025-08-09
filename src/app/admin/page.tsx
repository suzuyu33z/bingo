"use client";

import { useState, useEffect } from 'react'
import { BusinessTerm } from '@/lib/supabase'

export default function AdminPage() {
  const [terms, setTerms] = useState<BusinessTerm[]>([])
  const [newTerm, setNewTerm] = useState('')
  const [editingTerm, setEditingTerm] = useState<BusinessTerm | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/terms')
      const result = await response.json()
      if (result.data) {
        setTerms(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch terms:', error)
    }
  }

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm })
      })

      if (response.ok) {
        setNewTerm('')
        fetchTerms()
      } else {
        alert('用語の追加に失敗しました')
      }
    } catch (error) {
      console.error('Failed to add term:', error)
      alert('用語の追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTerm || !editingTerm.term.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/terms/${editingTerm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: editingTerm.term })
      })

      if (response.ok) {
        setEditingTerm(null)
        fetchTerms()
      } else {
        alert('用語の更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update term:', error)
      alert('用語の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTerm = async (id: number) => {
    if (!confirm('本当にこの用語を削除しますか？')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/terms/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTerms()
      } else {
        alert('用語の削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete term:', error)
      alert('用語の削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ビジネス用語管理
          </h1>
          <p className="text-gray-600">ビンゴで使用する用語を管理できます</p>
        </div>

        {/* 新規追加フォーム */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">新しい用語を追加</h2>
          <form onSubmit={handleAddTerm} className="flex gap-4">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="ビジネス用語を入力"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newTerm.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </form>
        </div>

        {/* 編集モーダル */}
        {editingTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">用語を編集</h2>
              <form onSubmit={handleUpdateTerm}>
                <input
                  type="text"
                  value={editingTerm.term}
                  onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  disabled={loading}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingTerm(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    disabled={loading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !editingTerm.term.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    更新
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 用語一覧 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">登録済み用語一覧</h2>
            <span className="text-gray-500">{terms.length}個の用語</span>
          </div>
          
          {terms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ用語が登録されていません</p>
          ) : (
            <div className="grid gap-2">
              {terms.map((term) => (
                <div key={term.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <span className="font-medium">{term.term}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTerm(term)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      disabled={loading}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteTerm(term.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      disabled={loading}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            ビンゴゲームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}