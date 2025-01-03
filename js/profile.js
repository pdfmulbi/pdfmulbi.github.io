document.getElementById('edit-profile').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
});

document.getElementById('cancel-edit').addEventListener('click', function () {
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
});

document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault();
    // Update profile view with new values
    document.getElementById('first-name').innerText = document.getElementById('first-name-input').value;
    document.getElementById('last-name').innerText = document.getElementById('last-name-input').value;
    document.getElementById('country').innerText = document.getElementById('country-input').value;
    document.getElementById('timezone').innerText = document.getElementById('timezone-input').value;

    // Switch back to profile view
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
});
