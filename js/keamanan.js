document.getElementById('edit-password').addEventListener('click', function (e) {
    e.preventDefault();
    // Show password edit form
    document.getElementById('password-edit').style.display = 'block';
});

document.getElementById('cancel-edit').addEventListener('click', function () {
    // Hide password edit form
    document.getElementById('password-edit').style.display = 'none';
});

document.getElementById('password-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Password berhasil diperbarui!');
    // Hide the form after saving
    document.getElementById('password-edit').style.display = 'none';
});
