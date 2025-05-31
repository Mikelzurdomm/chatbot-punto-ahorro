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

  const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSb2M2TyIoVqTLvUin4ofWRhL9jf7Shf2Set3KFxktHeYwwUM0B1F7ylO0D7-Yn63ZjEld2FXDlGi6Z/pubhtml");
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
