exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { firstName, lastName, email, phone, company, interest } = data;

  if (!email || !firstName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name and email are required" })
    };
  }

  const apiKey = process.env.FC_Website_API_Key;

  // Normalise a UK phone (07…) to E.164 (+447…) for Brevo's WHATSAPP field.
  // Any other input is returned as-is if it already looks E.164, otherwise dropped.
  function toE164(raw) {
    if (!raw) return null;
    const digits = String(raw).replace(/[\s()\-]/g, "");
    if (/^\+\d{7,15}$/.test(digits)) return digits;
    if (/^07\d{9}$/.test(digits))    return "+44" + digits.slice(1);
    if (/^447\d{9}$/.test(digits))   return "+" + digits;
    return null;
  }

  // Brevo attributes: only send the standard ones we KNOW exist by default.
  // COMPANY / INTEREST are custom attributes that may or may not be
  // configured on the account — sending them when they're not defined
  // causes Brevo to 400 the entire request and drop the subscription.
  // We still capture COMPANY / INTEREST — see the notification email below.
  const attributes = {
    FIRSTNAME: firstName,
    LASTNAME:  lastName || ""
  };

  const whatsapp = toE164(phone);
  if (whatsapp) attributes.WHATSAPP = whatsapp;

  // ── STEP 1: Add contact to Brevo list 5 (soft-fail like contact.js) ──
  let brevoStatus = "skipped";
  let brevoError  = null;
  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Accept":       "application/json",
        "Content-Type": "application/json",
        "api-key":      apiKey
      },
      body: JSON.stringify({
        email:         email,
        attributes:    attributes,
        listIds:       [5],
        updateEnabled: true
      })
    });
    if (response.status === 201 || response.status === 204) {
      brevoStatus = "ok";
    } else {
      brevoStatus = "error";
      brevoError  = await response.json().catch(() => ({ status: response.status }));
      console.error("Brevo subscribe error:", response.status, JSON.stringify(brevoError));
    }
  } catch(err) {
    brevoStatus = "error";
    brevoError  = { message: String(err && err.message || err) };
    console.error("Brevo subscribe threw:", err);
  }

  // ── STEP 2: Notify the FC team by email (hard-fail if this fails) ──
  // Mirrors the contact.js pattern so the sign-up + interest always reaches
  // hello@first-connections.co.uk even if the Brevo add failed.
  const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "api-key":      apiKey
    },
    body: JSON.stringify({
      sender: {
        name:  "First Connections Website",
        email: "hello@first-connections.co.uk"
      },
      to: [
        {
          email: "hello@first-connections.co.uk",
          name:  "First Connections"
        }
      ],
      replyTo: {
        email: email,
        name:  `${firstName} ${lastName || ""}`.trim()
      },
      subject: `Newsletter sign-up — ${firstName} ${lastName || ""}`.trim(),
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f7f8fc;border-radius:12px;">
          <div style="background:#1f3667;padding:24px 32px;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:1.3rem;">New Newsletter Sign-up</h2>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e2e6f0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;width:140px;"><strong style="color:#5a6478;font-size:0.85rem;">Name</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">${firstName} ${lastName || ""}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;"><strong style="color:#5a6478;font-size:0.85rem;">Email</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;"><a href="mailto:${email}" style="color:#2845A0;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;"><strong style="color:#5a6478;font-size:0.85rem;">Phone</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">${phone || "Not provided"}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;"><strong style="color:#5a6478;font-size:0.85rem;">Company</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">${company || "Not provided"}</td></tr>
              <tr><td style="padding:10px 0;"><strong style="color:#5a6478;font-size:0.85rem;">Interest</strong></td><td style="padding:10px 0;color:#1a1a2e;">${interest || "Not specified"}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#f7f8fc;border-radius:8px;border-left:4px solid #ECB344;">
              <p style="margin:0;font-size:0.85rem;color:#5a6478;">
                Brevo list add: <strong>${brevoStatus}</strong>${brevoError ? " — " + JSON.stringify(brevoError) : ""}
              </p>
            </div>
          </div>
        </div>
      `
    })
  });

  if (emailResponse.status === 201 || emailResponse.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, brevoStatus: brevoStatus })
    };
  }

  const errorBody = await emailResponse.json().catch(() => ({}));
  console.error("Newsletter notification email error:", emailResponse.status, JSON.stringify(errorBody));
  return {
    statusCode: emailResponse.status,
    body: JSON.stringify({ error: errorBody, brevoStatus: brevoStatus, brevoError: brevoError })
  };
};
