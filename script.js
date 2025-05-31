async function buscarRespuesta() {
  const pregunta = document.getElementById("pregunta").value.toLowerCase();
  const respuestaDiv = document.getElementById("respuesta");

  const res = await fetch("base-datos.json");
  const datos = await res.json();

  let respuestaEncontrada = null;

  for (const entrada of datos) {
    if (entrada.keywords.some(k => pregunta.includes(k.toLowerCase()))) {
      respuestaEncontrada = entrada.respuesta;
      break;
    }
  }

  respuestaDiv.innerText = respuestaEncontrada ||
    "❌ No tengo datos suficientes para responder con seguridad. Intenta reformular tu pregunta.";
}
