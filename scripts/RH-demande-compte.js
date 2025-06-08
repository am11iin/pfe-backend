// Configuration de l'API
const API_BASE_URL = 'https://backend-m6sm.onrender.com';

// Function to open/close the sidebar
function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}

// Fonction pour afficher les messages
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Fonction pour charger les utilisateurs en attente
async function loadPendingUsers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'log-in.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/pending-users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des utilisateurs');
        }
        
        const users = await response.json();
        displayPendingUsers(users);
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Fonction pour afficher les utilisateurs en attente
function displayPendingUsers(users) {
    const requestsBody = document.getElementById('requests-body');
    requestsBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.dataset.userId = user.id; // Ajouter l'ID de l'utilisateur comme attribut de données
        row.innerHTML = `
            <td>${user.nom}</td>
            <td>${user.prenom}</td>
            <td>${user.departement}</td>
            <td>${user.role}</td>
            <td><button class="create" onclick="approveUser(${user.id}, true)">Valider</button></td>
            <td><button class="delete" onclick="approveUser(${user.id}, false)">Supprimer</button></td>
        `;
        requestsBody.appendChild(row);
    });
}

// Fonction pour approuver/rejeter un utilisateur
async function approveUser(userId, isApproved) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'log-in.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/approve-user/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            body: JSON.stringify({ is_approved: isApproved })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'approbation de l\'utilisateur');
        }
        
        showMessage(`Utilisateur ${isApproved ? 'approuvé' : 'rejeté'} avec succès`);
        loadPendingUsers();
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'log-in.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
        }
        
        showMessage('Utilisateur supprimé avec succès');
        loadPendingUsers();
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Filtrage de la table
document.getElementById("search-bar").addEventListener("input", filterTable);

function filterTable() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase().trim();
    const requestsRows = document.querySelectorAll("#requests-body tr");
    const accountsRows = document.querySelectorAll(".accounts tbody tr");
    filterRows(requestsRows, searchValue);
    filterRows(accountsRows, searchValue);
}

function filterRows(rows, value) {
    rows.forEach(row => {
        const name = row.cells[0]?.textContent.toLowerCase();
        const prenom = row.cells[1]?.textContent.toLowerCase();
        if (name.includes(value) || prenom.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Gestion des modales et des actions
document.addEventListener("DOMContentLoaded", function () {
    const requestsBody = document.getElementById("requests-body");
    const accountsBody = document.getElementById("accounts-body");
    const modal = document.getElementById("confirmationModal");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    let selectedRow = null;

    // Gestion de la validation des comptes
    requestsBody.addEventListener("click", function (e) {
        if (e.target.classList.contains("create")) {
            selectedRow = e.target.closest("tr");
            modal.style.display = "block";
        }
    });

    confirmBtn.addEventListener("click", async function () {
        if (selectedRow) {
            const userId = selectedRow.dataset.userId;
            await approveUser(userId, true);
            modal.style.display = "none";
        }
    });

    cancelBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Gestion de la suppression
    setupDeleteConfirmation();
});

// Fonctions pour les popups
let rowToDelete = null;

function setupDeleteConfirmation() {
    document.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", function () {
            rowToDelete = this.closest("tr");
            document.getElementById("confirmDeletePopup").style.display = "flex";
        });
    });

    document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
        if (rowToDelete) {
            const userId = rowToDelete.dataset.userId;
            await deleteUser(userId);
            closeDeleteConfirmPopup();
        }
    });
}

function closeDeleteConfirmPopup() {
    document.getElementById("confirmDeletePopup").style.display = "none";
    rowToDelete = null;
}

// Initialisation
window.onload = function () {
    loadPendingUsers();
    setupDeleteConfirmation();
}; 