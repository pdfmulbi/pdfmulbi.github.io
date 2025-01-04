document.addEventListener('DOMContentLoaded', function () {
    const plans = document.querySelectorAll('.plan');

    plans.forEach(plan => {
        plan.addEventListener('click', () => {
            // Hapus kelas 'active' dari semua plan
            plans.forEach(p => p.classList.remove('active'));
            
            // Tambahkan kelas 'active' pada plan yang diklik
            plan.classList.add('active');
        });
    });
});
