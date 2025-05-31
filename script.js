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
    const res = await fetch("base-datos.csv");
    const csv = await res.text();
    const datos = parseCSV(csv);

    let respuestaEncontrada = null;

    for (const entrada of datos) {
      if (entrada.keywords.some(k => pregunta.includes(k) || k.includes(pregunta))) {
        respuestaEncontrada = entrada.respuesta;
        break;
      }
    }

    respuestaDiv.innerText = respuestaEncontrada ||
      "❌ No tengo datos suficientes para responder con seguridad. Intenta reformular tu pregunta.";

  } catch (error) {
    respuestaDiv.innerText = "⚠️ Error al cargar la base de datos. Verifica tu conexión o URL del CSV.";
    console.error("Error al consultar la base:", error);
  }
}
