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
 
  // Build attributes — only include non-empty values
  const attributes = {
    FIRSTNAME: firstName || "",
    LASTNAME:  lastName  || "",
    COMPANY:   company   || "",
    INTEREST:  interest  || ""
  };
 
  // Only add phone if provided and skip SMS (strict format in Brevo)
  if (phone && phone.trim() !== "") {
    attributes.WHATSAPP = phone.trim();
  }
 
  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "api-key":      process.env.FC_Website_API_Key
    },
    body: JSON.stringify({
      email:         email,
      attributes:    attributes,
      listIds:       [5],
      updateEnabled: true
    })
  });
 
  // 201 = created, 204 = updated (no content)
  if (response.status === 201 || response.status === 204) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    const errorBody = await response.json().catch(() => ({}));
    console.error("Brevo API error:", JSON.stringify(errorBody));
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: errorBody })
    };
  }
};
