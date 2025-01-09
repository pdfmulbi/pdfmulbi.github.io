document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("userForm");
    const userTable = document.querySelector("#userTable tbody");
    const apiUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/users";
    const apiUrlEdit = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/users/details";

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const users = await response.json();
            userTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.mergeCount || 0}</td>
                    <td>
                        <button class="edit" onclick="editUser('${user._id}')">Edit</button>
                        <button class="delete" onclick="deleteUser('${user._id}')">Delete</button>
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
                response = await fetch(apiUrl, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...userData, _id: id })
                });
            } else {
                // Create user
                response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            }
    
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
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
            const response = await fetch(apiUrlEdit);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const user = await response.json();
            document.getElementById("userId").value = user._id;
            document.getElementById("userName").value = user.name;
            document.getElementById("userEmail").value = user.email;
            document.getElementById("userPassword").value = ""; // Kosongkan password untuk keamanan
        } catch (error) {
            console.error("Error fetching user details:", error);
            alert(`Failed to load user details. ${error.message}`);
        }
    };    

    // Delete user
    window.deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(apiUrl, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: id })
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            alert("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(`Failed to delete user. ${error.message}`);
        }
    };

    // Initial fetch
    fetchUsers();
});
