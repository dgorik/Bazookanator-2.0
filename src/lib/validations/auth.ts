import { z } from 'zod'

const COMPANY_DOMAIN = '@bazooka-inc.com'

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
// .refine((data) => data.email.endsWith(COMPANY_DOMAIN), {
//   message: `Email must end with ${COMPANY_DOMAIN}`,
//   path: ['email'],
// })

export const signupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Please enter a valid email'),
    password: z.string().min(6, 'Password of minimum 6 characters is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  })
  .refine((data) => data.email.endsWith(COMPANY_DOMAIN), {
    message: `Email must end with ${COMPANY_DOMAIN}`,
    path: ['email'],
  })

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  raw_user_meta_data: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
    })
    .optional(),
})

export const contactFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(2, 'Please enter your message'),
})

export type User = z.infer<typeof userSchema>
export type LoginCredentials = z.infer<typeof loginSchema>
export type SignupCredentials = z.infer<typeof signupSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
