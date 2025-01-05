// Simulasi data invoice
const invoices = [
    {
        date: '2025-01-01',
        status: 'Paid',
        details: 'Invoice #001',
        amount: 'Rp500.000',
        method: 'Credit Card',
        download: 'Download'
    },
    {
        date: '2025-01-05',
        status: 'Pending',
        details: 'Invoice #002',
        amount: 'Rp300.000',
        method: 'Bank Transfer',
        download: 'Download'
    },
    {
        date: '2025-01-10',
        status: 'Failed',
        details: 'Invoice #003',
        amount: 'Rp400.000',
        method: 'PayPal',
        download: 'Download'
    }
];

// Populate the invoice table
const invoiceList = document.getElementById('invoice-list');

invoices.forEach((invoice) => {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${invoice.date}</td>
        <td class="status-${invoice.status.toLowerCase()}">${invoice.status}</td>
        <td>${invoice.details}</td>
        <td>${invoice.amount}</td>
        <td>${invoice.method}</td>
        <td><button class="download-btn">${invoice.download}</button></td>
    `;

    invoiceList.appendChild(row);
});
