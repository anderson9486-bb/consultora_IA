import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Función de ayuda para limpiar el texto de respuesta de la IA, eliminando los bloques de código markdown.
 * @param {string} rawText - El texto crudo devuelto por el modelo.
 * @returns {string} El código HTML limpio.
 */
const cleanApiResponse = (rawText) => {
  // Elimina ```html al principio y ``` al final, y recorta espacios en blanco.
  return rawText.replace(/```html/g, "").replace(/```/g, "").trim();
};

/**
 * Función de ayuda para generar una versión de la página con un prompt específico.
 * @param {GoogleGenerativeAI} genAI - La instancia del cliente de IA.
 * @param {string} prompt - El prompt específico para la generación.
 * @returns {Promise<string>} Una promesa que se resuelve con el código HTML generado y limpio.
 */
const generatePageVersion = async (genAI, prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawHtml = response.text();
  return cleanApiResponse(rawHtml);
};

/**
 * Manejador de la API de Vercel para generar 3 versiones de una Landing Page.
 */
export default async function handler(req, res) {
  // Configurar cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'La "description" es obligatoria en el cuerpo de la petición.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La variable de entorno GEMINI_API_KEY no está configurada.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // --- Prompts para cada estilo ---
    const basePrompt = `Eres un experto diseñador y desarrollador web. Tu tarea es generar el código completo para una landing page en un único archivo HTML. El CSS debe estar integrado en la etiqueta <style> dentro del <head>. La página debe ser responsive. No incluyas explicaciones, comentarios, ni bloques de markdown, solo el código HTML puro.

La descripción del negocio es: "${description}"

`;

    const prompts = [
      {
        style: "Minimalista",
        prompt: basePrompt + "El estilo de diseño debe ser estrictamente MINIMALISTA. Usa mucho espacio en blanco, una paleta de colores muy limitada (blanco, negro, grises y un único color de acento), tipografía sans-serif limpia y una estructura muy sencilla y directa."
      },
      {
        style: "Corporativo",
        prompt: basePrompt + "El estilo de diseño debe ser PROFESIONAL y CORPORATIVO. Usa una estructura clara y ordenada, una paleta de colores seria (azules, grises, blancos), tipografía legible y un enfoque en la confianza y la profesionalidad. Incluye secciones como 'Servicios', 'Sobre Nosotros' y un 'Contacto' claro."
      },
      {
        style: "Creativo",
        prompt: basePrompt + "El estilo de diseño debe ser CREATIVO y MODERNO. Usa colores vibrantes, tipografías audaces, layouts asimétricos o no convencionales y elementos visuales llamativos. El objetivo es ser memorable y artístico, rompiendo con los esquemas tradicionales."
      }
    ];

    // Ejecutar todas las generaciones en paralelo
    const generationPromises = prompts.map(p => generatePageVersion(genAI, p.prompt));
    
    const generatedHtmls = await Promise.all(generationPromises);

    // Devolver el JSON con los 3 resultados HTML
    return res.status(200).json({ images: generatedHtmls });

  } catch (error) {
    console.error('Error al generar las páginas:', error);
    return res.status(500).json({
      error: 'Ocurrió un error en el servidor al generar las páginas.',
      details: error.message
    });
  }
}
