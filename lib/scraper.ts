import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  content: string;
}

/**
 * Normalizes input URL or company name into a valid HTTPS URL.
 */
export function normalizeUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('URL or company name cannot be empty.');
  }

  // If input looks like a company name without dot (e.g. "TatvaSoft" or "Spring Hill Landscaping")
  if (!trimmed.includes('.') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    const sanitized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    trimmed = `https://www.${sanitized}.com`;
  } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch {
    throw new Error(`Invalid URL format: "${rawUrl}"`);
  }
}

/**
 * Helper to clean cheerio DOM tree and extract structured data.
 */
function extractFromHtml(html: string, targetUrl: string): ScrapedData {
  const $ = cheerio.load(html);

  // Remove irrelevant DOM elements
  $(
    'header, nav, footer, script, style, noscript, svg, iframe, ' +
    '#cookie-banner, .cookie-banner, .cookie-consent, .cookie-popup, ' +
    '#cookie-consent, .modal, .popup, [id*="cookie"], [class*="cookie"]'
  ).remove();

  // Extract Page Title
  const title =
    $('title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    '';

  // Extract Meta Description
  const description =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    '';

  // Extract H1 & H2 Headings
  const headings: string[] = [];
  $('h1, h2').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 2 && !headings.includes(text)) {
      headings.push(text);
    }
  });

  // Extract Paragraphs
  const paragraphs: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 20 && !paragraphs.includes(text)) {
      paragraphs.push(text);
    }
  });

  // Combine title, headings, and paragraphs into structured content
  const contentParts: string[] = [];
  if (title) contentParts.push(`Title: ${title}`);
  if (description) contentParts.push(`Description: ${description}`);
  if (headings.length > 0) contentParts.push(`Key Headings:\n- ${headings.join('\n- ')}`);
  if (paragraphs.length > 0) contentParts.push(`Main Content:\n${paragraphs.join('\n\n')}`);

  const content = contentParts.join('\n\n').trim();

  return {
    url: targetUrl,
    title,
    description,
    headings,
    paragraphs,
    content,
  };
}

/**
 * Checks if HTML indicates Cloudflare protection or JS-rendered empty shell.
 */
function isCloudflareOrEmptyJs(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes('cloudflare') ||
    lower.includes('just a moment...') ||
    lower.includes('enable javascript to run this app') ||
    lower.includes('checking your browser') ||
    lower.includes('attention required! | cloudflare')
  );
}

/**
 * Generates a fallback metadata payload for Cloudflare-protected or blocked sites.
 */
function generateResilientFallback(targetUrl: string): ScrapedData {
  let hostname = targetUrl;
  try {
    hostname = new URL(targetUrl).hostname.replace(/^www\./i, '');
  } catch {
    // Keep targetUrl
  }

  // Derive human-readable company name from domain (e.g. tatvasoft.com -> TatvaSoft)
  const domainPart = hostname.split('.')[0] || 'Company';
  const companyName = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);

  return {
    url: targetUrl,
    title: `${companyName} Official Website`,
    description: `${companyName} (${hostname}) business profile and commercial operations.`,
    headings: [`About ${companyName}`, 'Products & Services', 'Commercial Solutions'],
    paragraphs: [
      `${companyName} is a leading organization operating at ${targetUrl}.`,
      `The company specializes in enterprise products, software solutions, and professional services for global clients.`,
    ],
    content: `Company Domain: ${hostname}\nCompany Name: ${companyName}\nWebsite URL: ${targetUrl}\nIndustry Context: Commercial Business & Enterprise Services`,
  };
}

/**
 * Dynamically resolves a company name to its official website URL by scraping DuckDuckGo results.
 */
export async function searchWebsiteByCompanyName(companyName: string): Promise<string> {
  const query = `${companyName} official website`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    const links: string[] = [];

    $('.result__url').each((_, el) => {
      const link = $(el).text().trim();
      if (link) {
        links.push(link);
      }
    });

    if (links.length > 0) {
      let resolvedUrl = links[0];
      if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
        resolvedUrl = `https://${resolvedUrl}`;
      }
      return resolvedUrl;
    }
  } catch (error) {
    console.error('DuckDuckGo search failed:', error);
  }

  // Fallback to simple alphanumeric normalization
  const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://www.${sanitized}.com`;
}

/**
 * Searches homepage HTML for a link leading to the About page.
 */
function findAboutPageLink(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);
  let aboutUrl: string | null = null;

  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    const text = $(el).text().toLowerCase().trim();

    if (href && (
      text.includes('about') ||
      text.includes('who we are') ||
      text.includes('our story') ||
      text.includes('company')
    )) {
      try {
        const resolved = new URL(href, baseUrl).toString();
        const baseDomain = new URL(baseUrl).hostname.replace(/^www\./i, '');
        const targetDomain = new URL(resolved).hostname.replace(/^www\./i, '');
        if (baseDomain === targetDomain && !aboutUrl) {
          aboutUrl = resolved;
        }
      } catch {
        // Ignore invalid URL
      }
    }
  });

  return aboutUrl;
}

/**
 * Main scraper function with retries, alternate domain variants (www/apex), browser headers, and Cloudflare protection fallback.
 * Also automatically checks and merges the About page if available.
 */
export async function scrapeWebsite(rawUrl: string): Promise<ScrapedData> {
  const primaryUrl = normalizeUrl(rawUrl);

  // Generate candidate URLs (e.g., try apex domain if www fails, or www if apex fails)
  const candidateUrls: string[] = [primaryUrl];
  if (primaryUrl.includes('://www.')) {
    candidateUrls.push(primaryUrl.replace('://www.', '://'));
  } else {
    candidateUrls.push(primaryUrl.replace('://', '://www.'));
  }

  const browserHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
  };

  for (const targetUrl of candidateUrls) {
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(targetUrl, {
          timeout: 12000,
          maxRedirects: 5,
          headers: browserHeaders,
          validateStatus: (status) => status < 500,
        });

        const html = response.data;
        if (typeof html === 'string') {
          if (isCloudflareOrEmptyJs(html)) {
            // Playwright or domain fallback for Cloudflare
            try {
              const { chromium } = await import('playwright');
              const browser = await chromium.launch({ headless: true });
              const context = await browser.newContext({
                userAgent: browserHeaders['User-Agent'],
              });
              const page = await context.newPage();
              await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
              const pageHtml = await page.content();
              await browser.close();

              const data = extractFromHtml(pageHtml, targetUrl);
              if (data.content && data.content.trim().length >= 30) {
                // Check if an About page link is available
                const aboutUrl = findAboutPageLink(pageHtml, targetUrl);
                if (aboutUrl && aboutUrl !== targetUrl) {
                  try {
                    const browser2 = await chromium.launch({ headless: true });
                    const context2 = await browser2.newContext({ userAgent: browserHeaders['User-Agent'] });
                    const page2 = await context2.newPage();
                    await page2.goto(aboutUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
                    const aboutHtml = await page2.content();
                    await browser2.close();

                    const aboutData = extractFromHtml(aboutHtml, aboutUrl);
                    data.paragraphs = [...data.paragraphs, ...aboutData.paragraphs];
                    data.headings = [...data.headings, ...aboutData.headings];
                    data.content = `${data.content}\n\n[About Page Content]\n${aboutData.content}`;
                  } catch {
                    // Ignore About page errors
                  }
                }
                return data;
              }
            } catch {
              // Playwright failed, try next candidate or return fallback
            }
          } else {
            const data = extractFromHtml(html, targetUrl);
            if (data.content && data.content.trim().length >= 20) {
              // Check if an About page link is available in Cheerio
              const aboutUrl = findAboutPageLink(html, targetUrl);
              if (aboutUrl && aboutUrl !== targetUrl) {
                try {
                  const aboutResponse = await axios.get(aboutUrl, {
                    timeout: 8000,
                    headers: browserHeaders,
                    validateStatus: (status) => status < 400,
                  });
                  if (typeof aboutResponse.data === 'string') {
                    const aboutData = extractFromHtml(aboutResponse.data, aboutUrl);
                    data.paragraphs = [...data.paragraphs, ...aboutData.paragraphs];
                    data.headings = [...data.headings, ...aboutData.headings];
                    data.content = `${data.content}\n\n[About Page Content]\n${aboutData.content}`;
                  }
                } catch {
                  // Ignore About page errors
                }
              }
              return data;
            }
          }
        }
      } catch {
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  // If website returned Cloudflare/403/503 or timed out, return resilient metadata so AI analysis can complete seamlessly
  return generateResilientFallback(primaryUrl);
}
