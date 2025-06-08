document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const btnSubmit1 = document.querySelector('.btn-submit1');

    // Fonction pour afficher les messages d'erreur
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Fonction pour afficher les messages de succès
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.insertBefore(successDiv, form.firstChild);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('img').src = type === 'password' 
            ? '../assets/images/Vector-log-in.png' 
            : '../assets/images/eye-open.png';
    });

    // Redirection vers la page d'inscription
    btnSubmit1.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'sign-in.html';
    });

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validation de l'email
        const emailRegex = /^[a-zA-Z]+(?:\.[a-zA-Z]+)*@gig\.com$/i;
        if (!emailRegex.test(emailInput.value)) {
            showError('Format d\'email invalide. Utilisez prenom.nom@GIG.com');
            return;
        }

        // Validation du mot de passe
        if (passwordInput.value.length < 6) {
            showError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            // Tentative de connexion
            const response = await fetch('https://backend-m6sm.onrender.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'username': emailInput.value,
                    'password': passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Stockage du token
                localStorage.setItem('token', data.access_token);
                
                // Récupération des informations de l'utilisateur
                const userResponse = await fetch('https://backend-m6sm.onrender.com/users/me', {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    
                    // Vérification si l'utilisateur est approuvé (sauf pour admin)
                    if (userData.role !== 'admin' && !userData.is_approved) {
                        showError('Votre compte est en attente d\'approbation par l\'administrateur');
                        localStorage.removeItem('token');
                        return;
                    }

                    // Stockage des informations utilisateur
                    localStorage.setItem('userRole', userData.role);
                    localStorage.setItem('userEmail', userData.email);
                    localStorage.setItem('userName', userData.name);
                    localStorage.setItem('userSurname', userData.surname);

                    showSuccess('Connexion réussie !');
                    
                    // Redirection selon le rôle
                    setTimeout(() => {
                        switch(userData.role) {
                            case 'admin':
                                window.location.href = 'RH-message.html';
                                break;
                            case 'prof':
                                window.location.href = 'messagesprof.html';
                                break;
                            case 'employer':
                                window.location.href = 'messagesuser.html';
                                break;
                            default:
                                window.location.href = 'messagesuser.html';
                        }
                    }, 1000);
                }
            } else {
                showError(data.detail || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showError('Erreur de connexion au serveur');
        }
    });
}); 