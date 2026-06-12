import nodemailer from 'nodemailer';

export async function sendPriceAlert(userEmail, productTitle, currentPrice, targetPrice, productUrl) {
  const senderEmail = process.env.ALERT_EMAIL_USER;
  const senderPassword = process.env.ALERT_EMAIL_PASS;

  if (!senderEmail || !senderPassword) {
    console.log("Email dispatch skipped: Missing ALERT_EMAIL_USER or ALERT_EMAIL_PASS credentials in environment.");
    return false;
  }

  // Create transporter (Gmail SMTP by default)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  const mailOptions = {
    from: `"Zenith Price Monitor" <${senderEmail}>`,
    to: userEmail,
    subject: `📉 Price Drop Alert: ${productTitle}!`,
    text: `The price for '${productTitle}' has dropped to $${currentPrice.toFixed(2)}, beating your threshold of $${targetPrice.toFixed(2)}.\n\nLink to product: ${productUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ef4444; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-top: 0;">📉 Price Drop Alert!</h2>
        <p>Good news! A product you are tracking has dropped in price.</p>
        <div style="background-color: #f9fafb; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; font-size: 1.1em; color: #111827;">${productTitle}</h3>
          <p style="margin: 5px 0;"><strong>Current Price:</strong> <span style="color: #10b981; font-size: 1.25em; font-weight: bold;">$${currentPrice.toFixed(2)}</span></p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Target Threshold:</strong> $${targetPrice.toFixed(2)}</p>
        </div>
        <p style="margin-top: 25px;"><a href="${productUrl}" target="_blank" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Product Link</a></p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;" />
        <p style="font-size: 0.8em; color: #9ca3af; text-align: center; margin: 0;">You received this email because you set a price alert on Zenith Price Monitor.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Alert email successfully sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`SMTP transmission failed: ${error.message}`);
    return false;
  }
}
