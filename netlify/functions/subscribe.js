exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);
  const { firstName, lastName, email, interest } = data;

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
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        INTEREST: interest || ""
      },
      listIds: [5],
      updateEnabled: true
    })
  });

  if (response.ok || response.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } else {
    const error = await response.json();
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};
