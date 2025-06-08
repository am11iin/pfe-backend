// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000'; // À modifier selon votre configuration

// Function to open/close the sidebar
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
    } else {
        sidebar.classList.add("active");
    }
}

// Fermer la sidebar quand on clique en dehors
document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebar');
    const menuIcon = document.querySelector('.menuicon');
    if (!sidebar.contains(e.target) && !menuIcon.contains(e.target)) {
        sidebar.classList.remove("active");
    }
});

// Empêche la fermeture quand on clique sur le menuicon
document.querySelector('.menuicon').addEventListener('click', function(e) {
    e.stopPropagation();
});

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
        const response = await fetch(`${API_BASE_URL}/admin/pending-users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        const response = await fetch(`${API_BASE_URL}/admin/approve-user/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ is_approved: isApproved })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'approbation de l\'utilisateur');
        }
        
        showMessage(`Utilisateur ${isApproved ? 'approuvé' : 'rejeté'} avec succès`);
        loadPendingUsers(); // Recharger la liste
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
        }
        
        showMessage('Utilisateur supprimé avec succès');
        loadPendingUsers(); // Recharger la liste
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Fonction pour modifier un utilisateur
async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la modification de l\'utilisateur');
        }
        
        showMessage('Utilisateur modifié avec succès');
        loadPendingUsers(); // Recharger la liste
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

    // Gestion de la modification
    document.querySelectorAll(".modify").forEach(btn => {
        btn.addEventListener("click", function (e) {
            const row = e.target.closest("tr");
            if (e.target.textContent === "Modifier") {
                for (let i = 0; i < 4; i++) {
                    const cell = row.cells[i];
                    const input = document.createElement("input");
                    input.defaultValue = cell.textContent;
                    input.value = cell.textContent;
                    cell.innerHTML = "";
                    cell.appendChild(input);
                }
                e.target.textContent = "Enregistrer";
            } else {
                editRow = row;
                showEditConfirmPopup();
            }
        });
    });

    // Gestion de la suppression
    setupDeleteConfirmation();
});

// Fonctions pour les popups
let editRow = null;
let rowToDelete = null;

function showEditConfirmPopup() {
    document.getElementById("confirmEditPopup").style.display = "flex";
}

function closeEditConfirmPopup() {
    if (editRow) {
        for (let i = 0; i < 4; i++) {
            const cell = editRow.cells[i];
            const input = cell.querySelector("input");
            if (input) {
                cell.textContent = input.defaultValue;
            }
        }
        editRow.querySelector(".modify").textContent = "Modifier";
        editRow = null;
    }
    document.getElementById("confirmEditPopup").style.display = "none";
}

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

// Charger les utilisateurs au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur est connecté et est un admin
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    loadPendingUsers();
}); 
}); 