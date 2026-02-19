import supabase from '../config/supabase.js';

export const getAllPlans = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('model_type', { ascending: true })
      .order('account_size', { ascending: true });

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch plans.',
        details: error.message
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error.',
      details: error.message
    });
  }
};
