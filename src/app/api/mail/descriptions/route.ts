import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getSession } from '@/lib/auth';

const defaultGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface MailDescriptionInput {
  id: string;
  sender: string;
  subject: string;
}

export type MailDescriptionsResponse =
  | { ok: true; descriptions: Record<string, string> }
  | { ok: false; error: string };

function generateFallbackDescription(subject: string): string {
  const clean = (subject || 'General email message')
    .replace(/^((re|fwd|fw):\s*)+/i, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 5) {
    return `${clean} - overview of incoming message`.split(/\s+/).slice(0, 7).join(' ');
  }
  return words.slice(0, 8).join(' ');
}

export async function POST(req: Request): Promise<NextResponse<MailDescriptionsResponse>> {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { mails?: MailDescriptionInput[] };
  try {
    body = (await req.json()) as { mails?: MailDescriptionInput[] };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { mails } = body;
  if (!Array.isArray(mails) || mails.length === 0) {
    return NextResponse.json({ ok: false, error: 'No mails provided for descriptions' }, { status: 400 });
  }

  const trimmedMails = mails.slice(0, 20).map((m) => ({
    id: m.id,
    sender: m.sender,
    subject: m.subject || 'No Subject',
  }));

  const prompt = `You are an email assistant. Given the following emails, write a brief, informative description of strictly 5 to 8 words for each email based on its sender and subject.

Emails:
${JSON.stringify(trimmedMails, null, 2)}

Output MUST strictly be a JSON object with this exact schema:
{
  "descriptions": [
    {
      "id": "email_id",
      "description": "strictly 5 to 8 words description"
    }
  ]
}`;

  try {
    let completion;
    try {
      completion = await defaultGroq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an email analysis assistant. Write a concise, natural description of strictly 5 to 8 words for each email based on sender and subject. Output only valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
    } catch (primaryErr) {
      console.warn('Primary model openai/gpt-oss-120b failed, trying fallback:', primaryErr);
      try {
        completion = await defaultGroq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an email analysis assistant. Write a concise, natural description of strictly 5 to 8 words for each email based on sender and subject. Output only valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          model: 'openai/gpt-oss-20b',
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });
      } catch (secondaryErr) {
        console.warn('Secondary model failed, trying llama fallback:', secondaryErr);
        completion = await defaultGroq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an email analysis assistant. Write a concise, natural description of strictly 5 to 8 words for each email based on sender and subject. Output only valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });
      }
    }

    const responseText = completion?.choices?.[0]?.message?.content || '{}';
    let parsed: { descriptions?: Array<{ id: string; description: string }> } = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { descriptions: [] };
    }

    const descriptionsMap: Record<string, string> = {};
    if (Array.isArray(parsed.descriptions)) {
      for (const item of parsed.descriptions) {
        if (item.id && typeof item.description === 'string') {
          descriptionsMap[item.id] = item.description.trim();
        }
      }
    }

    // Ensure every requested mail has a description
    for (const mail of trimmedMails) {
      if (!descriptionsMap[mail.id]) {
        descriptionsMap[mail.id] = generateFallbackDescription(mail.subject);
      }
    }

    return NextResponse.json({ ok: true, descriptions: descriptionsMap });
  } catch (err: unknown) {
    console.error('Groq description error:', err);
    // Graceful fallback for all emails so UI still gets populated
    const fallbackMap: Record<string, string> = {};
    for (const mail of trimmedMails) {
      fallbackMap[mail.id] = generateFallbackDescription(mail.subject);
    }
    return NextResponse.json({ ok: true, descriptions: fallbackMap });
  }
}
