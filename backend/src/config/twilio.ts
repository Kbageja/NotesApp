import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: to
    });
    return true;
  } catch (error) {
    console.error('Twilio SMS Error:', error);
    return false;
  }
};

export default client;