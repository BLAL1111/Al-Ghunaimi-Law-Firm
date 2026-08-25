// ═══════════════════════════════════════════════════════════════
// search.js — Deterministic Search Engine for Al-Ghonemy Law Firm
// Strictly adheres to Master Architecture & Implementation Directive
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Arabic Normalization ──────────────────────────────────
  function normalizeArabic(text) {
    if (!text) return '';
    let t = String(text).toLowerCase();
    // Remove diacritics (tashkeel)
    t = t.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
    // Normalize alef variants
    t = t.replace(/[أإآ]/g, 'ا');
    // Normalize ta marbuta
    t = t.replace(/ة/g, 'ه');
    // Normalize alef maqsura
    t = t.replace(/ى/g, 'ي');
    // Normalize waw with hamza
    t = t.replace(/ؤ/g, 'و');
    // Normalize ya with hamza
    t = t.replace(/ئ/g, 'ي');
    // Remove tatweel
    t = t.replace(/\u0640/g, '');
    // Remove hamza on line
    t = t.replace(/ء/g, '');
    // Remove punctuation & non-word characters except Arabic and spaces
    t = t.replace(/[^\w\s\u0600-\u06FF]/g, ' ');
    // Normalize extra spaces
    return t.replace(/\s+/g, ' ').trim();
  }

  // ── Tokenizer ─────────────────────────────────────────────
  function tokenize(text) {
    return normalizeArabic(text).split(/\s+/).filter(t => t.length > 1);
  }

  // ── Controlled Legal Synonym Map (Manual & Strict) ────────
  const LEGAL_SYNONYMS = {
    'ميراث': ['الميراث', 'التركة', 'تركة', 'الورثة', 'ورثة', 'تقسيم التركة', 'قسمة التركة', 'موروث', 'تركات'],
    'تركة': ['الميراث', 'ميراث', 'التركة', 'الورثة', 'ورثة', 'تقسيم التركة', 'قسمة التركة'],
    'عقارات': ['عقار', 'العقارات', 'ملكية', 'تسجيل عقاري', 'شهر عقاري', 'أراضي', 'عقود البيع'],
    'جنائي': ['جنايات', 'الجنايات', 'جنح', 'جرائم', 'نقض جنائي', 'محكمة الجنايات'],
    'شركات': ['تأسيس شركات', 'قانون تجاري', 'سجل تجاري', 'اتفاقيات شركاء', 'الشركات'],
    'أسرة': ['أحوال شخصية', 'الطلاق', 'نفقة', 'حضانة', 'خلع', 'منازعات أسرية'],
    'عقود': ['صياغة عقود', 'مراجعة عقود', 'اتفاقيات', 'التزامات عقادية']
  };

  function expandConcepts(tokens) {
    const expanded = new Set(tokens);
    tokens.forEach(token => {
      Object.keys(LEGAL_SYNONYMS).forEach(key => {
        const normKey = normalizeArabic(key);
        const normSynonyms = LEGAL_SYNONYMS[key].map(normalizeArabic);
        if (token === normKey || normSynonyms.includes(token)) {
          expanded.add(normKey);
          normSynonyms.forEach(syn => expanded.add(syn));
        }
      });
    });
    return [...expanded];
  }

  // ── Controlled Fuzzy Match (Levenshtein) ──────────────────
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function fuzzyMatch(queryToken, targetToken, threshold) {
    threshold = threshold || 1;
    // Do not apply fuzzy matching to very short words (<= 3 chars)
    if (queryToken.length <= 3) return queryToken === targetToken;
    return levenshtein(queryToken, targetToken) <= threshold;
  }

  // ── Deterministic Scoring Engine ──────────────────────────
  function scoreArticle(article, rawQuery, queryTokens, expandedTokens) {
    let score = 0;
    const reasons = [];

    const normQuery = normalizeArabic(rawQuery);
    const title = normalizeArabic(article.title || '');
    const category = normalizeArabic(article.category || '');
    const excerpt = normalizeArabic(article.excerpt || '');
    const content = normalizeArabic(article.content || '');
    const tags = (article.tags || []).map(normalizeArabic);
    const keywords = (article.keywords || []).map(normalizeArabic);

    // 1. Exact Full Query Match (Weight: 50)
    if (title === normQuery) {
      score += 50;
      reasons.push('تطابق عنوان المقال');
    }

    // 2. Phrase Match in Title (Weight: 30)
    if (title.includes(normQuery)) {
      score += 30;
      if (!reasons.includes('تطابق عنوان المقال')) reasons.push('تطابق عنوان المقال');
    }

    // 3. Phrase Match in Category (Weight: 20)
    if (category.includes(normQuery)) {
      score += 20;
      reasons.push('تطابق التخصص والقسم');
    }

    // 4. Token Scoring
    expandedTokens.forEach(token => {
      // Title token match (Weight: 15)
      if (title.includes(token)) {
        score += 15;
        if (!reasons.includes('تطابق عنوان المقال')) reasons.push('تطابق عنوان المقال');
      }

      // Tag token match (Weight: 12)
      if (tags.some(tag => tag.includes(token) || fuzzyMatch(token, tag, 1))) {
        score += 12;
        if (!reasons.includes('مرتبط بالوسوم الموضوعية')) reasons.push('مرتبط بالوسوم الموضوعية');
      }

      // Keyword token match (Weight: 10)
      if (keywords.some(kw => kw.includes(token) || fuzzyMatch(token, kw, 1))) {
        score += 10;
        if (!reasons.includes('مرتبط بالموضوع المراد التعرّف عليه')) reasons.push('مرتبط بالموضوع المراد التعرّف عليه');
      }

      // Category token match (Weight: 8)
      if (category.includes(token)) {
        score += 8;
        if (!reasons.includes('تطابق التخصص والقسم')) reasons.push('تطابق التخصص والقسم');
      }

      // Excerpt token match (Weight: 5)
      if (excerpt.includes(token)) {
        score += 5;
        if (!reasons.includes('مذكور في ملخص المقال')) reasons.push('مذكور في ملخص المقال');
      }

      // Body content token match (Weight: 2)
      if (content.includes(token)) {
        score += 2;
      }
    });

    return { score, reasons };
  }

  // ── Main Search Execution ─────────────────────────────────
  function searchArticles(articles, query) {
    if (!query || !query.trim()) return [];

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const expandedTokens = expandConcepts(queryTokens);

    const results = articles.map(article => {
      const { score, reasons } = scoreArticle(article, query, queryTokens, expandedTokens);
      return { ...article, score, reasons };
    }).filter(r => r.score > 0);

    results.sort((a, b) => b.score - a.score);

    return results;
  }

  // ── Related Articles Affinity Scoring ──────────────────────
  function findRelatedArticles(articles, currentArticle, maxCount) {
    maxCount = maxCount || 3;
    if (!currentArticle) return [];

    const scored = articles.map(article => {
      if (article.id === currentArticle.id || article.slug === currentArticle.slug) {
        return { ...article, relationScore: -1 };
      }

      let score = 0;
      // Category match (weight: 10)
      if (article.category === currentArticle.category) score += 10;

      // Shared tags (weight: 5 per tag)
      const articleTags = new Set(article.tags || []);
      const currentTags = new Set(currentArticle.tags || []);
      let sharedTags = 0;
      articleTags.forEach(t => { if (currentTags.has(t)) sharedTags++; });
      score += sharedTags * 5;

      // Shared keywords (weight: 3 per keyword)
      const articleKw = new Set(article.keywords || []);
      const currentKw = new Set(currentArticle.keywords || []);
      let sharedKw = 0;
      articleKw.forEach(k => { if (currentKw.has(k)) sharedKw++; });
      score += sharedKw * 3;

      // Shared related services (weight: 4 per service)
      const articleSvc = new Set(article.relatedServices || []);
      const currentSvc = new Set(currentArticle.relatedServices || []);
      let sharedSvc = 0;
      articleSvc.forEach(s => { if (currentSvc.has(s)) sharedSvc++; });
      score += sharedSvc * 4;

      return { ...article, relationScore: score };
    });

    return scored
      .filter(a => a.relationScore > 0)
      .sort((a, b) => b.relationScore - a.relationScore)
      .slice(0, maxCount);
  }

  // Expose search API
  window.GhonemySearch = {
    normalizeArabic,
    tokenize,
    expandConcepts,
    fuzzyMatch,
    searchArticles,
    findRelatedArticles
  };
})();
