# 🎬 CineVerse v1.9.0 - 機能拡張・UI改善

## 📋 Issue Overview
- **Status**: 🔄 In Progress (作業中)
- **Priority**: High
- **Assignee**: Development Team
- **Labels**: `enhancement`, `ui-improvement`, `feature`, `v1.9.0`

## 🎯 実装目標

### 1. 🔍 検索履歴機能（ローカル版）
**Status**: ✅ Completed

#### 実装内容
- **カスタムフック**: `useSearchHistory.ts` - localStorageを使用した検索履歴管理
- **UI コンポーネント**: `SearchHistoryList.tsx` - 検索履歴表示・操作
- **検索ページ統合**: 検索時に履歴保存、履歴から検索実行

#### 機能詳細
- 最大10件の履歴保存（重複排除・先頭追加）
- 個別削除・全削除機能
- 時間表示（今、○時間前、○日前）
- 検索入力フィールドフォーカス時に履歴表示

#### 技術仕様
```typescript
// 検索履歴アイテム
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

// 主要機能
- addToHistory(query: string)
- removeFromHistory(query: string)
- clearHistory()
- searchHistory: SearchHistoryItem[]
```

---

### 2. 🎬 VOD配信リンクの遷移対応
**Status**: ✅ Completed

#### 実装内容
- **movieService拡張**: VODプロバイダー情報取得機能
- **映画・TV詳細ページ**: プロバイダーロゴクリックで外部リンク遷移

#### 機能詳細
- TMDb API `/movie/{id}/watch/providers` と `/tv/{id}/watch/providers` を使用
- 日本（JP）向けのリンク情報を取得
- プロバイダーロゴクリックで `window.open(link)` で外部遷移
- リンクが利用できない場合は無効化

#### 技術仕様
```typescript
// VODプロバイダー情報
interface VODProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  link?: string;
}

// 主要関数
- getMovieVODProviders(id: string)
- getTVShowVODProviders(id: string)
```

---

### 3. 🏮 上映中の映画セクション（日本国内限定）
**Status**: ✅ Completed

#### 実装内容
- **movieService拡張**: `getNowPlayingMovies()` 関数
- **コンポーネント**: `NowPlayingSection.tsx` - 上映中映画一覧表示
- **トップページ統合**: 上映中映画セクションを追加

#### 機能詳細
- TMDb API `/movie/now_playing?region=JP&language=ja` を使用
- 最大20件の上映中映画を表示
- ポスター＋タイトル＋上映中ラベル付き
- ローディング・エラー状態の適切な処理

#### 技術仕様
```typescript
// 主要関数
- getNowPlayingMovies(): Promise<Movie[]>

// 表示制限
- 最大20件
- 日本国内限定（region=JP）
- 日本語対応（language=ja）
```

---

### 4. 🎞️ 劇場版アニメ＆実写映画に「上映中／上映終了」ステータス追加
**Status**: ✅ Completed

#### 実装内容
- **MovieCard拡張**: 上映ステータス表示機能
- **上映ステータス判定**: 公開日から30日以内を上映中と判定
- **映画館リンク**: 上映中の作品は映画館検索サイトへのリンク表示

#### 機能詳細
- 「上映中」「上映終了」ステータスラベル表示
- 上映中の作品はホバー時に「映画館で見る」ボタン表示
- クリックで `https://eigakan.org/` に外部遷移

#### 技術仕様
```typescript
// MovieCard Props拡張
interface MovieCardProps {
  // ... existing props
  releaseDate?: string;
  isNowPlaying?: boolean;
}

// 上映ステータス判定ロジック
- 公開から30日以内: 上映中
- 30日超過: 上映終了
- 公開前: ステータスなし
```

---

## 🔧 技術的な改善点

### 型安全性
- TypeScriptによる厳密な型定義
- インターフェースの適切な定義

### エラーハンドリング
- 適切なエラー状態の処理
- ローディング状態の表示

### UX改善
- ホバーエフェクト
- アニメーション
- レスポンシブデザイン

### アクセシビリティ
- 適切なaria-label
- キーボードナビゲーション対応

---

## 📁 変更ファイル一覧

### 新規作成
- `src/lib/hooks/useSearchHistory.ts` - 検索履歴管理フック
- `src/components/SearchHistoryList.tsx` - 検索履歴表示コンポーネント
- `src/components/NowPlayingSection.tsx` - 上映中映画セクション

### 修正
- `src/services/movieService.ts` - VODプロバイダー機能追加
- `src/app/search/page.tsx` - 検索履歴機能統合
- `src/app/movie/[id]/page.tsx` - VODリンク遷移機能
- `src/app/tv/[id]/page.tsx` - VODリンク遷移機能
- `src/app/page.tsx` - 上映中映画セクション追加
- `src/components/MovieCard.tsx` - 上映ステータス表示機能

---

## 🧪 テスト項目

### 検索履歴機能
- [ ] 検索履歴の保存・表示
- [ ] 履歴からの検索実行
- [ ] 個別削除・全削除機能
- [ ] 重複排除機能
- [ ] 最大件数制限（10件）

### VODリンク遷移
- [ ] 映画詳細ページでのVOD表示
- [ ] TV詳細ページでのVOD表示
- [ ] プロバイダーロゴクリックでの外部遷移
- [ ] リンク未提供時の無効化

### 上映中映画セクション
- [ ] トップページでの表示
- [ ] 日本国内限定データ取得
- [ ] 最大20件の制限
- [ ] ローディング・エラー状態

### 上映ステータス
- [ ] 上映中・上映終了ラベル表示
- [ ] 映画館リンクの表示・遷移
- [ ] 公開日からの自動判定

---

## 🚀 デプロイ準備

### ビルド確認
```bash
npm run build
```

### 動作確認
- [ ] トップページ: 上映中映画セクション
- [ ] 検索ページ: 検索履歴機能
- [ ] 映画詳細: VODリンク遷移
- [ ] TV詳細: VODリンク遷移

---

## 📝 今後の改善案

### 検索履歴機能
- Supabase保存・同期対応
- 検索履歴のカテゴリ分け
- 履歴のエクスポート・インポート

### VOD機能
- より多くのプロバイダー対応
- 地域別プロバイダー表示
- 価格情報の表示

### 上映情報
- より詳細な上映館情報
- チケット予約リンク
- 上映スケジュール表示

---

## 🏷️ Labels
- `enhancement`
- `ui-improvement`
- `feature`
- `v1.9.0`
- `in-progress`

## 👥 Assignees
- Development Team

## 📅 Timeline
- **開始日**: 2024年12月
- **完了予定**: 2024年12月
- **ステータス**: 🔄 In Progress 