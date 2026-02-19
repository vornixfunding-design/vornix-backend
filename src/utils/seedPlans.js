import { randomUUID } from 'crypto';
import supabase from '../config/supabase.js';

const PLAN_MODELS = [
  {
    model: '3-Step',
    targets: [8, 6, 4],
    consistency_limit_percent: 40,
  },
  {
    model: '2-Step',
    targets: [8, 5],
    consistency_limit_percent: 25,
  },
  {
    model: '1-Step',
    targets: [10],
    consistency_limit_percent: 15,
  },
];

const ACCOUNT_SIZES = [5000, 10000, 15000, 25000, 50000, 100000, 200000, 300000];

const getProfitSplit = (accountSize) => {
  if (accountSize === 100000) return 95;
  if (accountSize >= 50000 && accountSize < 100000) return 92;
  return 90;
};

const buildPlans = () =>
  PLAN_MODELS.flatMap(({ model, targets, consistency_limit_percent }) =>
    ACCOUNT_SIZES.map((account_size) => ({
      id: randomUUID(),
      model,
      account_size,
      targets,
      consistency_limit_percent,
      profit_split: getProfitSplit(account_size),
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
