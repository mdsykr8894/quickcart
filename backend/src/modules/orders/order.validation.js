const { z } = require('zod');

const malaysianStates = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya'
];

// Schema for simulated Checkout transactions.
// Enforced as strict to block unmapped parameters (specifically payment card data).
const checkoutSchema = z.object({
  fullName: z.string({
    required_error: 'Full name is required.'
  })
  .min(2, 'Full name must be at least 2 characters.')
  .max(120, 'Full name cannot exceed 120 characters.'),

  phone: z.string({
    required_error: 'Phone number is required.'
  })
  .regex(/^(?:\+?6?0)(?:1[0-9\-\s]{7,10}|[3-9][0-9\-\s]{7,9})$/, 'Please enter a valid Malaysian phone number.'),

  addressLine1: z.string({
    required_error: 'Address line 1 is required.'
  })
  .min(5, 'Address line 1 must be at least 5 characters.')
  .max(200, 'Address line 1 cannot exceed 200 characters.'),

  addressLine2: z.string()
  .max(200, 'Address line 2 cannot exceed 200 characters.')
  .optional()
  .nullable(),

  city: z.string({
    required_error: 'City is required.'
  })
  .min(2, 'City must be at least 2 characters.')
  .max(100, 'City cannot exceed 100 characters.'),

  state: z.enum(malaysianStates, {
    required_error: 'State is required.',
    error_map: () => ({ message: 'State must be a valid Malaysian state or federal territory.' })
  }),

  postalCode: z.string({
    required_error: 'Postal code is required.'
  })
  .regex(/^[0-9]{5}$/, 'Postcode must be exactly 5 digits.'),

  country: z.string()
    .refine(val => val === 'Malaysia', 'Country must be Malaysia.')
    .default('Malaysia')
    .optional()
})
.strict('Unexpected properties detected. Payment details are not allowed as this is a simulated checkout.')
// Additional security checker ensuring no credit card metadata key leaks in
.refine((data) => {
  const secretKeywords = ['card', 'cvv', 'cvc', 'expiry', 'cc', 'payment', 'credit', 'debit', 'number'];
  const keys = Object.keys(data);
  return !keys.some((key) => secretKeywords.some((keyword) => key.toLowerCase().includes(keyword)));
}, {
  message: 'Payment card details are strictly prohibited. QuickCart employs simulated checkouts only.'
});

// Schema for updating order status. (Admin only)
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], {
    error_map: () => ({ message: 'Status must be one of PENDING, PROCESSING, COMPLETED, or CANCELLED.' })
  })
}).strict('Unexpected properties detected in status update payload.');

module.exports = {
  checkoutSchema,
  updateOrderStatusSchema
};
