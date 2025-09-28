import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testSMTP = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kinshukbageja@gmail.com',
      pass: 'fgzcykhddocxpjva', // No spaces!
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    const info = await transporter.sendMail({
      from: 'HD Notes <kinshukbageja@gmail.com>',
      to: 'kinshukbageja@gmail.com',
      subject: 'Test Email',
      html: '<h1>Test successful!</h1>'
    });
    
    console.log('✅ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
};

testSMTP();