// The Veil — Email delivery
// Sends the personalized insight email and tracks who has received what.

function buildVeilEmailHtml({ insight, quote, quoteAuthor }) {
  return `
    <div style="font-family: Georgia, serif; background:#0a0a0a; color:#e0e0e0; padding:3em 2em; max-width:560px; margin:0 auto;">
      <h1 style="font-size:1.4em; font-weight:300; letter-spacing:4px; text-transform:uppercase; color:#a8a8a8; text-align:center; margin-bottom:2.5em;">The Veil Lifts</h1>

      <p style="font-size:1.05em; line-height:1.9; color:#e0e0e0; margin-bottom:2.5em;">
        ${insight}
      </p>

      <div style="border-top:1px solid rgba(160,160,160,0.2); padding-top:2em; text-align:center;">
        <p style="font-size:1.15em; font-style:italic; line-height:1.7; color:#e0e0e0; margin-bottom:0.8em;">
          "${quote}"
        </p>
        <p style="font-size:0.85em; letter-spacing:2px; color:#a8a8a8;">— ${quoteAuthor}</p>
      </div>

      <p style="font-size:0.75em; color:#666; text-align:center; margin-top:3em; letter-spacing:1px;">
        MIRROR — seen, not soothed.
      </p>
    </div>
  `;
}

async function sendVeilEmail(transporter, fromEmail, toEmail, payload) {
  return transporter.sendMail({
    from: `"Mirror" <${fromEmail}>`,
    to: toEmail,
    subject: 'The Veil lifts.',
    html: buildVeilEmailHtml(payload)
  });
}

module.exports = { sendVeilEmail, buildVeilEmailHtml };
