const scanButton = document.getElementById("scan-button");
const fileInput = document.getElementById("file-input");
const fileScanButton = document.getElementById("file-scan-button");

const sourceCodeInput = document.getElementById("source-code");
const resultsContainer = document.getElementById("results");
const statusContainer = document.getElementById("scan-status");

const totalCount = document.getElementById("total-count");
const criticalCount = document.getElementById("critical-count");
const highCount = document.getElementById("high-count");
const mediumCount = document.getElementById("medium-count");
const lowCount = document.getElementById("low-count");

if (scanButton) {
    scanButton.addEventListener("click", scanContent);
}

if (fileScanButton) {
    fileScanButton.addEventListener("click", scanUploadedFile);
}

async function scanContent() {
    const content = sourceCodeInput.value.trim();

    if (!content) {
        statusContainer.textContent = "Please enter code to scan.";
        return;
    }

    scanButton.disabled = true;
    fileScanButton.disabled = true;
    statusContainer.textContent = "Scanning...";
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/scan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: content
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Scan failed");
        }

        statusContainer.textContent =
            `Scan completed. Findings: ${result.count}`;

        displayResults(result.findings || []);
    } catch (error) {
        statusContainer.textContent = error.message;

        resultsContainer.innerHTML = `
            <div class="finding-card error">
                <h3>Scan failed</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        updateSummary([]);
    } finally {
        scanButton.disabled = false;
        fileScanButton.disabled = false;
    }
}

async function scanUploadedFile() {
    const file = fileInput.files[0];

    if (!file) {
        statusContainer.textContent = "Please select a file first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileScanButton.disabled = true;
    scanButton.disabled = true;
    statusContainer.textContent = `Scanning ${file.name}...`;
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/scan-file",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "File scan failed");
        }

        statusContainer.textContent =
            `File scan completed. Findings: ${result.count}`;

        displayResults(result.findings || []);
    } catch (error) {
        statusContainer.textContent = error.message;

        resultsContainer.innerHTML = `
            <div class="finding-card error">
                <h3>File scan failed</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        updateSummary([]);
    } finally {
        fileScanButton.disabled = false;
        scanButton.disabled = false;
    }
}

function displayResults(findings) {
    updateSummary(findings);

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

        const remediationMessage =
            finding.remediation?.message ||
            "Review and remove this sensitive information.";

        const remediationSteps =
            finding.remediation?.steps || [];

        return `
            <article class="finding-card ${escapeHtml(severity)}">
                <div class="finding-header">
                    <h3>${escapeHtml(finding.description)}</h3>

                    <span class="severity-badge ${escapeHtml(severity)}">
                        ${escapeHtml(severity.toUpperCase())}
                    </span>
                </div>

                <p>
                    <strong>Type:</strong>
                    ${escapeHtml(finding.type)}
                </p>

                <p>
                    <strong>Line:</strong>
                    ${escapeHtml(String(finding.line))}
                </p>

                <p>
                    <strong>Match:</strong>
                    <code>${escapeHtml(maskSecret(finding.match))}</code>
                </p>

                <p>
                    <strong>Entropy:</strong>
                    ${escapeHtml(String(finding.entropy))}
                </p>

                <div class="remediation">
                    <h4>Recommended action</h4>

                    <p>
                        ${escapeHtml(remediationMessage)}
                    </p>

                    <ul>
                        ${remediationSteps.map((step) => `
                            <li>${escapeHtml(step)}</li>
                        `).join("")}
                    </ul>
                </div>
            </article>
        `;
    }).join("");
}

function updateSummary(findings) {
    const summary = {
        total: findings.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    findings.forEach((finding) => {
        const severity = String(
            finding.severity || "unknown"
        ).toLowerCase();

        if (severity === "critical") {
            summary.critical++;
        } else if (severity === "high") {
            summary.high++;
        } else if (severity === "medium") {
            summary.medium++;
        } else if (severity === "low") {
            summary.low++;
        }
    });

    if (totalCount) {
        totalCount.textContent = summary.total;
    }

    if (criticalCount) {
        criticalCount.textContent = summary.critical;
    }

    if (highCount) {
        highCount.textContent = summary.high;
    }

    if (mediumCount) {
        mediumCount.textContent = summary.medium;
    }

    if (lowCount) {
        lowCount.textContent = summary.low;
    }
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
const clearButton = document.getElementById("clear-button");

if (clearButton) {
    clearButton.addEventListener("click", () => {
        sourceCodeInput.value = "";
        resultsContainer.innerHTML = "";
        statusContainer.textContent = "Ready to scan your source code.";
        updateSummary([]);
    });
}
