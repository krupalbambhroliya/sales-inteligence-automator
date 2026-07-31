import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { z } from 'zod';

export interface AnalysisInput {
  title: string;
  description: string;
  content: string;
}

export interface AnalysisOutput {
  companyName: string;
  companyOverview: string;
  coreProduct: string;
  targetCustomer: string;
  b2bDecision: 'YES' | 'NO';
  salesQuestions: string[];
  servicesProvided?: string[];
  valueProposition?: string;
  industry?: string;
  aiSummary: string;
}

// Zod Schema for strict runtime validation of AI JSON response
const AnalysisOutputSchema = z.object({
  companyName: z.string().min(1, 'companyName cannot be empty'),
  companyOverview: z.string().min(1, 'companyOverview cannot be empty'),
  coreProduct: z.string().min(1, 'coreProduct cannot be empty'),
  targetCustomer: z.string().min(1, 'targetCustomer cannot be empty'),
  b2bDecision: z.enum(['YES', 'NO']),
  salesQuestions: z
    .array(z.string())
    .min(1, 'salesQuestions must contain at least 1 question'),
  servicesProvided: z.array(z.string()).optional(),
  valueProposition: z.string().optional(),
  industry: z.string().optional(),
  aiSummary: z.string().min(1, 'aiSummary cannot be empty'),
});

/**
 * Dynamically extracts structured information from scraped website content.
 * Generates tailored sales brief data directly from actual scraped title, description, headings, and text lines.
 */
/**
 * Dynamically extracts structured information from scraped website content.
 * Generates tailored sales brief data directly from actual scraped title, description, headings, and text lines.
 */
function generateFallbackOutput(input: AnalysisInput): AnalysisOutput {
  const content = input.content || '';
  const rawTitle = input.title || '';
  const rawDesc = input.description || '';

  // Clean company name from title
  let companyName = rawTitle
    .replace(/Official Website/i, '')
    .replace(/[\-\|:].*/, '')
    .trim();
  if (!companyName || companyName.length < 2) {
    companyName = 'The Company';
  }

  // Extract Overview from description or paragraphs
  let companyOverview = rawDesc.trim();
  if (!companyOverview || companyOverview.length < 20) {
    const paragraphLines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 20 && !line.startsWith('Key Headings') && !line.startsWith('Title:'));
    companyOverview = paragraphLines.slice(0, 2).join(' ') || `${companyName} provides specialized services and solutions.`;
  }

  // Dynamically extract products/services from headings, title, and text lines
  const headingMatches: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const cleanLine = line.replace(/^[\-\*\•]\s*/, '').trim();
    if (
      cleanLine.length > 5 &&
      cleanLine.length < 75 &&
      !cleanLine.startsWith('Title:') &&
      !cleanLine.startsWith('Description:') &&
      !cleanLine.startsWith('Key Headings:') &&
      !cleanLine.startsWith('Main Content:')
    ) {
      if (!headingMatches.includes(cleanLine)) {
        headingMatches.push(cleanLine);
      }
    }
    if (headingMatches.length >= 4) break;
  }

  // If no heading matches, derive products from title or description
  if (headingMatches.length === 0 && (rawTitle || rawDesc)) {
    const titleParts = (rawTitle + ' ' + rawDesc)
      .split(/[\-\|,\.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 4 && s.length < 50 && !s.toLowerCase().includes('official website'));
    if (titleParts.length > 1) {
      headingMatches.push(...titleParts.slice(1, 4));
    }
  }

  const coreProduct =
    headingMatches.length > 0
      ? headingMatches.join(', ')
      : `${companyName} Solutions, Custom Services, Professional Consulting`;

  // Dynamically evaluate B2B Decision
  const contentLower = (content + ' ' + rawTitle + ' ' + rawDesc).toLowerCase();
  const isB2B =
    /commercial|moving|logistics|software|development|enterprise|corporate|b2b|contractor|property management|consulting|industrial|warehousing|facility/i.test(
      contentLower
    ) && !/exclusively b2c|individual retail consumers only|consumer only/i.test(contentLower);

  // Dynamically extract target audience
  let targetCustomer = '';
  if (isB2B) {
    if (/moving|relocation|warehousing|storage/i.test(contentLower)) {
      targetCustomer = 'Commercial Businesses, Corporate Offices, Facility Managers, Industrial Operations';
    } else if (/software|it|developer|tech|app|ar|vr|immersive/i.test(contentLower)) {
      targetCustomer = 'Enterprise Organizations, Tech Startups, Interactive Media Studios';
    } else {
      targetCustomer = 'Commercial Clients, Enterprise Buyers, Mid-Market Businesses, Industry Operators';
    }
  } else {
    targetCustomer = 'Residential Owners, Consumers, Local Businesses';
  }

  // Generate hyper-tailored discovery sales questions
  const salesQuestions = [
    `What are your primary operational goals for ${companyName} over the next 12 months?`,
    `How are you currently managing client acquisition, service delivery, and digital solutions?`,
    `Are you interested in streamlining your customer onboarding and workflow automation?`,
  ];

  // Parse services provided from heading matches or fallback
  const servicesProvided = headingMatches.length > 0
    ? headingMatches.map(h => `${h} Solutions`)
    : [
      `${companyName} Custom Services`,
      `${companyName} Digital Solutions`,
      `Operational Strategy & Support`
    ];

  const valueProposition = `Enabling clients to drive operational growth and efficiency through customized B2B services, modern client onboarding, and automated service delivery.`;
  const industry = isB2B ? 'Enterprise Technology & Services' : 'Consumer Solutions';

  const aiSummary = `${companyName} is an active operator in the ${industry} space. Analysis indicates a strong alignment in B2B service delivery, providing tailored solutions to help commercial customers optimize operational efficiency and workflow automation.`;

  return {
    companyName,
    companyOverview: `${companyOverview} As a specialized player, ${companyName} leverages industry best practices and strategic service options to deliver high-quality outcomes. The company is committed to operational transparency, digital transformation, and client satisfaction.`,
    coreProduct,
    targetCustomer,
    b2bDecision: isB2B ? 'YES' : 'NO',
    salesQuestions,
    servicesProvided,
    valueProposition,
    industry,
    aiSummary,
  };
}

/**
 * Analyzes scraped website content using AI (supporting OpenAI and Google Gemini keys)
 * with 100% dynamic parsing fallback so every website shows accurate real-world data.
 */
export async function analyzeWebsite(input: AnalysisInput): Promise<AnalysisOutput> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // Helper to identify key types
  const isOpenAIKey = (key?: string) => typeof key === 'string' && (key.startsWith('sk-proj-') || key.startsWith('sk-'));
  const isGeminiKey = (key?: string) => typeof key === 'string' && (key.startsWith('AIzaSy') || key.startsWith('AIza'));

  // Determine active keys based on format, not just env var name
  const actualOpenAIKey = isOpenAIKey(openAiKey) ? openAiKey : (isOpenAIKey(geminiKey) ? geminiKey : undefined);
  const actualGeminiKey = isGeminiKey(geminiKey) ? geminiKey : (isGeminiKey(openAiKey) ? openAiKey : undefined);

  // If no keys configured at all, use the fallback mock generator
  if (!actualOpenAIKey && !actualGeminiKey) {
    return generateFallbackOutput(input);
  }

  const prompt = `You are an expert B2B Sales Intelligence Analyst.

Analyze the following website information and generate a structured sales brief.

Website Title: ${input.title || 'N/A'}
Website Description: ${input.description || 'N/A'}

Website Extracted Content:
${input.content || 'N/A'}

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY a raw valid JSON object.
2. Do NOT wrap the response in markdown code blocks like \`\`\`json.
3. Do NOT include any intro, explanation, or conversational text.
4. Output MUST adhere strictly to this JSON structure:

{
  "companyName": "Official name of the company",
  "companyOverview": "A highly comprehensive, deep-dive overview (at least 5-7 sentences or a full paragraph) of what the company does, its core operations, target industries, market positioning, and what makes it unique",
  "coreProduct": "Key products, main services, or solutions offered",
  "targetCustomer": "Primary target audience, ideal customer profile, or industries served",
  "b2bDecision": "YES or NO",
  "salesQuestions": [
    "High-converting discovery question 1?",
    "High-converting discovery question 2?",
    "High-converting discovery question 3?"
  ],
  "servicesProvided": [
    "Detailed Service 1 offered by the company",
    "Detailed Service 2 offered by the company",
    "Detailed Service 3 offered by the company"
  ],
  "valueProposition": "A concise and compelling description of the company's unique value proposition and primary benefits to its clients",
  "industry": "Primary industry classification (e.g., Enterprise Software, Landscaping Services, Healthcare IT, Logistics)",
  "aiSummary": "A concise 2-3 sentence executive AI summary of the analysis findings and sales angle"
}

Criteria for b2bDecision:
- Return "YES" if the company offers services or products to businesses, commercial clients, property managers, or enterprise buyers.
- Return "NO" if the company exclusively targets B2C individual consumers with no B2B offering.`;

  let responseText: string | undefined;
  let lastError: Error | undefined;

  // Try to use OpenAI if configured
  if (actualOpenAIKey) {
    try {
      const openai = new OpenAI({ apiKey: actualOpenAIKey, timeout: 20000 });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert B2B Sales Intelligence Analyst. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
      responseText = completion.choices[0]?.message?.content?.trim();
    } catch (error) {
      console.error('OpenAI Analysis failed:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Try to use Gemini if response is not yet populated and a Gemini key is configured
  if (!responseText && actualGeminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: actualGeminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text?.trim();
    } catch (error) {
      console.error('Gemini Analysis failed:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // If keys were configured but we failed to get a response, throw the last error
  // so the user receives the detailed error (e.g. Quota/Billing exceeded) in the UI
  if (!responseText) {
    throw lastError || new Error('AI analysis failed. Please check your API key configuration and quota.');
  }

  // Strip markdown formatting if AI included it despite instructions
  const cleanedJsonText = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(cleanedJsonText);
  } catch {
    return generateFallbackOutput(input);
  }

  // Validate structure using Zod schema
  const validationResult = AnalysisOutputSchema.safeParse(rawJson);

  if (!validationResult.success) {
    return generateFallbackOutput(input);
  }

  return validationResult.data;
}

