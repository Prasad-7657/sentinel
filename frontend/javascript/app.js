const scanButton = document.getElementById("scan-button");
const sourceCodeInput = document.getElementById("source-code");
const resultsContainer = document.getElementById("results");
const statusContainer = document.getElementById("scan-status");

if (scanButton) {
    scanButton.addEventListener("click", scanContent);
}

async function scanContent() {
    const content = sourceCodeInput.value.trim();

    if (!content) {
        statusContainer.textContent = "Please enter code to scan.";
        return;
    }

    scanButton.disabled = true;
    statusContainer.textContent = "Scanning...";
    resultsContainer.textContent = "";

    try {
        const response = await fetch("http://127.0.0.1:5000/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: content
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Scan failed");
        }

        statusContainer.textContent =
            `Scan completed. Findings: ${result.count}`;

        resultsContainer.textContent = JSON.stringify(
            result,
            null,
            2
        );
    } catch (error) {
        statusContainer.textContent = error.message;
        resultsContainer.textContent =
            "Could not connect to the Sentinel backend.";
    } finally {
        scanButton.disabled = false;
    }
}
