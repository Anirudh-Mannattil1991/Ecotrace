import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateCO2, CARBON_COEFFICIENTS } from '@/lib/carbonCoefficients';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 });
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions provided', code: 400 }, { status: 400 });
    }

    // Validate and enrich transactions
    const enriched = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (!tx.date || !tx.category || !tx.amount_usd) {
        errors.push(`Row ${i + 1}: Missing required fields (date, category, amount_usd)`);
        continue;
      }
      if (!CARBON_COEFFICIENTS[tx.category]) {
        errors.push(`Row ${i + 1}: Invalid category "${tx.category}"`);
        continue;
      }

      enriched.push({
        user_id: userId,
        date: tx.date,
        description: tx.description || '',
        category: tx.category,
        amount_usd: parseFloat(tx.amount_usd),
        co2_kg: calculateCO2(tx.category, parseFloat(tx.amount_usd)),
        source: tx.source || 'csv',
      });
    }

    if (enriched.length === 0) {
      return NextResponse.json({ error: 'No valid transactions to insert', errors, code: 400 }, { status: 400 });
    }

    // Use service role key for server-side insert
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert(enriched)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message, code: 500 }, { status: 500 });
    }

    const totalCO2 = enriched.reduce((sum, tx) => sum + tx.co2_kg, 0);

    return NextResponse.json({
      success: true,
      inserted: data?.length || enriched.length,
      totalCO2Kg: parseFloat(totalCO2.toFixed(4)),
      errors,
    });
  } catch (err) {
    console.error('Bulk insert error:', err);
    return NextResponse.json({ error: 'Internal server error', code: 500 }, { status: 500 });
  }
}
