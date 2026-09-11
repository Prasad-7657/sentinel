const API_BASE_URL = "http://127.0.0.1:5000";

const scanButton = document.getElementById("scan-button");
const fileInput = document.getElementById("file-input");
const fileScanButton = document.getElementById("file-scan-button");
const clearButton = document.getElementById("clear-button");

const sourceCode = document.getElementById("source-code");
const resultsContainer = document.getElementById("results");
const scanStatus = document.getElementById("scan-status");
const selectedFile = document.getElementById("selected-file");

const totalCount = document.getElementById("total-count");
const criticalCount = document.getElementById("critical-count");
const highCount = document.getElementById("high-count");
const mediumCount = document.getElementById("medium-count");
const lowCount = document.getElementById("low-count");

const resultsCount = document.getElementById("results-count");

const historyContainer = document.getElementById("scan-history");
const clearHistoryButton = document.getElementById("clear-history-button");

const HISTORY_KEY = "sentinel_scan_history";
const MAX_HISTORY_ITEMS = 10;


/*
|--------------------------------------------------------------------------
| Status handling
|--------------------------------------------------------------------------
*/

function setScanStatus(status, description) {
    if (!scanStatus) {
        return;
    }

    scanStatus.innerHTML = `
        <div class="status-message">
            <strong>${escapeHTML(status)}</strong>
            <p>${escapeHTML(description)}</p>
        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| Summary handling
|--------------------------------------------------------------------------
*/

function resetSummary() {
    if (totalCount) totalCount.textContent = "0";
    if (criticalCount) criticalCount.textContent = "0";
    if (highCount) highCount.textContent = "0";
    if (mediumCount) mediumCount.textContent = "0";
    if (lowCount) lowCount.textContent = "0";
    if (resultsCount) resultsCount.textContent = "0 findings";
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
        const severity = String(finding.severity || "").toLowerCase();

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

    if (totalCount) totalCount.textContent = summary.total;
    if (criticalCount) criticalCount.textContent = summary.critical;
    if (highCount) highCount.textContent = summary.high;
    if (mediumCount) mediumCount.textContent = summary.medium;
    if (lowCount) lowCount.textContent = summary.low;

    if (resultsCount) {
        resultsCount.textContent =
            `${summary.total} finding${summary.total === 1 ? "" : "s"}`;
    }
}


/*
|--------------------------------------------------------------------------
| Security and display helpers
|--------------------------------------------------------------------------
*/

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
        return "••••••••";
    }

    return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

function getSeverityClass(severity) {
    const normalized = String(severity || "low").toLowerCase();

    if (["critical", "high", "medium", "low"].includes(normalized)) {
        return normalized;
    }

    return "low";
}


/*
|--------------------------------------------------------------------------
| Results display
|--------------------------------------------------------------------------
*/

function displayResults(findings) {
    resetSummary();
    updateSummary(findings);

    if (!resultsContainer) {
        return;
    }

    if (!findings || findings.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <span class="empty-results-icon">✓</span>
                <h3>No secrets detected</h3>
                <p>
                    The scanner did not find any supported exposed
                    credentials in this content.
                </p>
            </div>
        `;

        return;
    }

    resultsContainer.innerHTML = findings.map((finding, index) => {
        const severity = getSeverityClass(finding.severity);

        const type = escapeHTML(
            finding.type || finding.secret_type || "Unknown secret"
        );

        const description = escapeHTML(
            finding.description || "Potential exposed secret detected."
        );

        const line = escapeHTML(finding.line ?? "Unknown");
        const entropy = escapeHTML(finding.entropy ?? "N/A");

        const match = maskSecret(
            finding.match || finding.secret || finding.value || ""
        );

        const remediation = escapeHTML(
            finding.remediation ||
            "Remove the exposed secret and rotate the affected credential."
        );

        return `
            <article class="finding-card severity-${severity}">

                <div class="finding-top">
                    <span class="finding-type">
                        ${index + 1}. ${type}
                    </span>

                    <span class="severity-badge ${severity}">
                        ${severity.toUpperCase()}
                    </span>
                </div>

                <p class="finding-description">
                    ${description}
                </p>

                <div class="finding-meta">
                    <span>Line: ${line}</span>
                    <span>Entropy: ${entropy}</span>
                </div>

                <div class="secret-preview">
                    ${escapeHTML(match)}
                </div>

                <div class="remediation">
                    <strong>Recommended remediation</strong>
                    <p>${remediation}</p>
                </div>

            </article>
        `;
    }).join("");
}


/*
|--------------------------------------------------------------------------
| Scan history
|--------------------------------------------------------------------------
*/

function getScanHistory() {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);

        if (!savedHistory) {
            return [];
        }

        const parsedHistory = JSON.parse(savedHistory);

        return Array.isArray(parsedHistory) ? parsedHistory : [];
    } catch (error) {
        console.error("Unable to load scan history:", error);
        return [];
    }
}

function saveScanHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Unable to save scan history:", error);
    }
}

function displayScanHistory() {
    if (!historyContainer) {
        return;
    }

    const history = getScanHistory();

    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-results">
                <span class="empty-results-icon">↺</span>
                <h3>No scan history</h3>
                <p>
                    Your completed scans will appear here.
                </p>
            </div>
        `;

        return;
    }

    historyContainer.innerHTML = history.map((item) => {
        const criticalClass = item.critical > 0 ? "critical" : "";
        const highClass = item.high > 0 ? "high" : "";

        return `
            <div class="history-item">

                <div class="history-item-main">
                    <p class="history-item-title">
                        ${escapeHTML(item.name)}
                    </p>

                    <p class="history-item-meta">
                        ${escapeHTML(item.type)}
                        ·
                        ${escapeHTML(item.date)}
                    </p>
                </div>

                <div class="history-item-stats">
                    <span class="history-count">
                        ${item.total} finding${item.total === 1 ? "" : "s"}
                    </span>

                    ${
                        item.critical > 0
                            ? `<span class="history-count ${criticalClass}">
                                ${item.critical} critical
                               </span>`
                            : ""
                    }

                    ${
                        item.high > 0
                            ? `<span class="history-count ${highClass}">
                                ${item.high} high
                               </span>`
                            : ""
                    }
                </div>

            </div>
        `;
    }).join("");
}

function addScanToHistory(name, type, findings) {
    const history = getScanHistory();

    const critical = findings.filter(
        (finding) =>
            String(finding.severity || "").toLowerCase() === "critical"
    ).length;

    const high = findings.filter(
        (finding) =>
            String(finding.severity || "").toLowerCase() === "high"
    ).length;

    const historyItem = {
        id: Date.now(),
        name,
        type,
        total: findings.length,
        critical,
        high,
        date: new Date().toLocaleString()
    };

    history.unshift(historyItem);

    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    saveScanHistory(limitedHistory);
    displayScanHistory();
}


/*
|--------------------------------------------------------------------------
| Source code scanning
|--------------------------------------------------------------------------
*/

async function scanSourceCode() {
    const content = sourceCode?.value.trim();

    if (!content) {
        setScanStatus(
            "WAITING",
            "Paste source code before starting a scan."
        );

        return;
    }

    scanButton.disabled = true;

    setScanStatus(
        "SCANNING",
        "The scanner is inspecting your source code."
    );

    try {
        const response = await fetch(`${API_BASE_URL}/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Source scan failed.");
        }

        const findings = data.findings || [];

        displayResults(findings);
        addScanToHistory(
            "Source code scan",
            "Source code",
            findings
        );

        setScanStatus(
            "COMPLETE",
            `Scan completed. ${findings.length} finding${findings.length === 1 ? "" : "s"} detected.`
        );
    } catch (error) {
        console.error("Source scan error:", error);

        setScanStatus(
            "ERROR",
            error.message || "Unable to connect to the Sentinel backend."
        );
    } finally {
        scanButton.disabled = false;
    }
}


/*
|--------------------------------------------------------------------------
| File scanning
|--------------------------------------------------------------------------
*/

async function scanUploadedFile() {
    const file = fileInput?.files?.[0];

    if (!file) {
        setScanStatus(
            "WAITING",
            "Choose a file before starting a file scan."
        );

        return;
    }

    fileScanButton.disabled = true;

    setScanStatus(
        "SCANNING",
        `Inspecting ${file.name}.`
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/scan-file`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "File scan failed.");
        }

        const findings = data.findings || [];

        displayResults(findings);
        addScanToHistory(
            file.name,
            "File upload",
            findings
        );

        setScanStatus(
            "COMPLETE",
            `${file.name} scanned successfully. ${findings.length} finding${findings.length === 1 ? "" : "s"} detected.`
        );
    } catch (error) {
        console.error("File scan error:", error);

        setScanStatus(
            "ERROR",
            error.message || "Unable to connect to the Sentinel backend."
        );
    } finally {
        fileScanButton.disabled = false;
    }
}


/*
|--------------------------------------------------------------------------
| Clear scanner
|--------------------------------------------------------------------------
*/

function clearScanner() {
    if (sourceCode) {
        sourceCode.value = "";
    }

    if (fileInput) {
        fileInput.value = "";
    }

    if (selectedFile) {
        selectedFile.textContent = "No file selected";
    }

    resetSummary();

    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <span class="empty-results-icon">✓</span>
                <h3>No scan results yet</h3>
                <p>
                    Start a scan to see exposed secrets and
                    remediation guidance here.
                </p>
            </div>
        `;
    }

    setScanStatus(
        "READY",
        "Choose a scanning method to begin."
    );
}


/*
|--------------------------------------------------------------------------
| Event listeners
|--------------------------------------------------------------------------
*/

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
        const file = fileInput.files?.[0];

        if (selectedFile) {
            selectedFile.textContent = file
                ? file.name
                : "No file selected";
        }
    });
}

if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
        localStorage.removeItem(HISTORY_KEY);
        displayScanHistory();
    });
}


/*
|--------------------------------------------------------------------------
| Initial page setup
|--------------------------------------------------------------------------
*/

resetSummary();
displayScanHistory();
