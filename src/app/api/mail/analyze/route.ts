import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getSession } from '@/lib/auth';
import { getCategories } from '@/lib/action';
import { getUserSettings } from '@/app/api/_db/settings';
import type { Mail } from '@/types';

const defaultGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type MailAnalyzeResponse =
  | { ok: true; analyzedMails: Mail[] }
  | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<MailAnalyzeResponse>> {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { mails?: Mail[]; modelId?: string };
  try {
    body = (await req.json()) as { mails?: Mail[]; modelId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { mails, modelId } = body;
  if (!Array.isArray(mails) || mails.length === 0) {
    return NextResponse.json({ ok: false, error: 'No mails provided for analysis' }, { status: 400 });
  }

  const isHardcoded = !modelId || modelId.startsWith('hardcoded-') || modelId === 'hardcoded-llama-70b';

  if (isHardcoded && mails.length > 2) {
    return NextResponse.json({ ok: false, error: 'You can analyze at most 2 mails at a time with the default model' }, { status: 400 });
  }

  const dbCategories = await getCategories();
  if (!dbCategories || dbCategories.length === 0) {
    return NextResponse.json({ ok: false, error: 'No categories found in database. Add categories first.' }, { status: 400 });
  }

  const categoryNames = dbCategories.map((c) => c.name);
  const categoryFormattedList = dbCategories
    .map((c) => `- Category: "${c.name}"${c.description ? `\n  Description: "${c.description}"` : ''}`)
    .join('\n');

  let groqClient = defaultGroq;
  let nameToUse = 'gpt-oss-120b';

  if (!isHardcoded && session.user?.id) {
    try {
      const settings = await getUserSettings(session.user.id);
      const customModel = settings.models.find((m) => m.id === modelId);
      if (customModel) {
        if (customModel.apiKey && customModel.apiKey !== 'FREE') {
          groqClient = new Groq({ apiKey: customModel.apiKey });
        }
        if (customModel.name) {
          nameToUse = customModel.name;
        }
      }
    } catch {
    }
  }

  try {
    const analyzedMails: Mail[] = [];

    for (const mail of mails) {
      const prompt = `Analyze the following email and categorize it into EXACTLY ONE of the allowed categories listed below based on their descriptions. Also compute a priority score between -1.0 (Low/Archive) and 1.0 (Urgent/Important).

Allowed Categories:
${categoryFormattedList}

Email Details:
- Subject: ${mail.subject}
- From: ${mail.sender}
- Body: ${mail.body.slice(0, 1500)}

Output MUST be a valid JSON object matching this schema strictly:
{
  "category": "exact_category_name_from_list",
  "priority": 0.75,
  "summary": "Short 1-sentence summary"
}`;

      const completion = await groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert email analysis AI. Respond strictly in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: nameToUse,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      let parsed: { category?: string; categories?: string[]; priority?: number | number[]; summary?: string } = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = { category: categoryNames[0], priority: 0.5, summary: mail.subject };
      }

      const assignedCategory = typeof parsed.category === 'string' && categoryNames.includes(parsed.category)
        ? parsed.category
        : (Array.isArray(parsed.categories) && parsed.categories.find((c) => categoryNames.includes(c))) || categoryNames[0];

      const rawPriority = typeof parsed.priority === 'number'
        ? parsed.priority
        : (Array.isArray(parsed.priority) ? Number(parsed.priority[0]) || 0.5 : 0.5);

      const priorityVal = Math.max(-1, Math.min(1, rawPriority));

      analyzedMails.push({
        ...mail,
        categories: [assignedCategory],
        priority: [String(priorityVal)],
        summary: parsed.summary || mail.subject,
      });
    }

    return NextResponse.json({ ok: true, analyzedMails });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Groq analysis failed';
    console.error('Groq analysis error:', err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
