import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateCO2 } from '@/lib/carbonCoefficients';

const MOCK_STRIPE_TRANSACTIONS = [
  { date: '2025-04-02', description: 'Scoot Airlines TR801', category: 'air_travel', amount_usd: 650.00 },
  { date: '2025-04-05', description: 'Google Cloud Platform', category: 'it_cloud', amount_usd: 420.00 },
  { date: '2025-04-08', description: 'Ninja Van Delivery', category: 'road_freight', amount_usd: 380.00 },
  { date: '2025-04-10', description: 'Cold Storage Groceries', category: 'local_groceries', amount_usd: 185.00 },
  { date: '2025-04-14', description: 'Tenaga Nasional Electricity', category: 'energy_utilities', amount_usd: 520.00 },
  { date: '2025-04-18', description: 'Lazada Office Supplies', category: 'retail_ecommerce', amount_usd: 290.00 },
  { date: '2025-04-22', description: 'Deloitte Consulting Fee', category: 'professional_svcs', amount_usd: 3200.00 },
  { date: '2025-04-25', description: 'Maersk Sea Freight', category: 'sea_freight', amount_usd: 1800.00 },
  { date: '2025-04-28', description: 'Kopitiam Catering', category: 'food_hospitality', amount_usd: 340.00 },
  { date: '2025-04-30', description: 'Foxconn Manufacturing', category: 'manufacturing', amount_usd: 5600.00 },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 });
    }

    const enriched = MOCK_STRIPE_TRANSACTIONS.map(tx => ({
      user_id: userId,
      date: tx.date,
      description: tx.description,
      category: tx.category,
      amount_usd: tx.amount_usd,
      co2_kg: calculateCO2(tx.category, tx.amount_usd),
      source: 'mock_stripe',
    }));

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
      transactions: MOCK_STRIPE_TRANSACTIONS,
    });
  } catch (err) {
    console.error('Mock Stripe error:', err);
    return NextResponse.json({ error: 'Internal server error', code: 500 }, { status: 500 });
  }
}
