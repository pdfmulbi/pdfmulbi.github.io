document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("userForm");
    const userTable = document.querySelector("#userTable tbody");
    const apiUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/users"; // Perbaiki URL API

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch(`${apiUrl}/users`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const users = await response.json();
            userTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.mergeCount || 0}</td>
                    <td>
                        <button onclick="editUser('${user._id}')">Edit</button>
                        <button onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error fetching users:", error);
            alert(`Failed to load users. ${error.message}`);
        }
    }    

    // Handle form submission
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("userId").value;
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;
    
        const userData = { name, email, password };
    
        try {
            let response;
            if (id) {
                // Update user
                response = await fetch(`${apiUrl}/users/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            } else {
                // Create user
                response = await fetch(`${apiUrl}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            }
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            alert("User saved successfully!");
            userForm.reset();
            fetchUsers();
        } catch (error) {
            console.error("Error saving user:", error);
            alert(`Failed to save user. ${error.message}`);
        }
    });    

    // Edit user
    window.editUser = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/users/${id}`);
            if (!response.ok) throw new Error("Failed to fetch user details");
            const user = await response.json();
            document.getElementById("userId").value = user._id;
            document.getElementById("userName").value = user.name;
            document.getElementById("userEmail").value = user.email;
        } catch (error) {
            console.error("Error fetching user:", error);
            alert("Failed to load user details.");
        }
    };

    // Delete user
    window.deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`${apiUrl}/users/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to delete user");
            alert("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    // Initial fetch
    fetchUsers();
});
