import { randomUUID } from 'crypto';
import supabase from '../config/supabase.js';

const PLAN_MODELS = [
  {
    model_type: '3-Step',
    targets: [8, 6, 4],
    consistency_limit_percent: 40,
  },
  {
    model_type: '2-Step',
    targets: [8, 5],
    consistency_limit_percent: 25,
  },
  {
    model_type: '1-Step',
    targets: [10],
    consistency_limit_percent: 15,
  },
];

const ACCOUNT_SIZES = [5000, 10000, 15000, 25000, 50000, 100000, 200000, 300000];

const PRICE_BY_ACCOUNT_SIZE = {
  5000: 59,
  10000: 109,
  15000: 149,
  25000: 229,
  50000: 349,
  100000: 559,
  200000: 979,
  300000: 1399,
};

const getProfitSplit = (accountSize) => {
  if (accountSize === 100000) return 95;
  if (accountSize >= 50000 && accountSize < 100000) return 92;
  return 90;
};

const buildPlans = () =>
  PLAN_MODELS.flatMap(({ model_type, targets, consistency_limit_percent }) =>
    ACCOUNT_SIZES.map((account_size) => ({
      id: randomUUID(),
      model_type,
      account_size,
      price: PRICE_BY_ACCOUNT_SIZE[account_size],
      phase_count: targets.length,
      targets,
      consistency_limit_percent,
      profit_split: getProfitSplit(account_size),
      created_at: new Date().toISOString(),
    })),
  );

export async function seedPlans() {
  const { data: existingPlans, error: existingPlansError } = await supabase
    .from('plans')
    .select('id')
    .limit(1);

  if (existingPlansError) {
    console.error('Failed to check existing plans:', existingPlansError);
    return;
  }

  if (existingPlans?.length) {
    console.log('Plans already seeded, skipping.');
    return;
  }

  const plans = buildPlans();

  const { error: insertError } = await supabase.from('plans').insert(plans);

  if (insertError) {
    console.error('Failed to seed plans:', insertError);
    return;
  }

  console.log(`Seeded ${plans.length} plans successfully.`);
}
