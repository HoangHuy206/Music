import nodemailer from 'nodemailer';
import SupportTicket from '../models/SupportTicket.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hhuy85895@gmail.com';

/**
 * Configure email transporter
 */
function createTransporter() {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass, // Google App Password (16 characters without spaces)
    },
    family: 4, // Force IPv4 to prevent ENETUNREACH IPv6 routing errors on Render/cloud hosts
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Asynchronously send support notification email in background
 */
async function sendSupportEmailInBackground(ticket, name, email, topic, message) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Support Ticket]: Saved to DB (Email credentials not configured).');
    return;
  }

  const adminMailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0d14; color: #ffffff; padding: 30px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(0, 242, 254, 0.2);">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(0, 242, 254, 0.15); border: 1px solid #00f2fe; color: #00f2fe; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
          🎵 AURAMUSIC USER SUPPORT
        </div>
        <h2 style="color: #ffffff; margin-top: 15px; font-size: 22px; font-weight: 800;">
          Yêu Cầu Hỗ Trợ Mới Từ Người Dùng
        </h2>
      </div>

      <div style="background-color: rgba(255, 255, 255, 0.04); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; width: 140px; font-weight: 600;">Họ và Tên:</td>
            <td style="padding: 8px 0; color: #00f2fe; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Email Người Gửi:</td>
            <td style="padding: 8px 0; color: #ffffff;">
              <a href="mailto:${email}" style="color: #4facfe; text-decoration: none; font-weight: 600;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Chủ Đề Hỗ Trợ:</td>
            <td style="padding: 8px 0; color: #ff007f; font-weight: bold;">${topic || 'Hỗ trợ chung'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Thời Gian Gửi:</td>
            <td style="padding: 8px 0; color: #cbd5e1;">${new Date().toLocaleString('vi-VN')}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: rgba(14, 18, 30, 0.8); border-left: 4px solid #00f2fe; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
        <h4 style="color: #00f2fe; margin: 0 0 10px 0; font-size: 15px; font-weight: bold;">Nội Dung Yêu Cầu / Phản Hồi:</h4>
        <p style="color: #f1f5f9; line-height: 1.6; margin: 0; font-size: 14px; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="text-align: center; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #64748b;">
        Email được gửi tự động từ hệ thống hỗ trợ <strong>AuraMusic Next-Gen Audio Player</strong>.<br />
        Bấm "Trả lời" để phản hồi trực tiếp tới email <strong>${email}</strong> của người dùng.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"AuraMusic Support" <${process.env.EMAIL_USER || 'no-reply@auramusic.app'}>`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[AuraMusic Support] ${topic || 'Yêu cầu hỗ trợ'} - Từ: ${name}`,
      html: adminMailHtml,
    });
    ticket.emailSent = true;
    await ticket.save();
    console.log(`[Support Ticket]: Email notification successfully sent to ${ADMIN_EMAIL}`);
  } catch (mailErr) {
    console.warn('[Nodemailer Notice]: Support ticket saved to DB, email delivery note:', mailErr.message);
  }
}

/**
 * @desc    Submit a support / feedback ticket and send email to admin Gmail
 * @route   POST /api/support
 * @access  Public
 */
export async function submitSupportTicket(req, res) {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Họ tên, Email và Nội dung cần hỗ trợ.',
      });
    }

    // 1. Save ticket into MongoDB immediately
    const ticket = await SupportTicket.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic ? topic.trim() : 'Hỗ trợ chung',
      message: message.trim(),
    });

    // 2. Respond immediately to the client so UI never freezes or hangs
    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu hỗ trợ thành công! Quản trị viên sẽ phản hồi qua Gmail của bạn sớm nhất ✨',
      data: {
        ticketId: ticket._id,
        createdAt: ticket.createdAt,
      },
    });

    // 3. Trigger background email without delaying HTTP response
    sendSupportEmailInBackground(ticket, name, email, topic, message).catch((err) => {
      console.warn('[Support Background Email Error]:', err.message);
    });
  } catch (err) {
    console.error('[Support Controller Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi máy chủ khi gửi yêu cầu hỗ trợ',
    });
  }
}
