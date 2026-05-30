const { z } = require('zod');

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
  'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
  'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
];

// Schema for updating shopper profiles.
const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name cannot be empty.')
    .max(50, 'First name cannot exceed 50 characters.')
    .optional(),

  lastName: z.string()
    .min(1, 'Last name cannot be empty.')
    .max(50, 'Last name cannot exceed 50 characters.')
    .optional(),

  email: z.string()
    .email('Must be a valid email address.')
    .optional(),

  shippingFullName: z.string()
    .min(1, 'Shipping full name cannot be empty.')
    .max(100, 'Shipping full name cannot exceed 100 characters.')
    .optional().nullable(),

  shippingPhone: z.string()
    .regex(/^(\+?6?0[1-9]?[- ]?\d{1,4}[- ]?\d{4,8})$|^0\d{1,2}[- ]?\d{3,4}[- ]?\d{4}$/, 'Invalid Malaysia phone format.')
    .optional().nullable(),

  shippingAddressLine1: z.string()
    .min(1, 'Address line 1 cannot be empty.')
    .max(150, 'Address line 1 cannot exceed 150 characters.')
    .optional().nullable(),

  shippingAddressLine2: z.string()
    .max(150, 'Address line 2 cannot exceed 150 characters.')
    .optional().nullable(),

  shippingCity: z.string()
    .min(1, 'City cannot be empty.')
    .max(100, 'City cannot exceed 100 characters.')
    .optional().nullable(),

  shippingState: z.enum(MALAYSIAN_STATES, {
    errorMap: () => ({ message: 'Invalid Malaysian state or territory.' })
  }).optional().nullable(),

  shippingPostalCode: z.string()
    .regex(/^\d{5}$/, 'Postal code must be exactly 5 digits.')
    .optional().nullable(),

  shippingCountry: z.string()
    .default('Malaysia')
    .optional().nullable()
}).strict('Only standard profile and shipping fields are permitted.');

module.exports = {
  profileUpdateSchema
};
