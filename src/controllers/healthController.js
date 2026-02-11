import { healthStatus } from '../services/healthService.js';

export const getHealth = (_req, res) => {
  res.status(200).json(healthStatus());
};
