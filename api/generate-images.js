const { GoogleGenerativeAI } = require('@google/generative-ai');

// Obtenemos la clave de API de las variables de entorno del servidor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Esta es la función principal que se ejecutará cuando el front-end la llame
exports.handler = async function(event, context) {
    // Solo permitir peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Obtener la descripción del negocio del cuerpo de la petición
        const { description } = JSON.parse(event.body);

        if (!description) {
            return { statusCode: 400, body: 'La descripción no puede estar vacía.' };
        }

        // --- INGENIERÍA DE PROMPTS ---
        const prompts = [
            `Un diseño de página de aterrizaje (landing page) para un sitio web, profesional y moderno. El tema es: "${description}". El diseño debe ser limpio, con una clara llamada a la acción. Mockup de UI/UX, diseño web. Colores primarios: azul y blanco.`,
            `Un diseño de página de inicio (homepage) para un sitio web, minimalista y elegante. El tema es: "${description}". Enfocado en la tipografía y los espacios en blanco. Mockup de diseño web, UI/UX. Colores: tonos pastel suaves.`,
            `Un diseño de landing page vibrante y atractivo para un sitio web. El tema es: "${description}". Usar una paleta de colores audaz y un diseño dinámico. Mockup de diseño web. Estilo: degradados y formas geométricas.`
        ];

        const imagePromises = prompts.map(prompt => {
            const model = genAI.getGenerativeModel({ model: "gemini-pro"});
            return model.generateContent(prompt);
        });

        const results = await Promise.all(imagePromises);
        
        const imageUrls = results.map(result => {
            const response = result.response;
            return response.text(); 
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ images: imageUrls })
        };

    } catch (error) {
        console.error('Error al generar imágenes con Gemini:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Hubo un problema al generar las imágenes.' })
        };
    }
};