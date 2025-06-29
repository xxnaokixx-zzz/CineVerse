# CineVerse - 映画情報Webアプリ

**CineVerse v1.9.3** - 検索体験を、もっと快適に。

## 概要

CineVerseは映画・アニメ・ドラマの情報検索、AIによるレコメンドや要約、ウォッチリスト管理などができる映画情報Webアプリです。
デモ用のテストアカウントも用意しているので、すぐに機能をお試しいただけます。

## テストアカウント

デモ用に以下のテストアカウントを用意しています。
ご自由にログインして動作をお試しください。

```
メールアドレス: cineversedemo@gmail.com  
パスワード: Test12345
```

> ※ テストアカウントはデータが初期化される場合があります。
> ※ ご自身で新規登録してもご利用いただけます。

## デモURL

[https://cine-verse-ruddy.vercel.app/](https://cine-verse-ruddy.vercel.app/)

## スクリーンショット

![トップページ](public/images/CineVerse.toppage.png)
![検索ページ](public/images/CineVerse.searchpage.png)
![AI要約ページ](public/images/CineVerse.AI.summarypage.png)
![ウォッチリスト](public/images/CineVerse.watchlist.page.png)

## ✨ 主な機能

### 🔐 認証システム
- **セキュアな認証**: Supabase Authによる安全なログイン・サインアップ
- **二重認証チェック**: ミドルウェアとページレベルの両方で認証を確認
- **フォールバック機能**: 確実なログイン画面へのリダイレクト
- **セッション管理**: 自動的なセッション更新と期限切れ処理

### 🔍 高度な検索機能
- **モーダル検索**: 背景ぼかし付きの美しいモーダルで検索結果を表示
- **3つの検索種別**: 作品検索・出演作品検索・監督作品検索
- **サジェスト機能**: 入力中にリアルタイムで候補を表示
- **人物カード表示**: 出演作・監督作検索で人物情報を優先表示
- **検索履歴**: Supabase連携によるクラウド同期機能

### 🔍 Google検索連携
- **詳細ページ検索**: 映画・TV番組・人物の詳細ページから直接Google検索
- **映画館検索**: 主要映画館チェーンでの上映情報をGoogle検索で確認
- **検索精度**: 映画は「タイトル + 映画」、他はタイトル/名前のみで検索

### 👤 人物詳細ページ
- **タブUI**: 出演作・監督作・その他スタッフ作をタブで切り替え
- **役割別表示**: 人物の役割に応じた適切な作品リスト
- **AI要約機能**: 人物の経歴や作品をAIが要約

### 🎯 作品情報
- **詳細情報**: あらすじ、キャスト、評価、公開日など
- **関連作品**: 類似作品の推薦
- **トレーラー**: YouTube動画の埋め込み
- **ウォッチリスト**: お気に入り作品の保存
- **VOD情報**: JustWatch連携による配信情報

### 🤖 AI機能
- **作品要約**: 映画・ドラマの内容をAIが要約
- **人物要約**: 俳優・監督の経歴をAIが要約
- **作品推薦**: 好みに基づいた作品推薦

### 🎬 映画館情報
- **上映館検索**: 主要映画館チェーンでの上映情報
- **Google検索連携**: 映画館名 + 映画タイトルで検索
- **地域別検索**: 最寄りの映画館情報を取得

### 🎬 現在上映中
- **日本映画館情報**: 実際に日本で上映中の映画を表示
- **109 Cinemas連携**: リアルタイムの上映情報
- **アニメ映画対応**: 日本で上映中のアニメ映画も含む
- **映画館リンク**: 各映画館の公式サイトへの直接リンク

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **API**: TMDB API, JustWatch API
- **AI**: OpenAI API
- **デプロイ**: Vercel

## 📱 対応デバイス

- デスクトップ（推奨）
- タブレット
- モバイル

## 🔧 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/xxnaokixx-zzz/CineVerse.git
cd CineVerse
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
```

必要な環境変数：
- `NEXT_PUBLIC_TMDB_API_KEY`: TMDB APIキー
- `OPENAI_API_KEY`: OpenAI APIキー
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase サービスロールキー

4. 開発サーバーを起動
```bash
npm run dev
```

5. ブラウザで http://localhost:3000 を開く

## 📊 バージョン履歴

### v1.9.3 (最新)
- Google検索ボタンの追加（映画・TV番組・人物詳細ページ）
- 映画館検索機能の改善（Google検索連携）
- 人物詳細ページのレイアウト改善
- 放送局ボタンの削除によるUI整理

### v1.9.2
- 検索履歴のSupabase連携
- ログイン状態に応じた自動切り替え機能
- クラウド同期によるデバイス間履歴共有

### v1.9.1
- 検索履歴機能の実装
- 検索結果の改善
- パフォーマンス最適化

### v1.9.0
- AI機能の大幅強化
- 作品推薦システムの改善
- 検索機能の拡張

### v1.8.0
- 映画館検索機能の追加
- 上映情報の表示
- 地域別映画館検索

### v1.7.0
- 検索機能の完全刷新（モーダル表示）
- 人物詳細ページのタブUI追加
- トップページの簡素化
- 全検索種別でサジェスト機能

### v1.6.0
- 検索機能のUX改善
- 人物名検索の自動判定
- 検索結果の優先表示

### v1.5.0
- AI機能の大幅強化
- 作品推薦システム
- ウォッチリスト機能

### v1.4.0
- 認証システムの実装
- ユーザープロフィール機能
- アカウント管理

### v1.3.0
- レスポンシブデザインの改善
- パフォーマンス最適化
- アクセシビリティ向上

### v1.2.0
- トレーラー機能の追加
- 関連作品の表示
- 検索機能の強化

### v1.1.0
- 人物詳細ページの実装
- キャスト・スタッフ情報の表示
- フィルモグラフィー機能

### v1.0.0
- 初回リリース
- 基本的な映画情報表示
- 検索機能

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/xxnaokixx-zzz/CineVerse/issues)までお気軽にお寄せください。

## 🙏 謝辞

- [TMDB](https://www.themoviedb.org/) - 映画データの提供
- [OpenAI](https://openai.com/) - AI機能の提供
- [Supabase](https://supabase.com/) - バックエンドサービス
- [Vercel](https://vercel.com/) - ホスティングサービス
- [JustWatch](https://www.justwatch.com/) - VOD情報の提供

---


