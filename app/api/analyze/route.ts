import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, searchWebsiteByCompanyName } from '@/lib/scraper';
import { analyzeWebsite } from '@/lib/gemini';
import db from '@/lib/db';

const pdf = require('pdf-parse');

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  let inputType = 'URL';
  let companyName = '';
  let targetUrl = '';
  let textToAnalyze = '';
  let title = '';
  let description = '';

  try {
    if (contentType.includes('multipart/form-data')) {
      // 1. PDF File Upload Flow
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'Invalid Request', details: 'No PDF file was uploaded.' },
          { status: 400 }
        );
      }

      inputType = 'PDF';
      title = file.name || 'Uploaded PDF';
      description = 'Extracted text from uploaded sales/company document.';
      targetUrl = 'PDF File Upload';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parser = new pdf.PDFParse({ data: buffer, disableWorker: true });
      const parsedPdf = await parser.getText();
      textToAnalyze = parsedPdf.text || '';

      if (!textToAnalyze.trim()) {
        return NextResponse.json(
          { error: 'Parsing Failed', details: 'The uploaded PDF file contains no readable text.' },
          { status: 422 }
        );
      }
    } else {
      // 2. JSON URL/Company Name Flow
      const body = await request.json();
      const { type, url } = body; // type: 'url' | 'company', url: target string

      if (!url || !url.trim()) {
        return NextResponse.json(
          { error: 'Invalid Input', details: 'Input value cannot be empty.' },
          { status: 400 }
        );
      }

      if (type === 'company') {
        inputType = 'TEXT';
        targetUrl = await searchWebsiteByCompanyName(url);
      } else {
        inputType = 'URL';
        targetUrl = url;
      }

      // Execute scraper
      const scrapedData = await scrapeWebsite(targetUrl);
      targetUrl = scrapedData.url;
      title = scrapedData.title;
      description = scrapedData.description;
      textToAnalyze = scrapedData.content;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error processing request input.';
    return NextResponse.json(
      { error: 'Process Error', details: message },
      { status: 500 }
    );
  }

  // 3. AI website/content analysis
  let aiResult;
  try {
    aiResult = await analyzeWebsite({
      title,
      description,
      content: textToAnalyze,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI website analysis failed.';
    return NextResponse.json(
      { error: 'AI Error', details: errorMessage },
      { status: 500 }
    );
  }

  // 4. Save result to Prisma SQLite database
  let savedLead;
  try {
    companyName = aiResult.companyName || title.split('|')[0].split('-')[0].trim();
    if (!companyName || companyName.toLowerCase().includes('just a moment')) {
      companyName = 'Researched Company';
    }

    const salesQuestionsJson = typeof aiResult.salesQuestions === 'string'
      ? aiResult.salesQuestions
      : JSON.stringify(aiResult.salesQuestions);

    const servicesProvidedJson = aiResult.servicesProvided
      ? (typeof aiResult.servicesProvided === 'string'
        ? aiResult.servicesProvided
        : JSON.stringify(aiResult.servicesProvided))
      : null;

    savedLead = await db.lead.create({
      data: {
        companyName,
        website: targetUrl,
        companyOverview: aiResult.companyOverview,
        coreProduct: aiResult.coreProduct,
        targetCustomer: aiResult.targetCustomer,
        b2bDecision: aiResult.b2bDecision,
        salesQuestions: salesQuestionsJson,
        servicesProvided: servicesProvidedJson,
        valueProposition: aiResult.valueProposition || null,
        industry: aiResult.industry || null,
        inputType,
        aiSummary: aiResult.aiSummary || null,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save record to database.';
    return NextResponse.json(
      { error: 'Database Error', details: errorMessage },
      { status: 500 }
    );
  }

  // Parse fields for response
  let parsedSalesQuestions = savedLead.salesQuestions;
  try {
    if (typeof savedLead.salesQuestions === 'string') {
      parsedSalesQuestions = JSON.parse(savedLead.salesQuestions);
    }
  } catch {
    // ignore
  }

  let parsedServicesProvided = savedLead.servicesProvided;
  try {
    if (typeof savedLead.servicesProvided === 'string') {
      parsedServicesProvided = JSON.parse(savedLead.servicesProvided);
    }
  } catch {
    // ignore
  }

  return NextResponse.json(
    {
      ...savedLead,
      salesQuestions: parsedSalesQuestions,
      servicesProvided: parsedServicesProvided,
    },
    { status: 200 }
  );
}
