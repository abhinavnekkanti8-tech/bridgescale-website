"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationReceivedEmail = applicationReceivedEmail;
exports.statusUpdateEmail = statusUpdateEmail;
const BRAND_GRADIENT = 'linear-gradient(135deg, #f59e0b, #a855f7)';
const FOOTER_TEXT = '© BridgeSales — Fractional diaspora talent for India\'s startups & MSMEs.';
function baseLayout(title, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#08090d;font-family:'Inter',Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08090d;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#0f1117;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background:${BRAND_GRADIENT};">
              <div style="font-size:22px;font-weight:800;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;">◆ BridgeSales</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#475569;text-align:center;">
              ${FOOTER_TEXT}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function applicationReceivedEmail(data) {
    const isCompany = data.type === 'COMPANY';
    const typeLabel = isCompany ? 'Company' : 'Talent';
    const fee = isCompany ? '$200' : '$50';
    const body = `
    <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;font-family:'Plus Jakarta Sans',sans-serif;">
      Application received, ${data.name}!
    </h1>
    <p style="font-size:15px;line-height:1.7;color:#94a3b8;margin:0 0 24px;">
      Thank you for applying to BridgeSales as a <strong style="color:#f1f5f9;">${typeLabel}</strong>. 
      We review every application personally — you'll hear from us within <strong style="color:#f1f5f9;">3–5 business days</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#475569;width:140px;">Application ID</td>
        <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:600;font-family:monospace;color:#f59e0b;">${data.applicationId}</td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#475569;">Type</td>
        <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#f1f5f9;">${typeLabel} Application</td>
      </tr>
      <tr>
        <td style="padding:16px 20px;font-size:13px;color:#475569;">Application Fee</td>
        <td style="padding:16px 20px;font-size:14px;color:#f1f5f9;">${fee} (one-time)</td>
      </tr>
    </table>
    <p style="font-size:14px;line-height:1.7;color:#94a3b8;margin:0;">
      <strong style="color:#f1f5f9;">What happens next?</strong><br/>
      Our team will review your application and reach out via email. If you have questions in the meantime, reply to this email.
    </p>`;
    return {
        subject: `BridgeSales — Your ${typeLabel.toLowerCase()} application has been received`,
        html: baseLayout(`Application Received — BridgeSales`, body),
    };
}
const STATUS_LABELS = {
    UNDER_REVIEW: {
        label: 'Under Review',
        color: '#f59e0b',
        message: 'Your application is now being reviewed by our team. We\'ll be in touch with next steps shortly.',
    },
    APPROVED: {
        label: 'Approved',
        color: '#22c55e',
        message: 'Congratulations! Your application has been approved. We\'ll send you onboarding details and next steps in a separate email.',
    },
    REJECTED: {
        label: 'Not Accepted',
        color: '#ef4444',
        message: 'After careful review, we\'re unable to accept your application at this time. This may be due to current capacity or fit. You\'re welcome to reapply in the future.',
    },
};
function statusUpdateEmail(data) {
    const info = STATUS_LABELS[data.newStatus] ?? {
        label: data.newStatus.replace(/_/g, ' '),
        color: '#94a3b8',
        message: 'Your application status has been updated.',
    };
    const body = `
    <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;font-family:'Plus Jakarta Sans',sans-serif;">
      Application status update
    </h1>
    <p style="font-size:15px;line-height:1.7;color:#94a3b8;margin:0 0 24px;">
      Hi ${data.name}, your BridgeSales application status has been updated:
    </p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin-bottom:8px;">Current Status</div>
      <div style="font-size:28px;font-weight:800;color:${info.color};font-family:'Plus Jakarta Sans',sans-serif;">${info.label}</div>
      <div style="font-size:12px;color:#475569;margin-top:8px;font-family:monospace;">Ref: ${data.applicationId}</div>
    </div>
    <p style="font-size:14px;line-height:1.7;color:#94a3b8;margin:0;">
      ${info.message}
    </p>`;
    return {
        subject: `BridgeSales — Your application is now: ${info.label}`,
        html: baseLayout(`Application Status Updated — BridgeSales`, body),
    };
}
//# sourceMappingURL=templates.js.map