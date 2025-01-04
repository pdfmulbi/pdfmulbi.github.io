document.addEventListener('DOMContentLoaded', function () {
    const monthlyPlan = document.getElementById('monthly-plan');
    const yearlyPlan = document.getElementById('yearly-plan');
    const goPremiumBtn = document.getElementById('go-premium-btn');
    let selectedPlan = 'monthly';

    monthlyPlan.addEventListener('click', () => {
        selectedPlan = 'monthly';
        monthlyPlan.style.borderColor = '#e53e3e';
        yearlyPlan.style.borderColor = 'transparent';
    });

    yearlyPlan.addEventListener('click', () => {
        selectedPlan = 'yearly';
        yearlyPlan.style.borderColor = '#e53e3e';
        monthlyPlan.style.borderColor = 'transparent';
    });

    goPremiumBtn.addEventListener('click', () => {
        alert(`You have selected the ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan. Proceeding to payment...`);
    });
});
