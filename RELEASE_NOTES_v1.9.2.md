# CineVerse v1.9.2 リリースノート

## 🎉 リリース概要

CineVerse v1.9.2では、**検索履歴機能のSupabase連携**を実装し、ログイン状態に応じた自動切り替え機能を追加しました。これにより、ユーザーの検索履歴がクラウドで同期され、デバイス間での履歴共有が可能になりました。

## ✨ 新機能・改善

### 🔄 検索履歴のSupabase連携
- **ログイン状態に応じた自動切り替え**: ログイン時はSupabase、未ログイン時はlocalStorageを使用
- **初回ログイン時の自動マイグレーション**: localStorageの履歴をSupabaseに自動移行
- **クラウド同期**: 複数デバイス間で検索履歴を同期
- **APIエンドポイント**: `/api/search-history` でCRUD操作を実装

### 🛠️ 技術的改善
- **Supabaseテーブル設計**: `search_history`テーブルに適切なカラム構造を実装
- **カラム名変換**: フロントエンドとSupabase間のカラム名を正しく変換
- **TMDB ID管理**: `tmdb_id`カラムでTMDBの作品IDを正しく管理
- **重複排除ロジック**: より正確な重複排除（query + id + mediaTypeの組み合わせ）

### 🐛 バグ修正
- **履歴カードの遷移問題**: 正しい作品詳細ページへの遷移を修正
- **React Key重複**: 履歴リストのキー重複エラーを解決
- **データ型の整合性**: Supabaseとフロントエンド間のデータ型を統一

## 📊 変更統計

- **変更ファイル数**: 3ファイル
- **追加行数**: 125行
- **削除行数**: 26行
- **主な変更ファイル**:
  - `src/lib/hooks/useSearchHistory.ts` (+117行)
  - `src/components/SearchHistoryList.tsx` (+25行)
  - `src/app/search/page.tsx` (+9行)

## 🔧 技術詳細

### Supabaseテーブル構造
```sql
CREATE TABLE search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  official_title TEXT,
  timestamp BIGINT,
  image_url TEXT,
  rating TEXT,
  year TEXT,
  cast TEXT[],
  crew TEXT[],
  media_type TEXT,
  tmdb_id INTEGER,  -- TMDBの作品ID
  person_id INTEGER,
  person_name TEXT,
  person_department TEXT,
  person_known_for JSONB,
  profile_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 認証状態による自動切り替え
- **ログイン時**: Supabase版の検索履歴を使用
- **未ログイン時**: localStorage版の検索履歴を使用
- **初回ログイン**: localStorageの履歴をSupabaseに自動移行

## 🎯 ユーザー体験の向上

1. **シームレスな履歴同期**: ログイン・ログアウトに関係なく履歴が保持される
2. **正確なページ遷移**: 履歴カードをクリックすると正しい作品詳細ページに遷移
3. **デバイス間同期**: 複数のデバイスで同じ履歴にアクセス可能
4. **パフォーマンス向上**: 重複排除により履歴リストの表示が最適化

## 🚀 今後の展望

- 検索履歴の分析機能
- 履歴ベースのレコメンデーション
- 履歴のエクスポート・インポート機能
- 履歴のカテゴリ分け・フィルタリング

---

**リリース日**: 2025年6月29日  
**バージョン**: v1.9.2  
**前バージョン**: v1.9.1 