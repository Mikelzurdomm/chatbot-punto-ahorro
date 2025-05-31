async function extraerKeywordsConGPT(pregunta, listaKeywords) {
  const apiKey = "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"; // ← pon tu clave real de OpenAI aquí

  const prompt = `
Eres un asistente que ayuda a elegir palabras clave.

Tu tarea es seleccionar, de la siguiente lista de palabras clave, las más relevantes para entender esta pregunta:
"${pregunta}"

Palabras clave disponibles:
${listaKeywords.join(", ")}

Devuelve solo las que estén relacionadas, como un array JSON.
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });

  const data = await res.json();
  const contenido = data.choices?.[0]?.message?.content || "[]";

  try {
    return JSON.parse(contenido);
  } catch (err) {
    console.error("Error al parsear la respuesta de GPT:", contenido);
    return [];
  }
}

function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows.shift().split(",");
  return rows.map(row => {
    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // soporta comas dentro de comillas
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.replace(/^"|"$/g, "").trim();
    });
    obj.keywords = obj.keywords ? obj.keywords.split(";").map(k => k.trim().toLowerCase()) : [];
    return obj;
  });
}

async function buscarRespuesta() {
  const pregunta = document.getElementById("pregunta").value.toLowerCase();
  const respuestaDiv = document.getElementById("respuesta");

  try {
    const res = await fetch("base-datos.v2.csv");
    const csv = await res.text();
    const datos = parseCSV(csv);

    // Paso 1: Extraer todas las keywords únicas del CSV
    const allKeywords = [...new Set(
      datos.flatMap(entrada =>
        (entrada.keywords || []).map(k => k.toLowerCase().trim())
      )
    )];

    // Paso 2: Pedir a GPT que seleccione keywords relevantes
    const keywordsGPT = await extraerKeywordsConGPT(pregunta, allKeywords);
    console.log("🔍 GPT seleccionó:", keywordsGPT);

    // Paso 3: Filtrar respuestas que contienen alguna keyword coincidente
    const respuestas = datos.filter(entrada =>
      entrada.keywords.some(k => keywordsGPT.includes(k.toLowerCase()))
    ).map(entrada =>
      `🟢 <strong>${entrada.tema}</strong>: ${entrada.respuesta}`
    );

    // Paso 4: Mostrar resultados
    respuestaDiv.innerHTML = respuestas.length > 0
      ? respuestas.join("<br><br>")
      : "❌ No tengo datos suficientes para responder con seguridad. Intenta reformular tu pregunta.";

  } catch (error) {
    respuestaDiv.innerText = "⚠️ Error al cargar la base de datos o al consultar GPT.";
    console.error("Error:", error);
  }
}
