import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_PROMPT = (description) => `Eres un experto diseñador y desarrollador web.
Tu ÚNICA tarea es generar el código completo de una landing page en un único archivo HTML autocontenido.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con el código HTML. Sin explicaciones, sin markdown, sin bloques de código.
- El CSS debe estar en una etiqueta <style> dentro del <head>.
- El diseño debe ser responsive (mobile-first).
- Usa solo colores, tipografías y layouts que reflejen el estilo solicitado.
- Incluye secciones: Hero, Servicios/Características, Sobre nosotros y Contacto/CTA.
- Usa fuentes de Google Fonts via CDN si el estilo lo requiere.

Descripción del negocio: "${description}"
`;

const STYLES = [
  {
    name: "Minimalista",
    instruction: `Estilo: MINIMALISTA.
- Paleta: blanco, negro, grises y UN solo color de acento frío (ej: #3B82F6).
- Tipografía sans-serif limpia (ej: Inter o DM Sans de Google Fonts).
- Mucho espacio en blanco, márgenes generosos.
- Sin sombras excesivas, sin gradientes llamativos.
- Líneas finas como separadores, íconos simples (puedes usar caracteres Unicode o SVG inline simples).`,
  },
  {
    name: "Corporativo",
    instruction: `Estilo: PROFESIONAL Y CORPORATIVO.
- Paleta: azul oscuro (#1E3A5F), gris (#4A5568), blanco y un acento dorado o azul cielo.
- Tipografía robusta y legible (ej: Roboto o Source Sans 3 de Google Fonts).
- Layout claro, grids ordenados, header con logo y navegación.
- Sección de estadísticas o logros (badges con números grandes).
- Footer completo con enlaces y datos de contacto.`,
  },
  {
    name: "Creativo",
    instruction: `Estilo: CREATIVO Y MODERNO.
- Paleta vibrante con gradientes atrevidos (ej: morado → fucsia, o azul eléctrico → verde lima).
- Tipografía llamativa para títulos (ej: Playfair Display o Space Grotesk de Google Fonts).
- Layout asimétrico o con formas orgánicas (blobs, diagonales, curvas en secciones).
- Animaciones CSS suaves en hover (transiciones de color, escala, traslación).
- Hero con fondo de gradiente animado o patrón geométrico CSS puro.`,
  },
];

async function generateLandingPage(description, style) {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: BASE_PROMPT(description) + "\n\n" + style.instruction,
      },
    ],
  });

  const rawHtml = message.content[0].type === "text" ? message.content[0].text : "";
  // Limpiar cualquier bloque de markdown si el modelo los incluye
  return rawHtml.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res
        .status(400)
        .json({ error: 'El campo "description" es obligatorio.' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("La variable de entorno ANTHROPIC_API_KEY no está configurada.");
    }

    // Generar las 3 versiones en paralelo
    const [minimalista, corporativo, creativo] = await Promise.all(
      STYLES.map((style) => generateLandingPage(description, style))
    );

    const images = [minimalista, corporativo, creativo];
    const designs = STYLES.map((style, i) => ({ style: style.name, html: images[i] }));

    return res.status(200).json({ images, designs });

  } catch (error) {
    console.error("Error al generar las páginas:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: "API Key de Anthropic inválida o no configurada." });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Límite de uso de la API alcanzado. Intenta en unos segundos." });
    }

    return res.status(500).json({
      error: "Error al generar los diseños.",
      details: error.message,
    });
  }
}
