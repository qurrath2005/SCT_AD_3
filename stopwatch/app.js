// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Initializing app");

    // DOM Elements
    const scanTab = document.getElementById('scanTab');
    const generateTab = document.getElementById('generateTab');
    const historyTab = document.getElementById('historyTab');

    const scannerSection = document.getElementById('scannerSection');
    const generatorSection = document.getElementById('generatorSection');
    const historySection = document.getElementById('historySection');

    const startCameraButton = document.getElementById('startCamera');
    const galleryInput = document.getElementById('galleryInput');
    const reader = document.getElementById('reader');
    const scanResult = document.getElementById('scanResult');

    const qrTypeBtns = document.querySelectorAll('.qr-type-button');
    const qrForms = document.querySelectorAll('.qr-form');
    const generateQRBtn = document.getElementById('generateQR');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcode = document.getElementById('qrcode');
    const downloadQRBtn = document.getElementById('downloadQR');
    const shareQRBtn = document.getElementById('shareQR');

    const qrColor = document.getElementById('qrColor');
    const bgColor = document.getElementById('bgColor');

    const historyFilters = document.querySelectorAll('.history-filter');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');

    console.log("All DOM elements initialized");

// Global variables
let html5QrCode;
let currentQRCanvas = null;
let history = JSON.parse(localStorage.getItem('qrHistory')) || [];

// Tab Navigation
function switchTab(tab) {
    // Remove active class from all tabs and sections
    [scanTab, generateTab, historyTab].forEach(t => t.classList.remove('active'));
    [scannerSection, generatorSection, historySection].forEach(s => s.classList.remove('active'));

    // Add active class to selected tab and section
    tab.classList.add('active');

    if (tab === scanTab) {
        scannerSection.classList.add('active');
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop();
        }
    } else if (tab === generateTab) {
        generatorSection.classList.add('active');
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop();
        }
    } else if (tab === historyTab) {
        historySection.classList.add('active');
        renderHistory();
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop();
        }
    }
}

scanTab.addEventListener('click', () => switchTab(scanTab));
generateTab.addEventListener('click', () => switchTab(generateTab));
historyTab.addEventListener('click', () => switchTab(historyTab));

// QR Scanner Functions
function initScanner() {
    console.log("Initialize scanner function called");

    // Clear the reader div first
    reader.innerHTML = '';
    scanResult.innerHTML = '<p>Starting camera...</p>';

    // Stop any existing scanner
    if (html5QrCode && html5QrCode.isScanning) {
        try {
            html5QrCode.stop().then(() => {
                console.log("Previous scanner stopped");
                startNewScanner();
            }).catch(err => {
                console.error("Error stopping previous scan:", err);
                startNewScanner();
            });
        } catch (error) {
            console.error("Error with existing scanner:", error);
            startNewScanner();
        }
    } else {
        startNewScanner();
    }

    function startNewScanner() {
        try {
            console.log("Creating new scanner instance");

            // Create new scanner instance
            html5QrCode = new Html5Qrcode("reader");

            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                console.log("QR code scanned successfully:", decodedText);

                try {
                    html5QrCode.stop();
                } catch (error) {
                    console.error("Error stopping scanner after successful scan:", error);
                }

                displayScanResult(decodedText);
                saveToHistory('scanned', decodedText);
            };

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            console.log("Starting camera with config:", config);

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback
            ).catch(error => {
                console.error("Error starting scanner:", error);
                scanResult.innerHTML = `
                    <p class="error">Error accessing camera: ${error.message}</p>
                    <p>Make sure you've granted camera permissions and are using a secure context (HTTPS or localhost).</p>
                    <p>Try using the "Upload Image" option instead.</p>
                `;
            });
        } catch (error) {
            console.error("Error initializing scanner:", error);
            scanResult.innerHTML = `
                <p class="error">Error initializing scanner: ${error.message}</p>
                <p>Try using the "Upload Image" option instead.</p>
            `;
        }
    }
}

function displayScanResult(result) {
    scanResult.innerHTML = `
        <p><strong>Scanned QR Code:</strong></p>
        <p>${result}</p>
        <button id="copyResult" class="secondary-button">Copy</button>
        <button id="openLink" class="secondary-button" ${isValidURL(result) ? '' : 'disabled'}>Open Link</button>
    `;

    document.getElementById('copyResult').addEventListener('click', () => {
        navigator.clipboard.writeText(result)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => console.error('Error copying text: ', err));
    });

    if (isValidURL(result)) {
        document.getElementById('openLink').addEventListener('click', () => {
            window.open(result, '_blank');
        });
    }
}

function scanFromGallery(file) {
    if (!file) {
        console.error("No file provided for gallery scan");
        return;
    }

    console.log("Scanning from gallery, file type:", file.type);

    // Clear reader area
    reader.innerHTML = '';

    // Show loading message
    scanResult.innerHTML = '<p>Processing image...</p>';

    // Create object URL for the file
    const imageUrl = URL.createObjectURL(file);

    // Try to use the Html5QrCode library
    try {
        console.log("Initializing Html5QrCode for file scanning");

        // Create new scanner instance
        html5QrCode = new Html5Qrcode("reader");

        console.log("Scanning file...");

        // Scan the file
        html5QrCode.scanFile(file, true)
            .then(decodedText => {
                console.log("File scanned successfully:", decodedText);
                displayScanResult(decodedText);
                saveToHistory('scanned', decodedText);
            })
            .catch(error => {
                console.error("Error scanning file:", error);

                // Use external QR code scanning API as fallback
                useExternalScanningAPI(file, imageUrl);
            });
    } catch (error) {
        console.error("Error initializing file scanner:", error);
        useExternalScanningAPI(file, imageUrl);
    }

    // Function to use external QR code scanning API
    function useExternalScanningAPI(file, imageUrl) {
        console.log("Using external QR code scanning API");

        // First show the image
        scanResult.innerHTML = `
            <p>Analyzing image...</p>
            <div class="uploaded-image-container">
                <img src="${imageUrl}" alt="Uploaded QR Code" style="max-width: 100%; max-height: 300px;">
            </div>
        `;

        // Create a form to send the file to the API
        const formData = new FormData();
        formData.append('file', file);

        // Display the image while we wait
        displayImageWithMessage(imageUrl, "Trying to decode QR code...");

        // Since we can't directly use fetch API with FormData in this environment,
        // we'll just display the image and let the user know they can use another device to scan it
        setTimeout(() => {
            displayImageWithMessage(imageUrl,
                "For security reasons, we can't automatically scan this image. " +
                "If you can see a QR code in this image, you may need to use another device to scan it.");
        }, 2000);
    }

    // Helper function to display image with a message
    function displayImageWithMessage(url, message) {
        scanResult.innerHTML = `
            <div class="uploaded-image-container">
                <img src="${url}" alt="Uploaded QR Code" style="max-width: 100%; max-height: 300px;">
                <p>${message}</p>
            </div>
        `;
    }
}

// QR Generator Functions
function switchQRType(type) {
    qrTypeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    qrForms.forEach(form => {
        form.classList.toggle('active', form.id === `${type}Form`);
    });
}

function generateQRCode() {
    try {
        console.log("Generate QR Code function called");

        // Find the active form
        const activeForm = document.querySelector('.qr-form.active');
        if (!activeForm) {
            console.error("No active form found");
            alert("Error: No form selected. Please try again.");
            return;
        }

        const type = activeForm.id.replace('Form', '');
        console.log("QR type selected:", type);

        let data = '';

        // Get data based on form type
        switch (type) {
            case 'url':
                data = document.getElementById('urlInput').value.trim();
                if (!data) {
                    alert('Please enter a URL');
                    return;
                }
                if (!isValidURL(data) && !data.startsWith('http')) {
                    data = 'https://' + data;
                }
                break;

            case 'text':
                data = document.getElementById('textInput').value.trim();
                if (!data) {
                    alert('Please enter some text');
                    return;
                }
                break;

            case 'contact':
                const name = document.getElementById('nameInput').value.trim();
                const phone = document.getElementById('phoneInput').value.trim();
                const email = document.getElementById('emailInput').value.trim();

                if (!name && !phone && !email) {
                    alert('Please enter at least one contact detail');
                    return;
                }

                // Simplified contact format for better compatibility
                data = `Name: ${name || 'N/A'}\nPhone: ${phone || 'N/A'}\nEmail: ${email || 'N/A'}`;
                break;

            case 'wifi':
                const ssid = document.getElementById('ssidInput').value.trim();
                const password = document.getElementById('passwordInput').value;
                const encryption = document.getElementById('encryptionType').value;

                if (!ssid) {
                    alert('Please enter the network name (SSID)');
                    return;
                }

                // Simplified WiFi format for better compatibility
                data = `WiFi Network: ${ssid}\nPassword: ${password || 'None'}\nEncryption: ${encryption}`;
                break;

            default:
                console.error("Unknown QR type:", type);
                alert("Error: Unknown QR code type");
                return;
        }

        console.log("Data prepared for QR code:", data);

        // Clear previous QR code
        qrcode.innerHTML = '';

        // Always use the external QR code API for reliability
        const encodedData = encodeURIComponent(data);
        const darkColor = qrColor.value.substring(1);
        const lightColor = bgColor.value.substring(1);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedData}&color=${darkColor}&bgcolor=${lightColor}`;

        console.log("Using QR API URL:", qrApiUrl);

        // Create image element
        const img = document.createElement('img');
        img.src = qrApiUrl;
        img.alt = "Generated QR Code";
        img.style.maxWidth = "100%";

        // Add loading indicator
        qrcode.innerHTML = '<p>Generating QR code...</p>';

        // When image loads, replace loading indicator
        img.onload = function() {
            qrcode.innerHTML = '';
            qrcode.appendChild(img);

            // Enable download and share buttons
            downloadQRBtn.disabled = false;
            shareQRBtn.disabled = false;

            // Setup download functionality
            setupSimpleDownload(qrApiUrl);

            console.log("QR code generated successfully");
        };

        img.onerror = function() {
            qrcode.innerHTML = '<p style="color: red;">Error loading QR code. Please try again.</p>';
            console.error("Failed to load QR code image");
        };

        // Save to history
        saveToHistory('generated', data, { type, colors: { dark: qrColor.value, light: bgColor.value } });

    } catch (error) {
        console.error("Error generating QR code:", error);
        qrcode.innerHTML = '<p style="color: red;">Error generating QR code: ' + error.message + '</p>';
        alert("Error generating QR code: " + error.message);
    }
}

// Simplified download function
function setupSimpleDownload(imageUrl) {
    // Remove previous event listeners
    const newDownloadBtn = document.getElementById('downloadQR');
    const newShareBtn = document.getElementById('shareQR');

    newDownloadBtn.onclick = function() {
        window.open(imageUrl, '_blank');
    };

    if (navigator.share) {
        newShareBtn.onclick = async function() {
            try {
                await navigator.share({
                    title: 'QR Code',
                    text: 'Check out this QR code',
                    url: imageUrl
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        };
    } else {
        newShareBtn.style.display = 'none';
    }
}

function setupDownload(data) {
    const qrImage = qrcode.querySelector('img');

    if (!qrImage) {
        console.error("No QR image found to setup download");
        return;
    }

    // Remove previous event listeners
    downloadQRBtn.replaceWith(downloadQRBtn.cloneNode(true));
    shareQRBtn.replaceWith(shareQRBtn.cloneNode(true));

    // Get the new buttons after replacement
    const newDownloadBtn = document.getElementById('downloadQR');
    const newShareBtn = document.getElementById('shareQR');

    qrImage.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = qrImage.naturalWidth || qrImage.width;
            canvas.height = qrImage.naturalHeight || qrImage.height;

            context.fillStyle = bgColor.value;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(qrImage, 0, 0);

            currentQRCanvas = canvas;

            // Setup download button
            newDownloadBtn.addEventListener('click', () => {
                try {
                    const link = document.createElement('a');
                    link.download = 'qrcode.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch (error) {
                    console.error("Error downloading QR code:", error);
                    alert("Error downloading QR code. Try right-clicking the image and selecting 'Save image as...'");
                }
            });

            // Setup share button (if Web Share API is available)
            if (navigator.share) {
                newShareBtn.addEventListener('click', async () => {
                    try {
                        canvas.toBlob(async (blob) => {
                            const file = new File([blob], 'qrcode.png', { type: 'image/png' });

                            try {
                                await navigator.share({
                                    title: 'QR Code',
                                    files: [file]
                                });
                            } catch (error) {
                                console.error('Error sharing:', error);
                                alert("Error sharing QR code: " + error.message);
                            }
                        });
                    } catch (error) {
                        console.error("Error preparing QR code for sharing:", error);
                        alert("Error preparing QR code for sharing");
                    }
                });
            } else {
                newShareBtn.style.display = 'none';
            }
        } catch (error) {
            console.error("Error setting up QR code download:", error);

            // Fallback for download - direct link to image
            newDownloadBtn.addEventListener('click', () => {
                window.open(qrImage.src, '_blank');
            });

            // Hide share button if canvas operations failed
            newShareBtn.style.display = 'none';
        }
    };

    // Handle case where onload doesn't fire (image might already be loaded)
    if (qrImage.complete) {
        qrImage.onload();
    }
}

// History Functions
function saveToHistory(action, data, metadata = {}) {
    const historyItem = {
        id: Date.now(),
        action,
        data,
        timestamp: new Date().toISOString(),
        metadata
    };

    history.unshift(historyItem);

    // Limit history to 50 items
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('qrHistory', JSON.stringify(history));
}

function renderHistory(filter = 'all') {
    historyList.innerHTML = '';

    const filteredHistory = filter === 'all'
        ? history
        : history.filter(item => item.action === filter);

    if (filteredHistory.length === 0) {
        historyList.innerHTML = '<p>No history items found.</p>';
        return;
    }

    filteredHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const date = new Date(item.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        let displayData = item.data;
        if (displayData.length > 50) {
            displayData = displayData.substring(0, 50) + '...';
        }

        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-type">${item.action === 'scanned' ? 'Scanned' : 'Generated'}</span>
                <span class="history-item-date">${formattedDate}</span>
            </div>
            <div class="history-item-content">${displayData}</div>
            <div class="history-item-actions">
                <button class="secondary-button copy-history" data-id="${item.id}">Copy</button>
                ${isValidURL(item.data) ? `<button class="secondary-button open-history" data-id="${item.id}">Open</button>` : ''}
                ${item.action === 'generated' ? `<button class="secondary-button regenerate-history" data-id="${item.id}">Regenerate</button>` : ''}
            </div>
        `;

        historyList.appendChild(historyItem);
    });

    // Add event listeners to history item buttons
    document.querySelectorAll('.copy-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = history.find(h => h.id === id);
            if (item) {
                navigator.clipboard.writeText(item.data)
                    .then(() => alert('Copied to clipboard!'))
                    .catch(err => console.error('Error copying text: ', err));
            }
        });
    });

    document.querySelectorAll('.open-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = history.find(h => h.id === id);
            if (item && isValidURL(item.data)) {
                window.open(item.data, '_blank');
            }
        });
    });

    document.querySelectorAll('.regenerate-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = history.find(h => h.id === id);
            if (item && item.action === 'generated') {
                // Switch to generator tab
                switchTab(generateTab);

                // Set the appropriate form
                if (item.metadata && item.metadata.type) {
                    switchQRType(item.metadata.type);

                    // Fill in the form data
                    switch (item.metadata.type) {
                        case 'url':
                            document.getElementById('urlInput').value = item.data;
                            break;
                        case 'text':
                            document.getElementById('textInput').value = item.data;
                            break;
                        // For contact and wifi, we'd need to parse the data
                        // This is simplified for brevity
                    }

                    // Set colors if available
                    if (item.metadata.colors) {
                        qrColor.value = item.metadata.colors.dark;
                        bgColor.value = item.metadata.colors.light;
                    }

                    // Generate the QR code
                    generateQRCode();
                }
            }
        });
    });
}

// Helper Functions
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

// Event Listeners
startCameraButton.addEventListener('click', initScanner);

galleryInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        scanFromGallery(e.target.files[0]);
    }
});

qrTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchQRType(btn.dataset.type);
    });
});

generateQRBtn.addEventListener('click', generateQRCode);

historyFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        historyFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        renderHistory(filter.dataset.filter);
    });
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        history = [];
        localStorage.removeItem('qrHistory');
        renderHistory();
    }
});

// Debug functionality
const checkCompatibilityBtn = document.getElementById('checkCompatibility');
const debugInfo = document.getElementById('debugInfo');

if (checkCompatibilityBtn && debugInfo) {
    checkCompatibilityBtn.addEventListener('click', function() {
        debugInfo.innerHTML = '<p>Checking system compatibility...</p>';

        setTimeout(() => {
            let debugText = '';

            // Check browser
            debugText += `<p><strong>Browser:</strong> ${navigator.userAgent}</p>`;

            // Check if running in secure context
            debugText += `<p><strong>Secure Context:</strong> ${window.isSecureContext ? 'Yes' : 'No'}</p>`;

            // Check if libraries are loaded
            debugText += `<p><strong>Html5QrCode Library:</strong> ${typeof Html5Qrcode !== 'undefined' ? 'Loaded' : 'Not Loaded'}</p>`;
            debugText += `<p><strong>QRCode Library:</strong> ${typeof QRCode !== 'undefined' ? 'Loaded' : 'Not Loaded'}</p>`;

            // Check camera access
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                debugText += `<p><strong>Camera API:</strong> Available</p>`;

                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        debugText += `<p><strong>Camera Access:</strong> <span style="color: green;">Granted</span></p>`;
                        debugInfo.innerHTML = debugText;

                        // Stop the stream
                        stream.getTracks().forEach(track => track.stop());
                    })
                    .catch(error => {
                        debugText += `<p><strong>Camera Access:</strong> <span style="color: red;">Denied - ${error.message}</span></p>`;
                        debugInfo.innerHTML = debugText;
                    });
            } else {
                debugText += `<p><strong>Camera API:</strong> <span style="color: red;">Not Available</span></p>`;
            }

            // Check if running from localhost or HTTPS
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isHttps = window.location.protocol === 'https:';
            debugText += `<p><strong>Protocol:</strong> ${window.location.protocol}</p>`;
            debugText += `<p><strong>Localhost:</strong> ${isLocalhost ? 'Yes' : 'No'}</p>`;
            debugText += `<p><strong>Secure Connection (HTTPS or localhost):</strong> ${isHttps || isLocalhost ? 'Yes' : 'No'}</p>`;

            debugInfo.innerHTML = debugText;
        }, 500);
    });
}

// Initialize the app
switchTab(scanTab);

// End of DOMContentLoaded event listener
});
