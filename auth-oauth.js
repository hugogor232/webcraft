
import { supabase } from './supabaseClient.js';

/**
 * Connecte un utilisateur avec son email et son mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export async function loginWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Login Error:', error.message);
        return { success: false, error };
    }
    return { success: true, error: null };
}

/**
 * Inscrit un nouvel utilisateur avec son email et son mot de passe.
 * @param {string} email - L'email du nouvel utilisateur.
 * @param {string} password - Le mot de passe du nouvel utilisateur.
 * @returns {Promise<{success: boolean, data: object|null, error: object|null}>}
 */
export async function registerWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        console.error('Registration Error:', error.message);
        return { success: false, data: null, error };
    }
    return { success: true, data, error: null };
}

/**
 * Lance le processus de connexion via un fournisseur OAuth (Google, GitHub, etc.).
 * @param {'google'|'github'|'linkedin'} provider - Le nom du fournisseur OAuth.
 */
export async function loginWithOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
        console.error(`OAuth Error with ${provider}:`, error.message);
    }
    // Cette fonction redirige l'utilisateur, donc il n'y a généralement pas de retour direct.
}

/**
 * Déconnecte l'utilisateur actuellement authentifié.
 */
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout Error:', error.message);
    }
    // La redirection est gérée dans handleLogout pour plus de flexibilité.
}

/**
 * Récupère la session utilisateur actuelle.
 * @returns {Promise<object|null>} La session de l'utilisateur ou null si non connecté.
 */
export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error.message);
        return null;
    }
    return session;
}

/**
 * Protège une page privée. Vérifie la session et redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 * @returns {Promise<object|null>} La session si l'utilisateur est connecté, sinon null (après redirection).
 */
export async function checkSessionOrRedirect() {
    const session = await checkSession();
    if (!session) {
        // Redirige vers la page de connexion si aucune session n'est active.
        // Conserve l'URL actuelle pour une redirection après connexion.
        window.location.href = `login.html?redirect=${window.location.pathname}`;
        return null;
    }
    return session;
}

/**
 * Affiche les informations de l'utilisateur dans l'interface.
 * @param {object} session - L'objet session de Supabase.
 */
export function displayUserInfo(session) {
    if (session && session.user) {
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = session.user.email;
        });
        // Vous pouvez ajouter ici la gestion du nom, de l'avatar, etc.
    }
}

/**
 * Met à jour le header des pages publiques si l'utilisateur est connecté.
 */
export async function updatePublicHeader() {
    const session = await checkSession();
    const navLogin = document.querySelector('.nav-login');
    const navCta = document.querySelector('.nav-cta');
    const mainCta = document.getElementById('main-cta');

    if (session) {
        if (navLogin) navLogin.style.display = 'none';
        if (navCta) {
            navCta.textContent = 'Dashboard';
            navCta.href = 'dashboard.html';
            navCta.classList.remove('btn-secondary');
            navCta.classList.add('btn-primary');
        }
        if (mainCta) {
            mainCta.textContent = 'Accéder au Dashboard';
            mainCta.href = 'dashboard.html';
        }
    }
}

/**
 * Gère le processus de déconnexion complet, y compris la redirection.
 */
export async function handleLogout() {
    await logout();
    window.location.href = 'index.html';
}

// Écouteur global pour les changements d'état d'authentification.
// Utile pour la redirection après une connexion OAuth réussie.
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // Vérifie si une redirection est demandée dans l'URL
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            // Comportement par défaut si aucune redirection n'est spécifiée
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
                 window.location.href = 'dashboard.html';
            }
        }
    }
    if (event === 'SIGNED_OUT') {
        // Optionnel: Gérer la déconnexion globale si nécessaire
    }
});