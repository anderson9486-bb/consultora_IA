// --- SISTEMA DE TRADUCCIÓN AUTOMÁTICA ---
(function() {
    const elementsToTranslate = document.querySelectorAll('[data-key]');
    
    function setLanguage(lang) {
        // Verificar que las traducciones estén disponibles
        if (!window.translations || !window.translations[lang]) {
            console.error('Translations not available for language:', lang);
            // Mostrar la página incluso si fallan las traducciones
            document.documentElement.style.visibility = 'visible';
            return;
        }

        // Actualizar el idioma del documento
        document.documentElement.lang = lang;
        
        // Traducir todos los elementos con data-key
        elementsToTranslate.forEach(element => {
            const key = element.dataset.key;
            const translation = window.translations[lang][key];
            
            if (translation === undefined) {
                return;
            }

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
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
        });
    }

    // Función para inicializar el idioma cuando las traducciones estén listas
    function initializeLanguage() {
        // Verificar que las traducciones estén disponibles
        if (window.translations) {
            const initialLang = localStorage.getItem('language') || 'es';
            setLanguage(initialLang);
            document.documentElement.style.visibility = 'visible';
        } else {
            // Si las traducciones no están listas, esperar un poco más
            setTimeout(initializeLanguage, 100);
        }
    }

    // Inicializar idioma cuando las traducciones estén disponibles
    initializeLanguage();
})();

// --- LÓGICA DEL FORMULARIO DE LOGIN ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            if (email === 'cliente@mail.com' && password === '123456') {
                window.location.href = 'dashboard.html';
            } else {
                // Mensaje de error traducido según el idioma actual
                const currentLang = localStorage.getItem('language') || 'es';
                let errorTitle, errorText;
                
                if (currentLang === 'en') {
                    errorTitle = 'Access Error';
                    errorText = 'Incorrect username or password.';
                } else if (currentLang === 'pt') {
                    errorTitle = 'Erro de Acesso';
                    errorText = 'Nome de usuário ou senha incorretos.';
                } else {
                    errorTitle = 'Error de Acceso';
                    errorText = 'Usuario o contraseña incorrectos.';
                }
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: errorTitle,
                        text: errorText,
                        confirmButtonColor: '#0d6efd'
                    });
                } else {
                    alert(errorText);
                }
            }
        });
    }
});
