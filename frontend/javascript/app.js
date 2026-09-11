const API_BASE_URL = "http://127.0.0.1:5000";

const scanButton = document.getElementById("scan-button");
const clearButton = document.getElementById("clear-button");
const fileInput = document.getElementById("file-input");
const fileScanButton = document.getElementById("file-scan-button");

const sourceCode = document.getElementById("source-code");
const resultsContainer = document.getElementById("results");
const scanStatus = document.getElementById("scan-status");

const totalCount = document.getElementById("total-count");
const criticalCount = document.getElementById("critical-count");
const highCount = document.getElementById("high-count");
const mediumCount = document.getElementById("medium-count");
const lowCount = document.getElementById("low-count");

const scanStatusValue = document.getElementById("scanStatusValue");
const scanStatusDescription = document.getElementById(
    "scanStatusDescription"
);

const selectedFileName = document.getElementById("selectedFileName");
const resultsCount = document.getElementById("resultsCount");

function setScanStatus(status, description, message) {
    if (scanStatusValue) {
        scanStatusValue.textContent = status;
    }

    if (scanStatusDescription) {
        scanStatusDescription.textContent = description;
    }

    if (scanStatus) {
        scanStatus.textContent = message;
    }
}

function resetSummary() {
    if (totalCount) totalCount.textContent = "0";
    if (criticalCount) criticalCount.textContent = "0";
    if (highCount) highCount.textContent = "0";
    if (mediumCount) mediumCount.textContent = "0";
    if (lowCount) lowCount.textContent = "0";

    if (resultsCount) {
        resultsCount.textContent = "0 findings";
    }
}

function updateSummary(findings) {
    const total = findings.length;

    const critical = findings.filter(
        finding => finding.severity?.toLowerCase() === "critical"
    ).length;

    const high = findings.filter(
        finding => finding.severity?.toLowerCase() === "high"
    ).length;

    const medium = findings.filter(
        finding => finding.severity?.toLowerCase() === "medium"
    ).length;

    const low = findings.filter(
        finding => finding.severity?.toLowerCase() === "low"
    ).length;

    if (totalCount) totalCount.textContent = total;
    if (criticalCount) criticalCount.textContent = critical;
    if (highCount) highCount.textContent = high;
    if (mediumCount) mediumCount.textContent = medium;
    if (lowCount) lowCount.textContent = low;

    if (resultsCount) {
        resultsCount.textContent =
            `${total} finding${total === 1 ? "" : "s"}`;
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function maskSecret(secret) {
    const value = String(secret ?? "");

    if (value.length <= 8) {
        return "********";
    }

    return (
        escapeHTML(value.slice(0, 4)) +
        "********" +
        escapeHTML(value.slice(-4))
    );
}

function getSeverityClass(severity) {
    const normalizedSeverity = String(severity ?? "medium")
        .toLowerCase()
        .replaceAll(" ", "-");

    return `severity-${normalizedSeverity}`;
}

function displayResults(findings) {
    resultsContainer.innerHTML = "";

    updateSummary(findings);

    if (!findings || findings.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <div class="empty-results-icon">✓</div>
                <h3>No secrets detected</h3>
                <p>
                    The scanner did not find any supported exposed
                    credentials in the submitted content.
                </p>
            </div>
        `;

        return;
    }

    findings.forEach((finding, index) => {
        const severity = finding.severity || "Medium";
        const findingType = finding.type || "Unknown secret";
        const description =
            finding.description || "Potential exposed secret detected.";

        const lineNumber = finding.line ?? "Unknown";
        const remediation =
            finding.remediation ||
            "Review this value and rotate the exposed credential if necessary.";

        const findingElement = document.createElement("article");

        findingElement.className =
            `finding-card ${getSeverityClass(severity)}`;

        findingElement.innerHTML = `
            <div class="finding-header">
                <div>
                    <p class="finding-number">
                        FINDING ${index + 1}
                    </p>

                    <h3>${escapeHTML(findingType)}</h3>
                </div>

                <span class="finding-severity">
                    ${escapeHTML(severity.toUpperCase())}
                </span>
            </div>

            <p class="finding-description">
                ${escapeHTML(description)}
            </p>

            <div class="finding-details">
                <div>
                    <strong>Line</strong>
                    <span>${escapeHTML(lineNumber)}</span>
                </div>

                <div>
                    <strong>Detected value</strong>
                    <code>${maskSecret(finding.match)}</code>
                </div>

                <div>
                    <strong>Entropy</strong>
                    <span>${escapeHTML(finding.entropy ?? "N/A")}</span>
                </div>
            </div>

            <div class="remediation">
                <strong>Remediation guidance</strong>
                <p>${escapeHTML(remediation)}</p>
            </div>
        `;

        resultsContainer.appendChild(findingElement);
    });
}

async function scanSourceCode() {
    const content = sourceCode.value.trim();

    if (!content) {
        setScanStatus(
            "WAITING",
            "Source code required",
            "Please paste source code before scanning."
        );

        sourceCode.focus();
        return;
    }

    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";

    setScanStatus(
        "SCANNING",
        "Analyzing source code",
        "Scanning your source code..."
    );

    try {
        const response = await fetch(`${API_BASE_URL}/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The backend returned an error."
            );
        }

        displayResults(data.findings || []);

        setScanStatus(
            "COMPLETE",
            "Scan completed successfully",
            `Scan completed. Findings: ${data.count || 0}`
        );
    } catch (error) {
        console.error("Code scan error:", error);

        setScanStatus(
            "ERROR",
            "Unable to complete scan",
            `Scan failed: ${error.message}`
        );

        resultsContainer.innerHTML = `
            <div class="empty-results">
                <div class="empty-results-icon">!</div>
                <h3>Scan failed</h3>
                <p>
                    Make sure the Sentinel backend is running on
                    http://127.0.0.1:5000.
                </p>
            </div>
        `;
    } finally {
        scanButton.disabled = false;
        scanButton.textContent = "Scan Code →";
    }
}

async function scanUploadedFile() {
    const file = fileInput.files[0];

    if (!file) {
        setScanStatus(
            "WAITING",
            "File required",
            "Please select a file before scanning."
        );

        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileScanButton.disabled = true;
    fileScanButton.textContent = "Scanning...";

    setScanStatus(
        "SCANNING",
        "Analyzing uploaded file",
        `Scanning file: ${file.name}`
    );

    try {
        const response = await fetch(`${API_BASE_URL}/scan-file`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The backend returned an error."
            );
        }

        displayResults(data.findings || []);

        setScanStatus(
            "COMPLETE",
            "File scan completed",
            `File scan completed. Findings: ${data.count || 0}`
        );
    } catch (error) {
        console.error("File scan error:", error);

        setScanStatus(
            "ERROR",
            "Unable to complete file scan",
            `File scan failed: ${error.message}`
        );
    } finally {
        fileScanButton.disabled = false;
        fileScanButton.textContent = "Scan File →";
    }
}

function clearScanner() {
    sourceCode.value = "";
    fileInput.value = "";

    if (selectedFileName) {
        selectedFileName.textContent = "No file selected";
    }

    resetSummary();

    resultsContainer.innerHTML = `
        <div class="empty-results">
            <div class="empty-results-icon">✓</div>
            <h3>No findings yet</h3>
            <p>
                Run a scan to see detected secrets and
                remediation guidance here.
            </p>
        </div>
    `;

    setScanStatus(
        "READY",
        "Waiting for scan",
        "Ready to scan your source code."
    );
}

if (scanButton) {
    scanButton.addEventListener("click", scanSourceCode);
}

if (fileScanButton) {
    fileScanButton.addEventListener("click", scanUploadedFile);
}

if (clearButton) {
    clearButton.addEventListener("click", clearScanner);
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];

        if (file && selectedFileName) {
            selectedFileName.textContent = file.name;
        } else if (selectedFileName) {
            selectedFileName.textContent = "No file selected";
        }
    });
}
