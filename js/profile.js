document.getElementById('edit-profile').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
});

document.getElementById('cancel-edit').addEventListener('click', function () {
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
});
