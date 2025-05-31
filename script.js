function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows.shift().split(",");
  return rows.map(row => {
    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // para manejar comas dentro de comillas
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.replace(/^"|"$/g, "").trim();
    });
    obj.keywords = obj.keywords.split(";").map(k => k.trim().toLowerCase());
    return obj;
  });
}

async function buscarRespuesta() {
  const pregunta = document.getElementById("pregunta").value.toLowerCase();
  const respuestaDiv = document.getElementById("respuesta");

  const res = await fetch("https://docs.google.com/spreadsheets/d/195aasL8eNEOQusiWZz9HK8Ab4zKkuAze7M0_Agh2bz4/edit?gid=0#gid=0");
  const csv = await res.text();
  const datos = parseCSV(csv);

  let respuestaEncontrada = null;

  for (const entrada of datos) {
    if (entrada.keywords.some(k => pregunta.includes(k))) {
      respuestaEncontrada = entrada.respuesta;
      break;
    }
  }

  respuestaDiv.innerText = respuestaEncontrada ||
    "❌ No tengo datos suficientes para responder con seguridad. Intenta reformular tu pregunta.";
}
