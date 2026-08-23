import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'articles', 'view.html');
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('view.html not found');
    }
    const html = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // no cache for article view to ensure fresh slug handling
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch (e) {
    console.error('article-view error', e);
    return res.status(500).send('Internal Server Error');
  }
}
