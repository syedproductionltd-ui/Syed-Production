const nodemailer = require('nodemailer');
const SiteSettings = require('../models/SiteSettings');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    // Verify SMTP connection on first use
    transporter.verify().then(() => {
      console.log('SMTP connection verified successfully');
    }).catch(err => {
      console.error('SMTP connection failed:', err.message);
    });
  }
  return transporter;
}

async function sendWelcomeEmail(email) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B2618,#2D6A4F);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;font-size:28px;color:#D4A03C;letter-spacing:1px;">Syed Productions</h1>
            <p style="margin:8px 0 0;color:#a0c4b0;font-size:14px;">Professional Film &amp; Media Production</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Welcome to the Family!</h2>
            <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.6;">
              Thank you for subscribing to <strong>Syed Productions</strong>. You'll now receive exclusive updates on our latest projects, behind-the-scenes content, special production packages, and creative insights.
            </p>

            <!-- Offer Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td style="background:linear-gradient(135deg,#0B2618,#2D6A4F);border-radius:10px;padding:28px 24px;text-align:center;">
                  <p style="margin:0 0 8px;color:#a0c4b0;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Special Offer</p>
                  <h3 style="margin:0 0 8px;color:#D4A03C;font-size:26px;">15% OFF Your First Booking</h3>
                  <p style="margin:0 0 16px;color:#ffffff;font-size:14px;">Use code at checkout:</p>
                  <div style="display:inline-block;background:#D4A03C;color:#0B2618;font-size:22px;font-weight:bold;padding:10px 28px;border-radius:6px;letter-spacing:3px;">WELCOME15</div>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6;">
              Ready to bring your vision to life? Explore our services and book your first production today.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://syedproductions.com/#booking" style="display:inline-block;background:#D4A03C;color:#0B2618;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:8px;">Book a Service</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:24px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#999;font-size:12px;">Syed Productions &bull; Professional Film &amp; Media Production</p>
            <p style="margin:8px 0 0;color:#bbb;font-size:11px;">You received this because you subscribed to our newsletter.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to Syed Productions!

Thank you for subscribing. You'll now receive exclusive updates, behind-the-scenes content, and special production packages.

SPECIAL OFFER: 15% OFF your first booking!
Use code: WELCOME15

Book now: https://syedproductions.com/#booking

- Syed Productions Team`;

  await getTransporter().sendMail({
    from,
    to: email,
    subject: 'Welcome to Syed Productions! Here\'s 15% Off Your First Booking',
    html,
    text
  });
}

async function sendAdminNotification(email) {
  let adminEmail;
  try {
    const settings = await SiteSettings.getSettings();
    adminEmail = settings.contact?.email;
  } catch (err) {
    // DB not available — fall through to SMTP_USER
  }
  adminEmail = adminEmail || process.env.SMTP_USER;
  if (!adminEmail) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:500px;">
        <tr>
          <td style="background:#0B2618;padding:20px 24px;">
            <h2 style="margin:0;color:#D4A03C;font-size:18px;">New Newsletter Subscriber</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:#333;">
              <tr>
                <td style="color:#888;width:100px;">Email:</td>
                <td style="font-weight:bold;">${email}</td>
              </tr>
              <tr>
                <td style="color:#888;">Time:</td>
                <td>${timestamp}</td>
              </tr>
            </table>
            <div style="margin-top:20px;text-align:center;">
              <a href="https://syedproductions.com/admin/subscribers" style="display:inline-block;background:#2D6A4F;color:#fff;font-size:13px;text-decoration:none;padding:10px 24px;border-radius:6px;">View in Admin Panel</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `New Newsletter Subscriber\n\nEmail: ${email}\nTime: ${timestamp}\n\nView in admin panel: https://syedproductions.com/admin/subscribers`;

  await getTransporter().sendMail({
    from,
    to: adminEmail,
    subject: `New Subscriber: ${email}`,
    html,
    text
  });
}

module.exports = { sendWelcomeEmail, sendAdminNotification };
