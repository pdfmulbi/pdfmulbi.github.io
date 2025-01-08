document.addEventListener("DOMContentLoaded", function () {
  const donationOptions = document.querySelectorAll(".donation-option");
  const customAmountInput = document.getElementById("customAmount");
  const donateBtn = document.getElementById("donateBtn");

  let selectedAmount = 10000; // Default nominal donasi

  // Menangani klik pada opsi donasi
  donationOptions.forEach(option => {
    option.addEventListener("click", function () {
      // Hapus highlight dari semua opsi
      donationOptions.forEach(opt => opt.classList.remove("highlighted"));
      // Tambahkan highlight ke opsi yang diklik
      this.classList.add("highlighted");
      // Ambil nominal donasi dari atribut data-amount
      selectedAmount = parseInt(this.dataset.amount);
      // Kosongkan input custom donasi
      customAmountInput.value = "";
    });
  });

  // Menangani input custom donasi
  customAmountInput.addEventListener("input", function () {
    // Hapus highlight dari semua opsi
    donationOptions.forEach(opt => opt.classList.remove("highlighted"));
    // Perbarui nominal donasi dengan nilai dari input
    selectedAmount = parseInt(this.value) || 0;
  });

  // Menangani klik pada tombol "Lanjut Pembayaran"
  donateBtn.addEventListener("click", function () {
    if (selectedAmount < 10000) {
      alert("Nominal donasi minimum adalah Rp10.000!");
      return;
    }

    // Simulasikan proses pembayaran
    const confirmation = confirm(
      `Anda akan mendonasikan Rp${selectedAmount.toLocaleString()}. Lanjutkan ke pembayaran?`
    );

    if (confirmation) {
      // Arahkan ke halaman pembayaran (simulasi)
      window.location.href = `payment.html?amount=${selectedAmount}`;
    }
  });
});
