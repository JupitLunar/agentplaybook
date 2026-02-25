/**
 * Zod validation schemas
 */

import { z } from 'zod';

export const RegionSchema = z.object({
  province: z.string().min(1).max(8),
  city: z.string().min(1).max(64).optional(),
  neighborhood: z.string().min(1).max(64).optional()
});

export const VerticalSchema = z.enum(['wellness', 'travel', 'clinic', 'playground', 'industrial']);

export const SearchQuerySchema = z.object({
  vertical: VerticalSchema,
  q: z.string().max(200).optional(),
  region: RegionSchema,
  tags: z.array(z.string()).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export const LeadCreateSchema = z.object({
  action: z.enum(['lead_get_matched', 'lead_request_shortlist', 'lead_contact_business']),
  vertical: VerticalSchema,
  region: RegionSchema,
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().optional(),
  placeIds: z.array(z.string()).optional(),
  message: z.string().optional(),
  requirements: z.string().optional()
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type LeadCreate = z.infer<typeof LeadCreateSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type Vertical = z.infer<typeof VerticalSchema>;
