'use server'

import { ContactFormInput } from '@/src/lib/validations/auth'
import nodemailer from 'nodemailer'

export async function sendContactEmail(data: ContactFormInput) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address from environment variable
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  })

  const mailOptions = {
    from: `${data.firstName} <${data.email}>`, // Sender name and address
    to: 'dgorbachev06@gmail.com', // Recipient email address
    subject: 'Bazookanator Message', // Email subject
    text: `Name: ${data.firstName}\nEmail: ${data.email}\nMessage: ${data.message}`, // Email body
  }

  try {
    await transporter.sendMail(mailOptions)
    return {
      success: true,
      message: 'Your message has been sent to Bazookanator Headquarters',
    }
  } catch {
    return { success: false, message: 'Snafu, please try again later' }
  }
}
