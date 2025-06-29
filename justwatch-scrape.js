const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function main() {
  const query = '銀魂';
  const searchUrl = `https://www.justwatch.com/jp/検索?q=${encodeURIComponent(query)}`;

  // 1. JustWatchで検索
  const searchRes = await axios.get(searchUrl);
  const $ = cheerio.load(searchRes.data);
  // 2. 最初の作品詳細ページURLを取得
  const firstLink = $('a.title-list-row__column-header').attr('href');
  if (!firstLink) {
    console.log('作品が見つかりませんでした');
    return;
  }
  const detailUrl = `https://www.justwatch.com${firstLink}`;
  console.log('詳細ページ:', detailUrl);

  // 3. 作品詳細ページを取得
  const detailRes = await axios.get(detailUrl);
  const html = detailRes.data;
  fs.writeFileSync('justwatch-detail.html', html, 'utf-8');
  console.log('詳細ページHTMLをjustwatch-detail.htmlに保存しました');

  // 4. JSON-LDからVODリンクを抽出
  const $detail = cheerio.load(html);
  const jsonLdScript = $detail('script[type="application/ld+json"]').html();

  if (jsonLdScript) {
    try {
      const jsonData = JSON.parse(jsonLdScript);
      console.log('\n=== VOD配信リンク ===');

      // potentialActionからVODリンクを抽出
      if (jsonData.potentialAction && Array.isArray(jsonData.potentialAction)) {
        jsonData.potentialAction.forEach((action, index) => {
          if (action['@type'] === 'WatchAction' && action.target && action.target.urlTemplate) {
            const serviceName = action.expectsAcceptanceOf?.offeredBy?.name || `Service ${index + 1}`;
            const url = action.target.urlTemplate;
            const price = action.expectsAcceptanceOf?.price || 'N/A';
            const currency = action.expectsAcceptanceOf?.priceCurrency || '';

            console.log(`${serviceName}:`);
            console.log(`  URL: ${url}`);
            console.log(`  Price: ${price} ${currency}`);
            console.log('');
          }
        });
      }

      // offersからも抽出（念のため）
      if (jsonData.offers && jsonData.offers.offerCount) {
        console.log(`Total offers: ${jsonData.offers.offerCount}`);
      }

    } catch (error) {
      console.error('JSON-LDのパースに失敗:', error.message);
    }
  } else {
    console.log('JSON-LDデータが見つかりませんでした');
  }
}

main().catch(console.error); 