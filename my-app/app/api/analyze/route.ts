import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeWebsite } from '@/lib/scraper';
import { analyzeWebsite } from '@/lib/gemini';
import db from '@/lib/db';

// Input Schema Validation
const AnalyzeInputSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty'),
});

export async function POST(request: NextRequest) {
  // 1. Parse JSON Request Body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL', details: 'Malformed or empty JSON request body.' },
      { status: 400 }
    );
  }

  // 2. Validate URL Input using Zod
  const validation = AnalyzeInputSchema.safeParse(body);
  if (!validation.success) {
    const errorDetails = validation.error.issues
      .map((issue) => issue.message)
      .join('; ');
    return NextResponse.json(
      { error: 'Invalid URL', details: errorDetails },
      { status: 400 }
    );
  }

  const targetUrl = validation.data.url;

  // 3. Step 1: Execute Web Scraper
  let scrapedData;
  try {
    scrapedData = await scrapeWebsite(targetUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to reach website.';
    return NextResponse.json(
      { error: 'Website unreachable', details: errorMessage },
      { status: 404 }
    );
  }

  // 4. Step 2: Execute Gemini AI Analysis
  let aiResult;
  try {
    aiResult = await analyzeWebsite({
      title: scrapedData.title,
      description: scrapedData.description,
      content: scrapedData.content,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'AI website analysis failed.';
    return NextResponse.json(
      { error: 'Gemini Error', details: errorMessage },
      { status: 500 }
    );
  }

  // 5. Step 3: Save Result to Prisma SQLite Database
  let savedLead;
  try {
    // Determine clean company name from title or website domain
    const fallbackName = targetUrl.replace(/^https?:\/\//i, '').split('/')[0];
    const companyName = scrapedData.title
      ? scrapedData.title.split('|')[0].split('-')[0].trim() || fallbackName
      : fallbackName;

    const salesQuestionsJson = typeof aiResult.salesQuestions === 'string'
      ? aiResult.salesQuestions
      : JSON.stringify(aiResult.salesQuestions);

    savedLead = await db.lead.create({
      data: {
        companyName,
        website: targetUrl,
        companyOverview: aiResult.companyOverview,
        coreProduct: aiResult.coreProduct,
        targetCustomer: aiResult.targetCustomer,
        b2bDecision: aiResult.b2bDecision,
        salesQuestions: salesQuestionsJson,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to save record to database.';
    return NextResponse.json(
      { error: 'Database Error', details: errorMessage },
      { status: 500 }
    );
  }

  // Parse salesQuestions for client response if stringified
  let parsedSalesQuestions = savedLead.salesQuestions;
  try {
    if (typeof savedLead.salesQuestions === 'string') {
      parsedSalesQuestions = JSON.parse(savedLead.salesQuestions);
    }
  } catch {
    // Keep as string if parsing fails
  }

  // 6. Return Saved Record as JSON
  return NextResponse.json(
    {
      ...savedLead,
      salesQuestions: parsedSalesQuestions,
    },
    { status: 200 }
  );
}
