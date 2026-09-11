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
    resultsContainer.innerHTML = "";

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

        displayResults(result.findings || []);
    } catch (error) {
        statusContainer.textContent = error.message;
        resultsContainer.textContent =
            "Could not connect to the Sentinel backend.";
    } finally {
        scanButton.disabled = false;
    }
}

function displayResults(findings) {
    if (findings.length === 0) {
        resultsContainer.innerHTML = `
            <div class="finding-card safe">
                <h3>No secrets detected</h3>
                <p>The scanned content appears clean.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = findings.map((finding) => {
        const severity = finding.severity || "unknown";

        return `
            <article class="finding-card ${severity}">
                <div class="finding-header">
                    <h3>${escapeHtml(finding.description)}</h3>
                    <span class="severity-badge ${severity}">
                        ${escapeHtml(severity.toUpperCase())}
                    </span>
                </div>

                <p><strong>Type:</strong>
                    ${escapeHtml(finding.type)}
                </p>

                <p><strong>Line:</strong>
                    ${escapeHtml(String(finding.line))}
                </p>

                <p><strong>Match:</strong>
                    <code>${maskSecret(finding.match)}</code>
                </p>

                <p><strong>Entropy:</strong>
                    ${escapeHtml(String(finding.entropy))}
                </p>
            </article>
        `;
    }).join("");
}

function maskSecret(value) {
    if (!value) {
        return "Unavailable";
    }

    if (value.length <= 8) {
        return "********";
    }

    return `${value.slice(0, 4)}********${value.slice(-4)}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
