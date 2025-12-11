(function() {
    const langInfo = {
        es: { flag: "https://flagcdn.com/es.svg", name: "Español" },
        en: { flag: "https://flagcdn.com/us.svg", name: "English" },
        pt: { flag: "https://flagcdn.com/br.svg", name: "Português" }
    };

    // Función para configurar el botón de idioma
    function setupLanguageButton(lang) {
        const langDropdownFlag = document.getElementById('langDropdownFlag');
        const langDropdownText = document.getElementById('langDropdownText');
        
        if (langInfo[lang] && langDropdownFlag && langDropdownText) {
            langDropdownFlag.src = langInfo[lang].flag;
            langDropdownFlag.alt = langInfo[lang].name;
            langDropdownText.textContent = langInfo[lang].name;
        }
    }

    // Función para cambiar idioma
    function setLanguage(lang) {
        if (!window.translations || !window.translations[lang]) {
            console.error('Translations not available for language:', lang);
            return;
        }

        document.documentElement.lang = lang;
        
        // Traducir elementos
        const elementsToTranslate = document.querySelectorAll('[data-key]');
        elementsToTranslate.forEach(element => {
            const key = element.dataset.key;
            const translation = window.translations[lang][key];
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else {
                    const icon = element.querySelector('i.bi');
                    if (icon) {
                        element.innerHTML = '';
                        element.appendChild(icon);
                        element.innerHTML += ' ' + translation;
                    } else {
                        element.innerHTML = translation;
                    }
                }
            }
        });

        setupLanguageButton(lang);
        localStorage.setItem('language', lang);
        
        // Mostrar página cuando esté lista
        if (window.showPage) {
            window.showPage();
        }
    }

    // Inicializar cuando las traducciones estén listas
    function initializeLanguage() {
        if (window.translations && window.bootstrap) {
            const initialLang = localStorage.getItem('language') || 'es';
            setupLanguageButton(initialLang);
            setLanguage(initialLang);
        } else {
            setTimeout(initializeLanguage, 100);
        }
    }

    // Configurar eventos cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        const savedLang = localStorage.getItem('language') || 'es';
        setupLanguageButton(savedLang);
        
        // Event listener para cambio de idioma
        const langDropdownMenu = document.getElementById('langDropdownMenu');
        if (langDropdownMenu) {
            langDropdownMenu.addEventListener('click', (e) => {
                const langItem = e.target.closest('[data-lang]');
                if (langItem) {
                    e.preventDefault();
                    setLanguage(langItem.dataset.lang);
                }
            });
        }
        
        // Inicializar idioma
        initializeLanguage();
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    // --- Comportamiento de Scroll Suave ---
    document.querySelectorAll('a[href^="#"]:not([data-bs-toggle="modal"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip if href is just "#" or empty
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Resaltado del enlace activo según la sección visible ---
    const sectionIds = ['inicio', 'servicios', 'nosotros', 'contacto'];
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    function highlightNav() {
        let scrollPos = window.scrollY + 100;
        let currentSection = sectionIds[0];

        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            currentSection = sectionIds[sectionIds.length - 1];
        } else {
            sectionIds.forEach(id => {
                const section = document.getElementById(id);
                if (section && section.offsetTop <= scrollPos) {
                    currentSection = id;
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active-section');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active-section');
            }
        });
    }
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // --- SISTEMA MEJORADO DE FORMULARIO DE CONTACTO ---
    const contactForm = document.getElementById('contact-form');
    const whatsappSubmitButton = document.getElementById('submit-whatsapp');
    const emailSubmitButton = document.getElementById('submit-email');

    // Estados del formulario
    let isSubmitting = false;

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Función para validar campo individual
    const validateField = (field) => {
        field.classList.remove('is-invalid');
        field.classList.remove('is-valid');
        
        let isValid = true;
        let errorMessage = '';

        // Validar campo requerido
        if (field.required && field.value.trim() === '') {
            isValid = false;
            errorMessage = 'Este campo es obligatorio.';
        }
        
        // Validar email
        if (field.type === 'email' && field.value.trim() !== '') {
            const emailRegex = /^[^S-Za-z0-9._+-]+@[^S-Za-z0-9._+-]+\.[^S-Za-z0-9._+-]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Por favor, introduce un correo válido.';
            }
        }
        
        // Validar teléfono
        if (field.type === 'tel' && field.value.trim() !== '') {
            const phoneRegex = /^[+]?[0-9 -()]{7,}$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Por favor, introduce un número de teléfono válido.';
            }
        }

        if (!isValid) {
            field.classList.add('is-invalid');
            const feedbackElement = field.nextElementSibling;
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.textContent = errorMessage;
            }
        } else {
            field.classList.add('is-valid');
        }
        
        return isValid;
    };

    // Función para validar formulario según método de envío
    const validateForm = (method) => {
        let isFormValid = true;
        
        // Campos siempre obligatorios
        const alwaysRequired = ['name', 'message', 'service'];
        alwaysRequired.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !validateField(field)) {
                isFormValid = false;
            }
        });
        
        // Validación condicional según método
        if (method === 'email') {
            // Para email, validar campo de correo
            const emailField = document.getElementById('email');
            if (emailField && !validateField(emailField)) {
                isFormValid = false;
            }
        } else if (method === 'whatsapp') {
            // Para WhatsApp, validar campo de teléfono
            const phoneField = document.getElementById('phone');
            if (phoneField && !validateField(phoneField)) {
                isFormValid = false;
            }
        }
        
        return isFormValid;
    };

    // Función para limpiar el formulario
    const resetForm = () => {
        contactForm.reset();
        contactForm.querySelectorAll('.form-control, .form-select').forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    };

    // Función para cambiar estado de botones
    const setFormState = (submitting) => {
        isSubmitting = submitting;
        emailSubmitButton.disabled = submitting;
        whatsappSubmitButton.disabled = submitting;
        
        if (submitting) {
            emailSubmitButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Enviando...';
            whatsappSubmitButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Procesando...';
        } else {
            emailSubmitButton.innerHTML = '<i class="bi bi-envelope-fill me-1"></i> <span data-key="modal_submit_email_button">Enviar por Correo</span>';
            whatsappSubmitButton.innerHTML = '<i class="bi bi-whatsapp me-1"></i> <span data-key="modal_submit_whatsapp_button">Enviar por WhatsApp</span>';
        }
    };

    // Función para enviar por email usando Formspree
    const submitToEmail = async (formData) => {
        try {
            setFormState(true);
            
            const response = await fetch('https://formspree.io/f/xblkenwr', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('¡Mensaje enviado exitosamente! Te responderemos pronto.', 'success');
                resetForm();
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showNotification('Error al enviar el mensaje. Por favor, intenta nuevamente.', 'danger');
        } finally {
            setFormState(false);
        }
    };

    // Función para enviar por WhatsApp
    const submitToWhatsApp = () => {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        const service = document.getElementById('service').value;
        
        if (!name || !phone || !message || !service) {
            showNotification('Por favor, completa todos los campos antes de enviar por WhatsApp.', 'warning');
            return;
        }
        
        const phoneNumber = "573135348380"; // Tu número de WhatsApp
        
        // Obtener el texto traducido del servicio seleccionado
        const serviceElement = document.querySelector(`option[value="${service}"]`);
        const serviceName = serviceElement ? serviceElement.textContent : service;
        
        const whatsappMessage = `¡Hola! 👋 Te contacto desde la web de IA Consultores.\n\n*Nombre:* ${name}\n*Celular:* ${phone}\n*Email:* ${document.getElementById('email').value.trim()}
*Servicio de interés:* ${serviceName}

*Mensaje:* ${message}

*Consulta desde:* Formulario web`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        showNotification('Redirigiendo a WhatsApp...', 'info');
        resetForm();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (modal) {
            modal.hide();
        }
    };

    // Función principal para manejar envío del formulario
    const handleFormSubmission = async (event) => {
        event.preventDefault();
        
        if (isSubmitting) {
            return; // Evitar envíos múltiples
        }

        const clickedButtonId = event.submitter ? event.submitter.id : 'submit-email';
        
        if (clickedButtonId === 'submit-email') {
            // Validar para envío por email
            if (!validateForm('email')) {
                showNotification('Por favor, corrige los errores en el formulario.', 'warning');
                return;
            }
            
            // Enviar por email
            const formData = new FormData(contactForm);
            await submitToEmail(formData);
        } else if (clickedButtonId === 'submit-whatsapp') {
            // Validar para envío por WhatsApp
            if (!validateForm('whatsapp')) {
                showNotification('Por favor, corrige los errores en el formulario.', 'warning');
                return;
            }
            
            // Enviar por WhatsApp
            submitToWhatsApp();
        }
    };

    // Event listeners
    if(contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    
        // Validación en tiempo real
        contactForm.querySelectorAll('.form-control, .form-select').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    validateField(field);
                }
            });
        });
    }
    
    // Botón de WhatsApp
    if(whatsappSubmitButton) {
        whatsappSubmitButton.addEventListener('click', (event) => {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            submitEvent.submitter = whatsappSubmitButton;
            contactForm.dispatchEvent(submitEvent);
        });
    }

    // Limpiar formulario cuando se cierre el modal
    const contactModal = document.getElementById('contactModal');
    if(contactModal) {
        contactModal.addEventListener('hidden.bs.modal', function () {
            resetForm();
        });
    }

    // Initializing AOS
    AOS.init();

    // --- LÓGICA DEL MODAL GENERATIVO ---
    const generativeModal = document.getElementById('generativeModal');
    const generateBtn = document.getElementById('generate-design-button');
    const resultsContainer = document.getElementById('image-results-container');
    const descriptionInput = document.getElementById('businessDescription');
    const generateText = generateBtn.querySelector('.generate-text');
    const generatingText = generateBtn.querySelector('.generating-text');

    if(generateBtn) {
        generateBtn.addEventListener('click', async function() {
            const description = descriptionInput.value;
            if (!description.trim()) {
                showNotification('Por favor, describe tu negocio para generar los diseños.', 'warning');
                return;
            }

            // 1. Cambiar al estado de "cargando"
            generateBtn.disabled = true;
            generateText.classList.add('d-none');
            generatingText.classList.remove('d-none');
            resultsContainer.classList.add('d-none');

            try {
                // 2. Llamar a nuestra función de back-end
                const response = await fetch('/api/generate-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ description: description }),
                });

                if (!response.ok) {
                    throw new Error('La respuesta del servidor no fue exitosa.');
                }

                const data = await response.json();

                // 3. Mostrar los resultados
                const resultHolders = resultsContainer.querySelectorAll('.result-image-placeholder');
                resultHolders.forEach((div, index) => {
                    div.innerHTML = ''; // Limpiar placeholder
                    if (data.images[index]) {
                        // Inyectamos directamente el HTML generado por la IA
                        div.innerHTML = data.images[index];
                    }
                });
                resultsContainer.classList.remove('d-none');
                showNotification('¡Se han generado tus diseños!', 'success');

            } catch (error) {
                console.error('Error al llamar a la función serverless:', error);
                showNotification('Hubo un error al generar los diseños. Inténtalo de nuevo.', 'danger');
            } finally {
                // 4. Volver al estado normal del botón
                generateBtn.disabled = false;
                generateText.classList.remove('d-none');
                generatingText.classList.add('d-none');
            }
        });
    }

    // Limpiar el modal cuando se cierra
    if(generativeModal) {
        generativeModal.addEventListener('hidden.bs.modal', function () {
            descriptionInput.value = '';
            resultsContainer.classList.add('d-none');
            const resultHolders = resultsContainer.querySelectorAll('.result-image-placeholder');
            resultHolders.forEach(div => {
                div.innerHTML = ''; // Limpiar contenido HTML
            });
        });
    }
});
