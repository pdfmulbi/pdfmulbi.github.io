// =========================================
// DASHBOARD - ADMIN USER MANAGEMENT
// =========================================

const API_BASE = "https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger";

// Pagination state
let allUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 4;

// =========================================
// ADMIN ACCESS CHECK
// =========================================
function checkAdminAccess() {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
        Swal.fire({
            icon: "error",
            title: "Akses Ditolak!",
            text: "Anda bukan admin. Silakan login sebagai admin.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        }).then(() => {
            window.location.href = "https://pdfmulbi.github.io/";
        });
        return false;
    }
    return true;
}

// =========================================
// INITIALIZATION
// =========================================
document.addEventListener("DOMContentLoaded", function () {
    if (checkAdminAccess()) {
        fetchUsers();
        setupLogout();
    }
});

// Setup logout button
function setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    const logoutLink = document.getElementById("logout-link");

    const handleLogout = function () {
        Swal.fire({
            title: "Logout?",
            text: "Apakah Anda yakin ingin keluar?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#e53e3e",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Logout",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userName");
                localStorage.removeItem("isAdmin");
                window.location.href = "index.html";
            }
        });
    };

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", handleLogout);
    }
}

// =========================================
// TAB SWITCHING
// =========================================
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Load feedback data when switching to feedback tab
    if (tabName === 'feedback') {
        fetchFeedback();
    }
}

// =========================================
// FETCH ALL USERS
// =========================================
async function fetchUsers() {
    const loading = document.getElementById("loading");
    const tableBody = document.querySelector("#user-table tbody");

    if (loading) loading.style.display = "block";
    if (tableBody) tableBody.innerHTML = "";

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE}/pdfm/get/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            mode: "cors",
        });

        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);

        allUsers = await response.json();

        if (loading) loading.style.display = "none";

        currentPage = 1;
        renderUserTable();
        updateUserCount(allUsers.length);

    } catch (error) {
        console.error("Error fetching users:", error);
        if (loading) loading.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal memuat data users';

        Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Tidak dapat mengambil data users.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        });
    }
}

// =========================================
// RENDER USER TABLE WITH PAGINATION
// =========================================
function renderUserTable() {
    const tableBody = document.querySelector("#user-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (allUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #6b7280; padding: 40px;">
                    <i class="fas fa-users-slash" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Tidak ada user ditemukan
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const usersToShow = allUsers.slice(startIndex, endIndex);

    usersToShow.forEach((user, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
        row.innerHTML = `
            <td><strong>${user.name || '-'}</strong></td>
            <td>${user.email || '-'}</td>
            <td>
                <span class="badge ${user.isSupport ? 'badge-success' : 'badge-default'}">
                    ${user.isSupport ? '<i class="fas fa-check"></i> Yes' : '<i class="fas fa-times"></i> No'}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td class="action-buttons">
                <button class="edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete" onclick="confirmDeleteUser('${user.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    renderPagination();
}

// =========================================
// RENDER PAGINATION
// =========================================
function renderPagination() {
    const paginationContainer = document.getElementById("user-pagination");
    if (!paginationContainer) return;

    const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let html = '';

    // Previous button
    html += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Next button
    html += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationContainer.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderUserTable();
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Update user count
function updateUserCount(count) {
    const userCount = document.getElementById("user-count");
    if (userCount) {
        userCount.textContent = `${count} user${count !== 1 ? 's' : ''}`;
    }
}

// =========================================
// FETCH ALL FEEDBACK (Admin)
// =========================================
async function fetchFeedback() {
    const loading = document.getElementById("feedback-loading");
    const tableBody = document.getElementById("feedback-list");

    if (loading) loading.style.display = "block";
    if (tableBody) tableBody.innerHTML = "";

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE}/pdfm/feedback`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            mode: "cors",
        });

        if (!response.ok) throw new Error(`Failed to fetch feedback: ${response.status}`);

        const feedbacks = await response.json();

        if (loading) loading.style.display = "none";

        populateFeedbackTable(feedbacks);
        updateFeedbackCount(feedbacks.length);

    } catch (error) {
        console.error("Error fetching feedback:", error);
        if (loading) loading.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal memuat data feedback';
    }
}

// =========================================
// POPULATE FEEDBACK TABLE
// =========================================
function populateFeedbackTable(feedbacks) {
    const tableBody = document.getElementById("feedback-list");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!feedbacks || feedbacks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #6b7280; padding: 40px;">
                    <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Belum ada feedback dari user
                </td>
            </tr>
        `;
        return;
    }

    feedbacks.forEach((feedback, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
        row.innerHTML = `
            <td><strong>${feedback.name || '-'}</strong></td>
            <td>${feedback.email || '-'}</td>
            <td class="feedback-message">${feedback.message || '-'}</td>
            <td>${formatDate(feedback.created_at)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update feedback count
function updateFeedbackCount(count) {
    const feedbackCount = document.getElementById("feedback-count");
    if (feedbackCount) {
        feedbackCount.textContent = `${count} feedback`;
    }
}

// =========================================
// DELETE USER
// =========================================
function confirmDeleteUser(userId) {
    Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e53e3e",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            deleteUser(userId);
        }
    });
}

async function deleteUser(userId) {
    try {
        const token = localStorage.getItem("authToken");
        const payload = { id: userId };

        const response = await fetch(`${API_BASE}/pdfm/delete/users`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            mode: "cors",
        });

        if (!response.ok) throw new Error(`Failed to delete user: ${response.status}`);

        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "User telah dihapus.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e",
            timer: 2000,
            timerProgressBar: true
        });

        fetchUsers();

    } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus user.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        });
    }
}

// =========================================
// SAVE USER (CREATE/UPDATE)
// =========================================
async function saveUser(event) {
    event.preventDefault();

    const token = localStorage.getItem("authToken");
    const userId = document.getElementById("user-id").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const isSupport = document.getElementById("isSupport").checked;

    // Validation
    if (!name || !email) {
        Swal.fire({
            icon: "warning",
            title: "Peringatan!",
            text: "Nama dan email wajib diisi.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        });
        return;
    }

    const payload = { name, email, isSupport };
    if (password) payload.password = password;
    if (userId) payload.id = userId;

    const method = userId ? "PUT" : "POST";
    const url = userId
        ? `${API_BASE}/pdfm/update/users`
        : `${API_BASE}/pdfm/create/users`;

    // Show loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            mode: "cors",
        });

        if (!response.ok) throw new Error(`Failed to save user: ${response.status}`);

        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: userId ? "User berhasil diperbarui." : "User baru telah ditambahkan.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e",
            timer: 2000,
            timerProgressBar: true
        });

        resetForm();
        fetchUsers();

    } catch (error) {
        console.error("Error saving user:", error);
        Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Terjadi kesalahan saat menyimpan data.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// =========================================
// EDIT USER
// =========================================
async function editUser(userId) {
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE}/pdfm/getoneadmin/users?id=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            mode: "cors",
        });

        if (!response.ok) throw new Error(`Failed to fetch user details: ${response.status}`);

        const user = await response.json();

        // Populate form
        document.getElementById("user-id").value = user.id;
        document.getElementById("name").value = user.name || '';
        document.getElementById("email").value = user.email || '';
        document.getElementById("password").value = "";
        document.getElementById("isSupport").checked = user.isSupport || false;

        // Update form title
        document.getElementById("form-title").innerHTML = '<i class="fas fa-user-edit"></i> Edit User';

        // Scroll to form
        document.getElementById("user-form-section").scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Error editing user:", error);
        Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Terjadi kesalahan saat mengambil data user.",
            confirmButtonText: "OK",
            confirmButtonColor: "#e53e3e"
        });
    }
}

// =========================================
// RESET FORM
// =========================================
function resetForm() {
    document.getElementById("user-form").reset();
    document.getElementById("user-id").value = "";
    document.getElementById("form-title").innerHTML = '<i class="fas fa-user-plus"></i> Add / Edit User';
}

// =========================================
// EVENT LISTENERS
// =========================================
document.getElementById("user-form").addEventListener("submit", saveUser);

// Add CSS for badges and action buttons dynamically
const style = document.createElement('style');
style.textContent = `
    .badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    .badge-success {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #059669;
    }
    .badge-default {
        background: #f3f4f6;
        color: #6b7280;
    }
    .action-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .feedback-message {
        max-width: 350px;
        line-height: 1.5;
    }
`;
document.head.appendChild(style);

