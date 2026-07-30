import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function formatLead(lead: any) {
  let salesQuestions = lead.salesQuestions;
  if (typeof salesQuestions === 'string') {
    try {
      salesQuestions = JSON.parse(salesQuestions);
    } catch {
      // Keep original
    }
  }
  return {
    ...lead,
    salesQuestions,
  };
}

/**
 * Deduplicates leads array by normalized domain URL.
 */
function deduplicateLeads(leads: any[]): any[] {
  const seenDomains = new Set<string>();
  const result: any[] = [];

  for (const lead of leads) {
    const domainKey = (lead.website || '')
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '');

    if (domainKey && !seenDomains.has(domainKey)) {
      seenDomains.add(domainKey);
      result.push(lead);
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const lead = await db.lead.findUnique({
        where: { id },
      });
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json(formatLead(lead), { status: 200 });
    }

    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = leads.map(formatLead);
    const deduplicated = deduplicateLeads(formatted);

    return NextResponse.json(deduplicated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leads from database.';
    return NextResponse.json({ error: 'Database Error', details: message }, { status: 500 });
  }
}
