import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, title } = req.query;

  if (!query && !title) {
    return res.status(400).json({ error: 'Query or title parameter is required' });
  }

  const searchQuery = query || title;

  try {
    // 1. JustWatchで検索
    const searchUrl = `https://www.justwatch.com/jp/検索?q=${encodeURIComponent(searchQuery)}`;
    const searchRes = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(searchRes.data);

    // 2. 最初の作品詳細ページURLを取得
    const firstLink = $('a.title-list-row__column-header').attr('href');
    if (!firstLink) {
      return res.status(404).json({ error: '作品が見つかりませんでした' });
    }

    const detailUrl = `https://www.justwatch.com${firstLink}`;

    // 3. 作品詳細ページを取得
    const detailRes = await axios.get(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = detailRes.data;
    const $detail = cheerio.load(html);

    // 4. JSON-LDからVODリンクを抽出
    const jsonLdScript = $detail('script[type="application/ld+json"]').html();

    if (!jsonLdScript) {
      return res.status(404).json({ error: 'VOD情報が見つかりませんでした' });
    }

    const jsonData = JSON.parse(jsonLdScript);
    const vodLinks = [];

    // potentialActionからVODリンクを抽出
    if (jsonData.potentialAction && Array.isArray(jsonData.potentialAction)) {
      jsonData.potentialAction.forEach((action) => {
        if (action['@type'] === 'WatchAction' && action.target && action.target.urlTemplate) {
          const serviceName = action.expectsAcceptanceOf?.offeredBy?.name || 'Unknown Service';
          const url = action.target.urlTemplate;
          const price = action.expectsAcceptanceOf?.price || null;
          const currency = action.expectsAcceptanceOf?.priceCurrency || '';

          vodLinks.push({
            service: serviceName,
            url: url,
            price: price,
            currency: currency
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      title: jsonData.name || searchQuery,
      vodLinks: vodLinks,
      totalOffers: jsonData.offers?.offerCount || 0
    });

  } catch (error) {
    console.error('JustWatch scraping error:', error);
    res.status(500).json({
      error: 'VOD情報の取得に失敗しました',
      details: error.message
    });
  }
} 