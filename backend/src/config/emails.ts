import nodemailer from 'nodemailer';

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });
};

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return false;
  }
};

export const sendOTPEmail = async (email: string, otp: string, userName: string): Promise<boolean> => {
  const subject = 'HD Notes - Email Verification Code';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HD Notes - Email Verification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                display: inline-flex;
                align-items: center;
                font-size: 24px;
                font-weight: 600;
                color: #3b82f6;
                margin-bottom: 10px;
            }
            .logo::before {
                content: "⭐";
                margin-right: 8px;
                font-size: 28px;
            }
            .otp-code {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                text-align: center;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                font-family: 'Courier New', monospace;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
            }
            .warning-text {
                color: #92400e;
                font-size: 14px;
                margin: 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .expire-time {
                color: #dc2626;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">HD</div>
                <h1 style="color: #1f2937; margin: 0;">Email Verification</h1>
            </div>
            
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for signing up with HD Notes! Please use the following verification code to complete your registration:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>Important:</strong> This verification code will expire in <span class="expire-time">10 minutes</span>. 
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
            
            <p>Enter this code in the HD Notes app to verify your email address and start creating your notes.</p>
            
            <p>Best regards,<br>The HD Notes Team</p>
            
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} HD Notes. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

// Test email function for debugging
export const sendTestEmail = async (): Promise<boolean> => {
  const testHTML = `
    <h1>Test Email</h1>
    <p>This is a test email to verify SMTP configuration.</p>
    <p>Time: ${new Date().toISOString()}</p>
  `;
  
  return await sendEmail(
    process.env.EMAIL_USER!,
    'HD Notes - Test Email',
    testHTML
  );
};

export default { sendEmail, sendOTPEmail, sendTestEmail };