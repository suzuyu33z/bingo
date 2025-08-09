"use client";

import { useState, useEffect } from "react";
import { BusinessTerm } from "@/lib/supabase";

interface BingoCell {
  term: string;
  selected: boolean;
}

// デフォルトの用語（Supabaseから取得できない場合のフォールバック）
const defaultBusinessTerms = [
  "がっちゃんこ",
  "一丁目一番地",
  "アグリー",
  "てっぺん",
  "いってこい",
  "ジャストアイデア",
  "ザギンでシースー",
  "旗を立てる",
  "コンセンサス",
  "イニシアチブ",
  "ペンディング",
  "交通整理",
  "そもそも論",
  "目線合わせ",
  "鉛筆なめなめ",
  "決め打ち",
  "ケツカッチン",
  "全員野球",
  "たたき台",
  "出たとこ勝負",
  "突貫工事",
  "腹落ち",
  "空中戦",
  "現場感",
  "ドロンする",
  "トントン",
  "肌感",
  "なるはや",
  "寝かせる",
  "シナジー",
  "正直ベース",
  "丸める",
  "えいや",
  "仁義を切る",
  "ダマでやる",
  "ざっくばらん",
  "ボールを持つ",
  "音頭をとる",
  "ポンチ絵",
  "よしなに",
  "決めの問題",
  "建て付け",
  "握る",
  "ペライチ",
  "ガラガラポン",
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [bingoCard, setBingoCard] = useState<BingoCell[]>([]);
  const [bingoCount, setBingoCount] = useState(0);
  const [businessTerms, setBusinessTerms] = useState<string[]>(defaultBusinessTerms);
  const [loading, setLoading] = useState(true);

  const fetchTermsAndInitialize = async () => {
    try {
      const response = await fetch('/api/terms');
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        const terms = result.data.map((term: BusinessTerm) => term.term);
        // Supabaseから取得した用語とデフォルト用語を結合
        const combinedTerms = [...terms, ...defaultBusinessTerms];
        setBusinessTerms(combinedTerms);
      }
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      // エラーの場合はデフォルト用語を使用
    } finally {
      setLoading(false);
      initializeBingoCard();
    }
  };

  useEffect(() => {
    fetchTermsAndInitialize();
  }, []);

  const initializeBingoCard = () => {
    const shuffledTerms = shuffleArray(businessTerms).slice(0, 25);
    const newCard = shuffledTerms.map((term) => ({
      term,
      selected: false,
    }));

    // 真ん中をフリースペースに
    newCard[12] = { term: "FREE", selected: true };

    setBingoCard(newCard);
    setBingoCount(0);
  };

  const toggleCell = (index: number) => {
    if (index === 12) return; // フリースペースは変更不可

    const newCard = [...bingoCard];
    newCard[index].selected = !newCard[index].selected;
    setBingoCard(newCard);

    // ビンゴチェック
    checkBingo(newCard);
  };

  const checkBingo = (card: BingoCell[]) => {
    let count = 0;

    // 横のライン
    for (let row = 0; row < 5; row++) {
      let isLine = true;
      for (let col = 0; col < 5; col++) {
        if (!card[row * 5 + col].selected) {
          isLine = false;
          break;
        }
      }
      if (isLine) count++;
    }

    // 縦のライン
    for (let col = 0; col < 5; col++) {
      let isLine = true;
      for (let row = 0; row < 5; row++) {
        if (!card[row * 5 + col].selected) {
          isLine = false;
          break;
        }
      }
      if (isLine) count++;
    }

    // 斜めのライン（左上から右下）
    let isDiagonal1 = true;
    for (let i = 0; i < 5; i++) {
      if (!card[i * 5 + i].selected) {
        isDiagonal1 = false;
        break;
      }
    }
    if (isDiagonal1) count++;

    // 斜めのライン（右上から左下）
    let isDiagonal2 = true;
    for (let i = 0; i < 5; i++) {
      if (!card[i * 5 + (4 - i)].selected) {
        isDiagonal2 = false;
        break;
      }
    }
    if (isDiagonal2) count++;

    setBingoCount(count);
  };

  const resetGame = () => {
    initializeBingoCard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">用語を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ビジネス用語ビンゴ
          </h1>
          <p className="text-gray-600 mb-4">会議中にこっそり楽しもう！</p>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-lg font-semibold text-blue-600">
                ビンゴ数: {bingoCount}
              </span>
            </div>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              新しいゲーム
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              用語管理
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-5 gap-2 aspect-square">
            {bingoCard.map((cell, index) => (
              <button
                key={index}
                onClick={() => toggleCell(index)}
                className={`
                  aspect-square flex items-center justify-center text-xs sm:text-sm font-medium
                  border-2 rounded-lg transition-all duration-200 hover:scale-105
                  ${
                    cell.selected
                      ? "bg-green-400 border-green-500 text-white shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }
                  ${index === 12 ? "bg-yellow-300 border-yellow-400" : ""}
                `}
                disabled={index === 12}
              >
                <span className="text-center leading-tight px-1">
                  {cell.term}
                </span>
              </button>
            ))}
          </div>
        </div>

        {bingoCount > 0 && (
          <div className="mt-6 text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block">
              🎉 {bingoCount}つのビンゴが完成しました！ 🎉
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>用語をタップして選択してください</p>
          <p>縦・横・斜めのラインを揃えてビンゴ！</p>
        </div>
      </div>
    </div>
  );
}
