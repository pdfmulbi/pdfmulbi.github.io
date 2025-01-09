document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("userForm");
    const userTable = document.querySelector("#userTable tbody");
    const apiUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/users"; // Ganti sesuai dengan URL backend Anda

    // Fetch and display users
    async function fetchUsers() {
        const response = await fetch(`${apiUrl}/users`);
        const users = await response.json();
        userTable.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.mergeCount}</td>
                <td>
                    <button onclick="editUser('${user._id}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Handle form submission
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("userId").value;
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;

        const userData = { name, email, password };

        if (id) {
            // Update user
            await fetch(`${apiUrl}/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        } else {
            // Create user
            await fetch(`${apiUrl}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        }

        userForm.reset();
        fetchUsers();
    });

    // Edit user
    window.editUser = async (id) => {
        const response = await fetch(`${apiUrl}/users/${id}`);
        const user = await response.json();
        document.getElementById("userId").value = user._id;
        document.getElementById("userName").value = user.name;
        document.getElementById("userEmail").value = user.email;
    };

    // Delete user
    window.deleteUser = async (id) => {
        await fetch(`${apiUrl}/users/${id}`, {
            method: "DELETE"
        });
        fetchUsers();
    };

    // Initial fetch
    fetchUsers();
});
