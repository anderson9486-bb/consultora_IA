const { GoogleGenerativeAI } = require('@google/generative-ai');

// La clave de API se obtiene de las variables de entorno del servidor, nunca del frontend.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- INGENIERÍA DE PROMPTS AVANZADA ---
// Esta función crea un prompt detallado para generar una landing page completa en HTML y CSS.
const createLandingPagePrompt = (description, style) => {
    let styleInstructions = '';
    switch (style) {
        case 'Moderno':
            styleInstructions = 'Usa un diseño limpio, con mucho espacio en blanco, una tipografía sans-serif moderna (como Inter o Manrope), y una paleta de colores primarios brillantes con un color de acento. Incluye una sección de héroe con un titular grande y un botón de llamada a la acción claro.';
            break;
        case 'Elegante':
            styleInstructions = 'Usa un diseño sofisticado con una tipografía serif (como Playfair Display o Lora), colores oscuros o neutros (negro, gris, beige), e imágenes de alta calidad. El diseño debe ser simétrico y ordenado, transmitiendo lujo.';
            break;
        case 'Atrevido':
            styleInstructions = 'Usa un diseño asimétrico, colores vibrantes o degradados, tipografías grandes y audaces (display fonts), y micro-interacciones o animaciones sutiles si es posible con CSS. Debe ser visualmente impactante y memorable.';
            break;
    }

    return `
        Tu tarea es actuar como un experto diseñador y desarrollador web frontend.
        Genera el código HTML y CSS completo para una landing page de un solo archivo (inline CSS en etiquetas <style>) para el siguiente negocio: "${description}".
        
        REQUISITOS ESTRICTOS:
        1.  **Estilo de Diseño**: ${styleInstructions}
        2.  **Sin Archivos Externos**: No uses enlaces a archivos CSS o JS externos. Todo el CSS debe estar dentro de una etiqueta <style> en el <head>.
        3.  **Imágenes**: Usa placeholders de https://placehold.co/ para las imágenes. No uses imágenes de otros sitios.
        4.  **Contenido**: El texto debe estar en español y ser relevante para el negocio descrito.
        5.  **Salida Limpia**: Responde ÚNICAMENTE con el código HTML. No incluyas explicaciones, comentarios, ni la palabra "HTML" o \
```html\
. La respuesta debe empezar directamente con "<!DOCTYPE html>".
    `;
};

// Exportación compatible con Vercel
module.exports = async (req, res) => {
    // Verificar que el método sea POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // El cuerpo de la solicitud ya viene parseado por Vercel
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'La descripción es obligatoria.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Crear tres prompts para tres estilos diferentes
        const prompts = [
            createLandingPagePrompt(description, 'Moderno'),
            createLandingPagePrompt(description, 'Elegante'),
            createLandingPagePrompt(description, 'Atrevido')
        ];

        // Ejecutar las tres generaciones en paralelo
        const generationPromises = prompts.map(prompt => model.generateContent(prompt));
        const results = await Promise.all(generationPromises);

        // Extraer el código HTML de cada resultado
        const designs = results.map(result => {
            if (result.response && typeof result.response.text === 'function') {
                return result.response.text();
            }
            return '<html><body><p>Error al generar este diseño. Por favor, intente de nuevo.</p></body></html>';
        });

        // Configurar cabeceras y enviar la respuesta exitosa
        res.setHeader('Access-Control-Allow-Origin', '*'); // Considera restringir esto a tu dominio en producción
        return res.status(200).json({ designs });

    } catch (error) {
        // Manejar cualquier error inesperado
        console.error('Error en la función generate-images:', error);
        return res.status(500).json({ error: 'Hubo un problema al generar los diseños.' });
    }
};

