import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getSession } from '@/lib/auth';
import type { Mail } from '@/types';

const defaultGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type MailInsightResponse =
  | { ok: true; summary: string; mail: Mail }
  | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<MailInsightResponse>> {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { mail?: Mail };
  try {
    body = (await req.json()) as { mail?: Mail };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { mail } = body;
  if (!mail || !mail.id) {
    return NextResponse.json({ ok: false, error: 'No mail provided for insight' }, { status: 400 });
  }

  // Request mail body includes ONLY these details:
  const mailPayload = {
    id: mail.id,
    subject: mail.subject,
    sender: mail.sender,
    body: mail.body,
    status: mail.status,
    createdAt: mail.createdAt,
    labels: mail.labels,
    threadId: mail.threadId,
  };

  const prompt = `Analyze the following email and give a concise 2-line summary of not more than 50 words.

Email Details:
${JSON.stringify(mailPayload, null, 2)}

Output MUST be a valid JSON object matching this schema strictly:
{
  "summary": "2-line summary of not more than 50 words"
}`;

  try {
    let completion;
    try {
      completion = await defaultGroq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an email analysis AI assistant. Provide a concise 2-line summary of at most 50 words. Respond strictly in valid JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
    } catch {
      completion = await defaultGroq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an email analysis AI assistant. Provide a concise 2-line summary of at most 50 words. Respond strictly in valid JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'gpt-oss-120b',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
    }

    const responseText = completion.choices[0]?.message?.content || '{}';
    let parsed: { summary?: string } = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { summary: mail.subject || 'Summary unavailable' };
    }

    const summary = parsed.summary?.trim() || mail.subject || 'Summary unavailable';

    const updatedMail: Mail = {
      ...mail,
      summary,
    };

    return NextResponse.json({ ok: true, summary, mail: updatedMail });
  } catch (err: unknown) {
    console.error('Groq insight error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Groq insight failed';
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
