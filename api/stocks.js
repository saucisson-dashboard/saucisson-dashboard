export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  const domain = process.env.SHOPIFY_DOMAIN;
  const token  = process.env.SHOPIFY_TOKEN;
  if (!domain || !token) {
    return res.status(500).json({ error: 'Variables manquantes' });
  }
  try {
    const response = await fetch(
      `https://${domain}/admin/api/2026-01/products.json?limit=250&fields=id,title,product_type,variants`,
      { headers: { 'X-Shopify-Access-Token': token } }
    );
    const data = await response.json();
    const products = data.products.map(p => ({
      name: p.title,
      sku: p.variants[0]?.sku || String(p.id).slice(-6),
      category: p.product_type || 'Saucisson',
      stock: p.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0),
      trend: 0
    }));
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
