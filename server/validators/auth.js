const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('Enter a valid email address');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

exports.registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password,
});
exports.loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });
exports.profileSchema = z
  .object({ name: z.string().trim().min(2).max(80), email, profileImage: z.string().max(500) })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');
exports.passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
});
