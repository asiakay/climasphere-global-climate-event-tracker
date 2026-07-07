import { z } from 'zod';

export const filterSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  cities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type FilterValues = z.infer<typeof filterSchema>;
