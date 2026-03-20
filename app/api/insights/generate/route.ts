import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { getCarbonGrade } from '@/lib/carbonGrade';
import { CARBON_COEFFICIENTS } from '@/lib/carbonCoefficients';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch user's transactions
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (txError) {
      return NextResponse.json({ error: txError.message, code: 500 }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions found. Please upload data first.', code: 400 }, { status: 400 });
    }

    // Aggregate data
    const totalCO2 = transactions.reduce((sum: number, tx: { co2_kg: number }) => sum + (tx.co2_kg || 0), 0);
    const totalSpend = transactions.reduce((sum: number, tx: { amount_usd: number }) => sum + (tx.amount_usd || 0), 0);

    // Category breakdown
    const categoryMap: Record<string, { co2: number; spend: number }> = {};
    for (const tx of transactions) {
      if (!categoryMap[tx.category]) categoryMap[tx.category] = { co2: 0, spend: 0 };
      categoryMap[tx.category].co2 += tx.co2_kg || 0;
      categoryMap[tx.category].spend += tx.amount_usd || 0;
    }

    const sortedCategories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b.co2 - a.co2)
      .map(([cat, data]) => ({
        category: CARBON_COEFFICIENTS[cat]?.label || cat,
        co2_kg: parseFloat(data.co2.toFixed(2)),
        spend_usd: parseFloat(data.spend.toFixed(2)),
        pct_of_total: parseFloat(((data.co2 / totalCO2) * 100).toFixed(1)),
      }));

    // Month-over-month changes
    const monthMap: Record<string, Record<string, number>> = {};
    for (const tx of transactions) {
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthMap[month]) monthMap[month] = {};
      if (!monthMap[month][tx.category]) monthMap[month][tx.category] = 0;
      monthMap[month][tx.category] += tx.co2_kg || 0;
    }

    const months = Object.keys(monthMap).sort();
    const momChanges = months.map((month, i) => {
      if (i === 0) return `${month}: Initial period`;
      const prev = monthMap[months[i - 1]];
      const curr = monthMap[month];
      const allCats = new Set([...Object.keys(prev), ...Object.keys(curr)]);
      const changes = Array.from(allCats).map(cat => {
        const prevVal = prev[cat] || 0;
        const currVal = curr[cat] || 0;
        const delta = currVal - prevVal;
        const pct = prevVal > 0 ? ((delta / prevVal) * 100).toFixed(1) : 'N/A';
        return `  ${CARBON_COEFFICIENTS[cat]?.label || cat}: ${delta > 0 ? '+' : ''}${delta.toFixed(2)} kg (${pct}%)`;
      }).join('\n');
      return `${month} vs ${months[i - 1]}:\n${changes}`;
    }).join('\n\n');

    const { grade } = getCarbonGrade(totalCO2, totalSpend);
    const categoryBreakdown = sortedCategories
      .map(c => `  ${c.category}: ${c.co2_kg} kg CO2 (${c.pct_of_total}% of total, $${c.spend_usd} spend)`)
      .join('\n');

    // Build prompts
    const systemPrompt = `
You are EcoTrace's AI Sustainability Coach. You analyse business transaction data 
and provide specific, actionable, hyper-local carbon reduction advice for SMEs.
You always respond in valid JSON. You never add commentary outside the JSON object.
Your tone is direct, data-driven, and empowering — not preachy.
`;

    const userPrompt = `
Here is the sustainability data for this business:

Carbon Grade: ${grade}
Total CO2 Emissions: ${totalCO2.toFixed(2)} kg
Total Spend Tracked: $${totalSpend.toFixed(2)}

Emissions by Category (sorted by highest emitter):
${categoryBreakdown}

Month-over-Month Changes:
${momChanges}

Return a JSON object with EXACTLY this structure:
{
  "headline": "One punchy sentence summarising their biggest opportunity (max 15 words)",
  "top_category_insight": {
    "category": "<category name>",
    "co2_kg": <number>,
    "pct_of_total": <number>,
    "finding": "<One sentence explaining why this is their top emission source>",
    "three_actions": [
      {
        "action": "<specific actionable recommendation>",
        "estimated_reduction_pct": <number between 5 and 60>,
        "effort": "Low",
        "local_context": "<Singapore-specific or Asia-Pacific-specific tip where possible>"
      },
      {
        "action": "<specific actionable recommendation>",
        "estimated_reduction_pct": <number between 5 and 60>,
        "effort": "Medium",
        "local_context": "<Singapore-specific or Asia-Pacific-specific tip where possible>"
      },
      {
        "action": "<specific actionable recommendation>",
        "estimated_reduction_pct": <number between 5 and 60>,
        "effort": "High",
        "local_context": "<Singapore-specific or Asia-Pacific-specific tip where possible>"
      }
    ]
  },
  "quick_wins": [
    {
      "category": "<category>",
      "tip": "<one specific quick-win tip>",
      "estimated_co2_saving_kg": <number>
    },
    {
      "category": "<category>",
      "tip": "<one specific quick-win tip>",
      "estimated_co2_saving_kg": <number>
    },
    {
      "category": "<category>",
      "tip": "<one specific quick-win tip>",
      "estimated_co2_saving_kg": <number>
    }
  ],
  "benchmark_note": "<One sentence comparing their carbon intensity to industry average for their sector>"
}
`;

    // Call Anthropic API
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const rawContent = message.content[0];
    if (rawContent.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response format', code: 500 }, { status: 500 });
    }

    let insightJson;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonText = rawContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      insightJson = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON', code: 500 }, { status: 500 });
    }

    // Save to ai_insights table
    const topCategory = sortedCategories[0]?.category || '';
    const { data: savedInsight, error: saveError } = await supabaseAdmin
      .from('ai_insights')
      .insert({
        user_id: userId,
        top_category: topCategory,
        insight_json: insightJson,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save insight:', saveError);
    }

    return NextResponse.json({
      success: true,
      insight: insightJson,
      id: savedInsight?.id,
      generated_at: savedInsight?.generated_at || new Date().toISOString(),
    });
  } catch (err) {
    console.error('Insights generation error:', err);
    return NextResponse.json({ error: 'Failed to generate insights', code: 500 }, { status: 500 });
  }
}
