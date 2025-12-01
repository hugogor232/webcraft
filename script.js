```javascript
/*
 * WebCraft AI - script.js
 * Gère les interactions UI non-liées aux données.
 * Auteur: WebCraft AI Generator
 * Version: 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * 1. Gestion du menu mobile (Burger Menu)
     */
    const initMobileMenu = () => {
        const burgerMenu = document.querySelector('.burger-menu');
        const navLinks = document.querySelector('.nav-links');

        if (burgerMenu && navLinks) {
            burgerMenu.addEventListener('click', () => {
                // Bascule la classe 'active' pour afficher/cacher le menu en CSS
                navLinks.classList.toggle('active');
                burgerMenu.classList.toggle('active');

                // Ajoute une classe au body pour bloquer le scroll si le menu est ouvert
                document.body.classList.toggle('menu-open');
            });
        }
    };

    /**
     * 2. Défilement fluide (Smooth Scroll) pour les ancres
     */
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1 && document.querySelector(targetId)) {
                    e.preventDefault();
                    document.querySelector(targetId).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    /**
     * 3. Animations au défilement (Animations on Scroll)
     */
    const initScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.card, .stat-card, .step-card, .feature');

        if (!('IntersectionObserver' in window)) {
            // Si l'API n'est pas supportée, on affiche tout de suite les éléments
            animatedElements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Pour n'animer qu'une seule fois
                }
            });
        }, {
            threshold: 0.1 // Déclenche quand 10% de l'élément est visible
        });

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    };

    /**
     * 4. Validation des formulaires (côté client, UI uniquement)
     */
    const initFormValidation = () => {
        const formsToValidate = document.querySelectorAll('form[novalidate]');

        formsToValidate.forEach(form => {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => validateInput(input));
                input.addEventListener('blur', () => validateInput(input));
            });
        });

        const validateInput = (input) => {
            let isValid = true;
            let errorMessage = '';
            const value = input.value.trim();

            if (input.hasAttribute('required') && value === '') {
                isValid = false;
                errorMessage = 'Ce champ est obligatoire.';
            } else if (input.type === 'email' && value !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez saisir une adresse e-mail valide.';
                }
            } else if (input.hasAttribute('minlength') && value.length < parseInt(input.getAttribute('minlength'), 10)) {
                isValid = false;
                errorMessage = `Ce champ doit contenir au moins ${input.getAttribute('minlength')} caractères.`;
            }

            updateValidationUI(input, isValid, errorMessage);
        };

        const updateValidationUI = (input, isValid, message) => {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return;

            let errorContainer = formGroup.querySelector('.error-message-text');
            if (!errorContainer) {
                errorContainer = document.createElement('small');
                errorContainer.className = 'error-message-text';
                formGroup.appendChild(errorContainer);
            }

            if (isValid) {
                input.classList.remove('is-invalid');
                errorContainer.textContent = '';
            } else {
                input.classList.add('is-invalid');
                errorContainer.textContent = message;
            }
        };
    };

    // Initialisation de tous les modules UI
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFormValidation();
});


/**
 * 5. Fonctions Utilitaires
 * Ces fonctions sont déclarées dans la portée globale pour être potentiellement
 * réutilisées par d'autres scripts si nécessaire.
 */

/**
 * Crée une version "debounced" d'une fonction qui retarde son exécution.
 * @param {Function} func La fonction à "debouncer".
 * @param {number} delay Le délai en millisecondes.
 * @returns {Function} La nouvelle fonction "debounced".
 */
function debounce(func, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Crée une version "throttled" d'une fonction qui ne s'exécute qu'une fois
 * par intervalle de temps donné.
 * @param {Function} func La fonction à "throttler".
 * @param {number} limit La limite de temps en millisecondes.
 * @returns {Function} La nouvelle fonction "throttled".
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Formate une date (string ISO ou objet Date) en format lisible.
 * @param {string|Date} dateString La date à formater.
 * @returns {string} La date formatée (ex: "15 janvier 2024").
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

/**
 * Formate un nombre avec des séparateurs de milliers.
 * @param {number} num Le nombre à formater.
 * @returns {string} Le nombre formaté.
 */
function formatNumber(num) {
    if (typeof num !== 'number') return '';
    return num.toLocaleString('fr-FR');
}
```