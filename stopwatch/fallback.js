// Simple fallback QR code generator
// This is a very basic implementation that will be used if the main libraries fail to load

(function() {
    // Check if we need to use fallback
    window.addEventListener('load', function() {
        if (typeof QRCode === 'undefined') {
            console.log("Using fallback QR code generator");
            setupFallbackGenerator();
        }
    });

    function setupFallbackGenerator() {
        // Get elements
        const generateQRBtn = document.getElementById('generateQR');
        const qrcode = document.getElementById('qrcode');
        const qrColor = document.getElementById('qrColor');
        const bgColor = document.getElementById('bgColor');
        const downloadQRBtn = document.getElementById('downloadQR');
        const shareQRBtn = document.getElementById('shareQR');
        
        if (!generateQRBtn || !qrcode) return;
        
        // Override the generate button click handler
        generateQRBtn.addEventListener('click', function() {
            // Get the active form
            const activeForm = document.querySelector('.qr-form.active');
            if (!activeForm) return;
            
            const type = activeForm.id.replace('Form', '');
            let data = '';
            
            // Get data based on form type
            switch (type) {
                case 'url':
                    data = document.getElementById('urlInput').value.trim();
                    if (!data) {
                        alert('Please enter a URL');
                        return;
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
                    
                    data = `Name: ${name || 'N/A'}\nPhone: ${phone || 'N/A'}\nEmail: ${email || 'N/A'}`;
                    break;
                case 'wifi':
                    const ssid = document.getElementById('ssidInput').value.trim();
                    const password = document.getElementById('passwordInput').value;
                    
                    if (!ssid) {
                        alert('Please enter the network name (SSID)');
                        return;
                    }
                    
                    data = `WiFi Network: ${ssid}\nPassword: ${password || 'None'}`;
                    break;
            }
            
            // Generate QR code using external API
            const encodedData = encodeURIComponent(data);
            const darkColor = qrColor.value.substring(1);
            const lightColor = bgColor.value.substring(1);
            
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedData}&color=${darkColor}&bgcolor=${lightColor}`;
            
            // Display QR code
            qrcode.innerHTML = `
                <img src="${qrApiUrl}" alt="Generated QR Code" style="max-width: 100%;">
                <p style="margin-top: 10px; font-size: 12px;">Generated using external QR code service (fallback mode)</p>
            `;
            
            // Enable download button
            downloadQRBtn.disabled = false;
            
            // Setup download functionality
            const img = qrcode.querySelector('img');
            
            downloadQRBtn.addEventListener('click', function() {
                window.open(img.src, '_blank');
            });
            
            // Hide share button in fallback mode
            shareQRBtn.style.display = 'none';
            
            // Save to history if available
            if (typeof saveToHistory === 'function') {
                saveToHistory('generated', data, { type, colors: { dark: qrColor.value, light: bgColor.value } });
            }
        });
        
        // Setup QR type switching
        const qrTypeBtns = document.querySelectorAll('.qr-type-button');
        const qrForms = document.querySelectorAll('.qr-form');
        
        qrTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                
                qrTypeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                qrForms.forEach(form => {
                    form.classList.toggle('active', form.id === `${type}Form`);
                });
            });
        });
    }
})();
