import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.trim(), // Trim any whitespace from API key
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    // For SendGrid, use the configured FROM_EMAIL or fallback to SMTP_USER
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@ecommerce.com';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[EMAIL CONFIG]', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: fromEmail,
        to: options.to,
      });
    }
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log('[EMAIL] Successfully sent to:', options.to, 'Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[EMAIL ERROR]', {
      message: error.message,
      code: error.code,
      response: error.response,
      to: options.to,
    });
    
    // In development mode with SendGrid, log the issue
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Troubleshooting:');
      console.log('  1. Verify sender email in SendGrid: https://app.sendgrid.com/settings/sender_auth/senders');
      console.log('  2. Check API key is valid: SG.xxx');
      console.log('  3. Ensure FROM_EMAIL env var matches verified sender');
    }
    
    return { success: false, error };
  }
}

export function generateOTPEmail(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your E-Commerce Login Code</h2>
      <p>Use this code to sign in to your account. This code expires in 5 minutes.</p>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; font-size: 12px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
}

export function generateOrderConfirmationEmail(orderData: any): string {
  const total = (orderData.amount / 100).toFixed(2);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase!</p>
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${orderData.id}</p>
        <p><strong>Amount:</strong> ₹${total}</p>
        <p><strong>Status:</strong> ${orderData.status}</p>
        <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
      </div>
      <p style="color: #666; font-size: 12px;">
        You will receive shipping updates via email.
      </p>
    </div>
  `;
}
