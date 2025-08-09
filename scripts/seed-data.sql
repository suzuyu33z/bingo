-- Supabaseコンソールで実行するSQL
-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS business_terms (
  id BIGSERIAL PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS) を有効化
ALTER TABLE business_terms ENABLE ROW LEVEL SECURITY;

-- 3. 誰でも読み取り可能にするポリシー
CREATE POLICY "Allow public read access" ON business_terms
  FOR SELECT USING (true);

-- 4. 誰でも挿入・更新・削除可能にするポリシー（必要に応じて制限）
CREATE POLICY "Allow public insert access" ON business_terms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON business_terms
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON business_terms
  FOR DELETE USING (true);

-- 5. 初期データの投入（例）
INSERT INTO business_terms (term) VALUES 
  ('ワンストップ'),
  ('レバレッジ'),
  ('アジャイル'),
  ('スケーラビリティ'),
  ('MVP'),
  ('KPI'),
  ('ROI'),
  ('エンゲージメント'),
  ('コンバージョン'),
  ('ペルソナ')
ON CONFLICT (term) DO NOTHING;