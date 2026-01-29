const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send notification email
exports.sendNotification = async (subject, message) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  Email not configured. Skipping email notification.');
      console.log(`📧 Would send: ${subject}`);
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"Project Management System" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${message}
          </div>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from the Project Management System.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send project notification
exports.sendProjectNotification = async (projectName, action) => {
  const subject = `Project ${action}: ${projectName}`;
  const message = `
    <p><strong>Project Name:</strong> ${projectName}</p>
    <p><strong>Action:</strong> ${action}</p>
    <p>A project has been ${action.toLowerCase()} in the system.</p>
  `;
  return await this.sendNotification(subject, message);
};

// Send theme notification
exports.sendThemeNotification = async (themeName, projectName, action) => {
  const subject = `Theme ${action}: ${themeName}`;
  const message = `
    <p><strong>Theme Name:</strong> ${themeName}</p>
    <p><strong>Project:</strong> ${projectName}</p>
    <p><strong>Action:</strong> ${action}</p>
    <p>A theme has been ${action.toLowerCase()} in the system.</p>
  `;
  return await this.sendNotification(subject, message);
};

