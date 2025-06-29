const JustWatch = require('justwatch-api');

async function main() {
  const justwatch = new JustWatch({ locale: 'ja_JP' });
  const query = '銀魂'; // 検索したい作品名

  // 作品検索
  const searchResult = await justwatch.search({ query });
  if (!searchResult.items || searchResult.items.length === 0) {
    console.log('作品が見つかりませんでした');
    return;
  }

  // 最初の検索結果を使用
  const item = searchResult.items[0];
  console.log(`タイトル: ${item.title}`);
  console.log(`TMDB ID: ${item.tmdb_id}`);
  console.log(`JustWatch ID: ${item.id}`);

  // オファー情報（配信先）を抽出
  if (!item.offers || item.offers.length === 0) {
    console.log('配信情報が見つかりませんでした');
    return;
  }

  // サービスごとにURLをまとめて出力
  const services = {};
  for (const offer of item.offers) {
    // サブスクリプション型のみ
    if (offer.monetization_type !== 'flatrate') continue;
    const provider = offer.provider_id;
    const url = offer.urls && offer.urls.standard_web;
    if (!url) continue;
    if (!services[provider]) {
      services[provider] = url;
    }
  }

  // プロバイダーID→名前のマッピングを取得
  const providers = await justwatch.getProviders();
  for (const providerId in services) {
    const provider = providers.find(p => p.id === Number(providerId));
    const name = provider ? provider.clear_name : providerId;
    console.log(`${name}: ${services[providerId]}`);
  }
}

main().catch(console.error); 