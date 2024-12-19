document.getElementById("upload-btn").addEventListener("click", function () {
    document.getElementById("pdf-files").click();
});

document.getElementById("merge-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const files = document.getElementById("pdf-files").files;
    if (files.length < 2) {
        alert("Please select at least 2 PDF files.");
        return;
    }

    const formData = new FormData();
    for (const file of files) {
        formData.append("files", file);
    }

    try {
        const response = await fetch("http://localhost:8080/merge", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            // Mengunduh file PDF hasil merge
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "merged_output.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert("Failed to merge PDFs. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while merging PDFs.");
    }
});
