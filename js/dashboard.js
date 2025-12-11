document.addEventListener('DOMContentLoaded', function() {
    // Lógica de traducción
    const langInfo = { 
        es: { flag: "https://flagcdn.com/es.svg", name: "Español" }, 
        en: { flag: "https://flagcdn.com/us.svg", name: "English" }, 
        pt: { flag: "https://flagcdn.com/br.svg", name: "Português" } 
    };
    let currentLang = localStorage.getItem('language') || 'es';

    function setLanguage(lang) {
        if (!window.translations || !window.translations[lang]) {
            console.error('Translations not available for language:', lang);
            return;
        }
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-key]').forEach(el => { 
            if (translations[lang]?.[el.dataset.key]) {
                el.textContent = translations[lang][el.dataset.key];
            }
        });
        const langDropdownFlag = document.getElementById('langDropdownFlag');
        const langDropdownText = document.getElementById('langDropdownText');
        if (langInfo[lang] && langDropdownFlag && langDropdownText) {
            langDropdownFlag.src = langInfo[lang].flag;
            langDropdownText.textContent = langInfo[lang].name;
        }
        localStorage.setItem('language', lang);
    }

    const langDropdownMenu = document.getElementById('langDropdownMenu');
    if(langDropdownMenu) {
        langDropdownMenu.addEventListener('click', e => { 
            const langItem = e.target.closest('[data-lang]'); 
            if (langItem) { 
                e.preventDefault(); 
                setLanguage(langItem.dataset.lang); 
            } 
        });
    }
    
    // Set initial language
    setLanguage(currentLang);

    // Gráfico mejorado
    const ctx = document.getElementById('activityChart');
    if (ctx) {
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [
                    {
                        label: 'Tareas Completadas',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Proyectos Iniciados',
                        data: [1, 2, 1, 3, 0, 1],
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        borderColor: 'rgba(25, 135, 84, 1)',
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    // Interacción del Sidebar
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
