# ビジネス用語ビンゴ

会議中にこっそり楽しめるビジネス用語ビンゴゲームです。Supabaseを使用してカスタム用語の管理ができます。

## 機能

- 5x5のビンゴカード生成
- ビンゴライン数のカウント
- カスタムビジネス用語の追加・編集・削除
- Supabaseとの連携による用語管理

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. Supabaseプロジェクトの作成:
   - [Supabase](https://supabase.com)でプロジェクトを作成
   - SQL Editorで `scripts/seed-data.sql` を実行してテーブル作成

3. 環境変数の設定:
   `.env.local` ファイルにSupabaseの設定を追加:
```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
```

4. 開発サーバーの起動:
```bash
npm run dev
```

## 使用方法

1. `http://localhost:3000` でビンゴゲーム開始
2. `http://localhost:3000/admin` でビジネス用語の管理
3. 用語をタップして選択、ライン完成でビンゴ！

## データベース構造

```sql
CREATE TABLE business_terms (
  id BIGSERIAL PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## MCP統合について（開発・管理用）

このプロジェクトは、開発・管理作業でMCP（Model Context Protocol）を使用します：

### 運用方針
- **スキーマ管理**: Claude + MCP経由でデータベーススキーマの作成・確認
- **アプリ運用**: Next.js API Routes + supabase-js で実際のデータアクセス

### MCPサーバー機能（開発者用）
- `describe_schema`: データベース全体のスキーマ情報を取得
- `describe_table`: 特定テーブルの詳細スキーマ情報を取得
- `run_sql_query`: 読み取り専用SQLクエリの実行（SELECT文のみ）
- `create_table`: 新しいテーブルの作成
- `seed_initial_data`: 初期データの投入

### MCP設定
`.mcp.json` ファイルでMCPサーバーが設定されており、Claude Code経由でスキーマ管理が可能です：

```json
{
  "mcpServers": {
    "supabase-business-terms": {
      "command": "npx",
      "args": ["tsx", "src/mcp/supabase-server.ts"],
      "env": {
        "SUPABASE_URL": "your_supabase_project_url_here",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key_here"
      }
    }
  }
}
```

### 使い方
1. **開発フェーズ**: Claude + MCP でスキーマ作成・初期データ投入
2. **本番運用**: Next.js アプリが supabase-js で直接データアクセス

## 技術スタック

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- MCP (Model Context Protocol)
- @modelcontextprotocol/sdk
