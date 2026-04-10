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
    return { statusCode: 400, body: JSON.stringify({ error: "Name and email are required" }) };
  }
 
  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.FC_Website_API_Key
    },
    body: JSON.stringify({
      email: email,
      attributes: {
        FIRSTNAME:  firstName  || "",
        LASTNAME:   lastName   || "",
        SMS:        phone      || "",
        COMPANY:    company    || "",
        INTEREST:   interest   || ""
      },
      listIds: [5],        // ← Replace 2 with your actual Brevo list ID
      updateEnabled: true  // Updates contact if email already exists
    })
  });
 
  if (response.ok || response.status === 204) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    const errorBody = await response.json().catch(() => ({}));
    console.error("Brevo API error:", errorBody);
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: errorBody })
    };
  }
};
