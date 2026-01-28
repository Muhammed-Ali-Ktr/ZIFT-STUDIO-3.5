// Next-Gen QR Generator - Complete JavaScript

// State Management
const state = {
    dataType: 'url',
    colorType: 'solid',
    color1: '#000000',
    color2: '#667eea',
    bgColor: '#ffffff',
    dotStyle: 'square',
    eyeStyle: 'square',
    errorCorrection: 'M',
    margin: 4,
    resolution: 1024,
    format: 'png',
    logo: null,
    frame: 'none',
    watermark: '',
    theme: 'dark',
    qrInstance: null
};

// Data Type Fields Configuration
const dataTypeFields = {
    url: [
        { type: 'text', id: 'url', label: 'URL Adresi', placeholder: 'https://example.com', required: true }
    ],
    text: [
        { type: 'textarea', id: 'text', label: 'Metin', placeholder: 'Mesajınızı yazın...', required: true }
    ],
    wifi: [
        { type: 'text', id: 'ssid', label: 'Ağ Adı (SSID)', placeholder: 'WiFi-Network', required: true },
        { type: 'password', id: 'password', label: 'Şifre', placeholder: '••••••••' },
        { type: 'select', id: 'encryption', label: 'Güvenlik', options: [
            { value: 'WPA', label: 'WPA/WPA2' },
            { value: 'WEP', label: 'WEP' },
            { value: 'nopass', label: 'Açık Ağ' }
        ]},
        { type: 'checkbox', id: 'hidden', label: 'Gizli Ağ' }
    ],
    vcard: [
        { type: 'text', id: 'firstName', label: 'Ad', placeholder: 'Ahmet', required: true },
        { type: 'text', id: 'lastName', label: 'Soyad', placeholder: 'Yılmaz' },
        { type: 'tel', id: 'phone', label: 'Telefon', placeholder: '+90 555 123 4567' },
        { type: 'email', id: 'vcardEmail', label: 'E-posta', placeholder: 'ahmet@example.com' },
        { type: 'text', id: 'organization', label: 'Şirket', placeholder: 'ABC Corp' }
    ],
    sms: [
        { type: 'tel', id: 'smsPhone', label: 'Telefon', placeholder: '+90 555 123 4567', required: true },
        { type: 'textarea', id: 'smsMessage', label: 'Mesaj', placeholder: 'SMS mesajınız...' }
    ],
    email: [
        { type: 'email', id: 'emailTo', label: 'Alıcı', placeholder: 'ornek@example.com', required: true },
        { type: 'text', id: 'emailSubject', label: 'Konu', placeholder: 'E-posta konusu' },
        { type: 'textarea', id: 'emailBody', label: 'Mesaj', placeholder: 'E-posta içeriği...' }
    ],
    event: [
        { type: 'text', id: 'eventTitle', label: 'Etkinlik', placeholder: 'Toplantı', required: true },
        { type: 'datetime-local', id: 'eventStart', label: 'Başlangıç', required: true },
        { type: 'datetime-local', id: 'eventEnd', label: 'Bitiş' },
        { type: 'text', id: 'eventLocation', label: 'Konum', placeholder: 'Ofis' }
    ],
    crypto: [
        { type: 'select', id: 'cryptoType', label: 'Kripto Para', options: [
            { value: 'bitcoin', label: '₿ Bitcoin' },
            { value: 'ethereum', label: 'Ξ Ethereum' },
            { value: 'solana', label: '◎ Solana' }
        ]},
        { type: 'text', id: 'cryptoAddress', label: 'Cüzdan Adresi', placeholder: '0x...', required: true },
        { type: 'number', id: 'cryptoAmount', label: 'Miktar', placeholder: '0.001', step: '0.00000001' }
    ]
};

// Templates
const templates = {
    'modern-blue': { colorType: 'linear', color1: '#3b82f6', color2: '#1e40af', bgColor: '#ffffff' },
    'sunset': { colorType: 'linear', color1: '#f97316', color2: '#a855f7', bgColor: '#ffffff' },
    'corporate': { colorType: 'solid', color1: '#1f2937', color2: '#111827', bgColor: '#ffffff' },
    'nature': { colorType: 'radial', color1: '#10b981', color2: '#0d9488', bgColor: '#ffffff' }
};

// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Initialize
function init() {
    loadFromLocalStorage();
    renderInputFields();
    renderColorInputs();
    setupEventListeners();
    generateQRCode();
    loadHistory();
}

// Setup Event Listeners
function setupEventListeners() {
    // Data type
    document.getElementById('dataType').addEventListener('change', (e) => {
        state.dataType = e.target.value;
        renderInputFields();
        generateQRCode();
    });

    // Color type
    document.getElementById('colorType').addEventListener('change', (e) => {
        state.colorType = e.target.value;
        renderColorInputs();
        generateQRCode();
    });

    // Background color
    document.getElementById('bgColor').addEventListener('input', debounce((e) => {
        state.bgColor = e.target.value;
        generateQRCode();
    }, 300));

    // Margin
    document.getElementById('margin').addEventListener('input', (e) => {
        state.margin = parseInt(e.target.value);
        document.getElementById('marginValue').textContent = state.margin;
        generateQRCode();
    });

    // Resolution & Format
    document.getElementById('resolution').addEventListener('change', (e) => {
        state.resolution = parseInt(e.target.value);
        generateQRCode();
    });

    document.getElementById('format').addEventListener('change', (e) => {
        state.format = e.target.value;
    });

    // Logo
    document.getElementById('logoBtn').addEventListener('click', () => {
        document.getElementById('logoUpload').click();
    });

    document.getElementById('logoUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.logo = event.target.result;
                document.getElementById('logoImg').src = state.logo;
                document.getElementById('logoPreview').classList.remove('hidden');
                generateQRCode();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('removeLogo').addEventListener('click', () => {
        state.logo = null;
        document.getElementById('logoPreview').classList.add('hidden');
        document.getElementById('logoUpload').value = '';
        generateQRCode();
    });

    // Frame & Watermark
    document.getElementById('frame').addEventListener('change', (e) => {
        state.frame = e.target.value;
        generateQRCode();
    });

    document.getElementById('watermark').addEventListener('input', debounce((e) => {
        state.watermark = e.target.value;
        generateQRCode();
    }, 300));

    // Style buttons
    document.querySelectorAll('.dot-style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.dot-style-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.dotStyle = e.target.dataset.style;
            generateQRCode();
        });
    });

    document.querySelectorAll('.eye-style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.eye-style-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.eyeStyle = e.target.dataset.style;
            generateQRCode();
        });
    });

    document.querySelectorAll('.ec-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.ec-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.errorCorrection = e.target.dataset.level;
            generateQRCode();
        });
    });

    // Templates
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const templateName = e.currentTarget.dataset.template;
            applyTemplate(templateName);
        });
    });

    // Download & Share
    document.getElementById('downloadBtn').addEventListener('click', downloadQRCode);
    document.getElementById('shareBtn').addEventListener('click', shareQRCode);

    // Theme
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // History
    document.getElementById('historyBtn').addEventListener('click', () => {
        document.getElementById('historyModal').classList.add('active');
        loadHistory();
    });

    document.getElementById('closeHistory').addEventListener('click', () => {
        document.getElementById('historyModal').classList.remove('active');
    });

    // Share modal
    document.getElementById('closeShare').addEventListener('click', () => {
        document.getElementById('shareModal').classList.remove('active');
    });

    document.getElementById('copyLink').addEventListener('click', () => {
        const input = document.getElementById('shareLink');
        input.select();
        document.execCommand('copy');
        document.getElementById('copyLink').textContent = '✓';
        setTimeout(() => {
            document.getElementById('copyLink').textContent = '📋';
        }, 2000);
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Render Input Fields
function renderInputFields() {
    const fields = dataTypeFields[state.dataType];
    let html = '';

    fields.forEach(field => {
        if (field.type === 'select') {
            html += `
                <div class="mb-3">
                    <label class="block text-sm font-medium mb-2 text-gray-300">${field.label}</label>
                    <select id="${field.id}" class="glass-input w-full px-4 py-2 rounded-xl text-sm">
                        ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (field.type === 'textarea') {
            html += `
                <div class="mb-3">
                    <label class="block text-sm font-medium mb-2 text-gray-300">${field.label}</label>
                    <textarea id="${field.id}" class="glass-input w-full px-4 py-2 rounded-xl text-sm resize-none" rows="3" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>
                </div>
            `;
        } else if (field.type === 'checkbox') {
            html += `
                <div class="mb-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="${field.id}" class="w-4 h-4 rounded">
                        <span class="text-sm text-gray-300">${field.label}</span>
                    </label>
                </div>
            `;
        } else {
            html += `
                <div class="mb-3">
                    <label class="block text-sm font-medium mb-2 text-gray-300">${field.label}</label>
                    <input type="${field.type}" id="${field.id}" class="glass-input w-full px-4 py-2 rounded-xl text-sm" placeholder="${field.placeholder || ''}" ${field.step ? `step="${field.step}"` : ''} ${field.required ? 'required' : ''}>
                </div>
            `;
        }
    });

    document.getElementById('inputFields').innerHTML = html;

    // Add event listeners
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener('input', debounce(() => generateQRCode(), 500));
        }
    });
}

// Render Color Inputs
function renderColorInputs() {
    let html = '';
    
    if (state.colorType === 'solid') {
        html = `
            <div class="flex gap-2 items-center">
                <label class="text-sm text-gray-300 w-20">Renk:</label>
                <input type="color" id="color1" value="${state.color1}" class="color-picker">
            </div>
        `;
    } else {
        html = `
            <div class="flex gap-2 items-center mb-2">
                <label class="text-sm text-gray-300 w-20">Renk 1:</label>
                <input type="color" id="color1" value="${state.color1}" class="color-picker">
            </div>
            <div class="flex gap-2 items-center">
                <label class="text-sm text-gray-300 w-20">Renk 2:</label>
                <input type="color" id="color2" value="${state.color2}" class="color-picker">
            </div>
        `;
    }

    document.getElementById('colorInputs').innerHTML = html;

    // Re-attach event listeners
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');

    if (color1Input) {
        color1Input.addEventListener('input', debounce((e) => {
            state.color1 = e.target.value;
            generateQRCode();
        }, 300));
    }

    if (color2Input) {
        color2Input.addEventListener('input', debounce((e) => {
            state.color2 = e.target.value;
            generateQRCode();
        }, 300));
    }
}

// Get QR Content
function getQRContent() {
    const fields = dataTypeFields[state.dataType];
    let content = '';

    switch (state.dataType) {
        case 'url':
        case 'text':
            const input = document.getElementById(fields[0].id);
            content = input ? input.value : '';
            break;

        case 'wifi':
            const ssid = document.getElementById('ssid')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const encryption = document.getElementById('encryption')?.value || 'WPA';
            const hidden = document.getElementById('hidden')?.checked ? 'true' : 'false';
            content = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
            break;

        case 'vcard':
            const firstName = document.getElementById('firstName')?.value || '';
            const lastName = document.getElementById('lastName')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const email = document.getElementById('vcardEmail')?.value || '';
            const organization = document.getElementById('organization')?.value || '';
            content = `BEGIN:VCARD\nVERSION:3.0\nFN:${firstName} ${lastName}\nTEL:${phone}\nEMAIL:${email}\nORG:${organization}\nEND:VCARD`;
            break;

        case 'sms':
            const smsPhone = document.getElementById('smsPhone')?.value || '';
            const message = document.getElementById('smsMessage')?.value || '';
            content = `SMSTO:${smsPhone}:${message}`;
            break;

        case 'email':
            const to = document.getElementById('emailTo')?.value || '';
            const subject = document.getElementById('emailSubject')?.value || '';
            const body = document.getElementById('emailBody')?.value || '';
            content = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            break;

        case 'event':
            const title = document.getElementById('eventTitle')?.value || '';
            const start = document.getElementById('eventStart')?.value || '';
            const end = document.getElementById('eventEnd')?.value || '';
            const location = document.getElementById('eventLocation')?.value || '';
            const startFormatted = start.replace(/[-:]/g, '').replace('T', '') + '00Z';
            const endFormatted = end.replace(/[-:]/g, '').replace('T', '') + '00Z';
            content = `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${startFormatted}\nDTEND:${endFormatted}\nLOCATION:${location}\nEND:VEVENT`;
            break;

        case 'crypto':
            const cryptoType = document.getElementById('cryptoType')?.value || 'bitcoin';
            const address = document.getElementById('cryptoAddress')?.value || '';
            const amount = document.getElementById('cryptoAmount')?.value || '';
            const prefix = cryptoType === 'bitcoin' ? 'bitcoin' : cryptoType === 'ethereum' ? 'ethereum' : 'solana';
            content = amount ? `${prefix}:${address}?amount=${amount}` : `${prefix}:${address}`;
            break;
    }

    return content || 'https://example.com';
}

// Generate QR Code
function generateQRCode() {
    const content = getQRContent();
    const container = document.getElementById('qrcode');
    
    // Add updating animation
    container.classList.add('updating');

    setTimeout(() => {
        // Clear previous QR
        container.innerHTML = '';

        // Create QR code
        const errorLevels = { L: 'L', M: 'M', Q: 'Q', H: 'H' };
        
        try {
            state.qrInstance = new QRCode(container, {
                text: content,
                width: state.resolution,
                height: state.resolution,
                colorDark: state.color1,
                colorLight: state.bgColor,
                correctLevel: QRCode.CorrectLevel[errorLevels[state.errorCorrection]]
            });

            // Apply additional styling
            setTimeout(() => {
                applyAdvancedStyling();
                container.classList.remove('updating');
                updateStatus(true);
                saveToHistory();
            }, 100);

        } catch (error) {
            console.error('QR generation error:', error);
            updateStatus(false);
            container.classList.remove('updating');
        }
    }, 200);
}

// Apply Advanced Styling
function applyAdvancedStyling() {
    const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!qrElement) return;

    // Apply gradients if needed
    if (state.colorType !== 'solid' && qrElement.tagName === 'CANVAS') {
        const canvas = qrElement;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] < 128) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor(i / 4 / canvas.width);
                
                let progress = 0;
                if (state.colorType === 'linear') {
                    progress = x / canvas.width;
                } else {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
                    progress = distance / maxDistance;
                }
                
                const color = interpolateColor(state.color1, state.color2, progress);
                data[i] = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // Add logo
    if (state.logo) {
        addLogoToQR();
    }

    // Add frame
    if (state.frame !== 'none') {
        addFrame();
    }

    // Add watermark
    if (state.watermark) {
        addWatermark();
    }
}

// Add Logo
function addLogoToQR() {
    const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!qrElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = qrElement.width || state.resolution;
    canvas.height = qrElement.height || state.resolution;
    const ctx = canvas.getContext('2d');

    // Draw QR code
    ctx.drawImage(qrElement, 0, 0);

    // Draw logo
    const logo = new Image();
    logo.onload = () => {
        const logoSize = canvas.width * 0.2;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);

        // Logo
        ctx.drawImage(logo, x, y, logoSize, logoSize);

        // Replace QR
        qrElement.src = canvas.toDataURL();
    };
    logo.src = state.logo;
}

// Add Frame
function addFrame() {
    const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!qrElement) return;

    const canvas = document.createElement('canvas');
    const frameHeight = 80;
    canvas.width = qrElement.width || state.resolution;
    canvas.height = (qrElement.height || state.resolution) + frameHeight;
    const ctx = canvas.getContext('2d');

    // Draw QR
    ctx.drawImage(qrElement, 0, 0);

    // Draw frame
    ctx.fillStyle = state.color1;
    ctx.fillRect(0, qrElement.height, canvas.width, frameHeight);

    // Frame text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let frameText = '';
    switch (state.frame) {
        case 'scan': frameText = 'Scan Me'; break;
        case 'beni-tara': frameText = 'Beni Tara'; break;
        case 'modern': frameText = 'QR Code'; break;
    }

    ctx.fillText(frameText, canvas.width / 2, qrElement.height + frameHeight / 2);

    qrElement.src = canvas.toDataURL();
}

// Add Watermark
function addWatermark() {
    const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!qrElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = qrElement.width || state.resolution;
    canvas.height = qrElement.height || state.resolution;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(qrElement, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state.watermark, canvas.width / 2, canvas.height - 20);

    qrElement.src = canvas.toDataURL();
}

// Interpolate Color
function interpolateColor(color1, color2, progress) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * progress),
        g: Math.round(c1.g + (c2.g - c1.g) * progress),
        b: Math.round(c1.b + (c2.b - c1.b) * progress)
    };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Update Status
function updateStatus(success) {
    const statusEl = document.getElementById('qrStatus');
    if (success) {
        statusEl.textContent = '✓ Okunabilir';
        statusEl.className = 'absolute bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold shadow-lg';
    } else {
        statusEl.textContent = '✗ Hata';
        statusEl.className = 'absolute bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold shadow-lg';
    }
}

// Download QR Code
function downloadQRCode() {
    const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!qrElement) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.${state.format}`;
    
    if (qrElement.tagName === 'CANVAS') {
        link.href = qrElement.toDataURL(`image/${state.format}`);
    } else {
        link.href = qrElement.src;
    }
    
    link.click();
}

// Share QR Code
function shareQRCode() {
    const stateString = JSON.stringify({
        content: getQRContent(),
        ...state
    });
    const encoded = btoa(encodeURIComponent(stateString));
    const shareUrl = `${window.location.origin}${window.location.pathname}?qr=${encoded}`;
    
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareModal').classList.add('active');
}

// Apply Template
function applyTemplate(templateName) {
    const template = templates[templateName];
    if (!template) return;

    Object.assign(state, template);
    document.getElementById('colorType').value = template.colorType;
    renderColorInputs();
    generateQRCode();
}

// Toggle Theme
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-mode', state.theme === 'light');
    saveToLocalStorage();
}

// History Management
function saveToHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
        const qrElement = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
        if (!qrElement) return;

        const dataUrl = qrElement.tagName === 'CANVAS' ? qrElement.toDataURL() : qrElement.src;
        
        history.unshift({
            id: Date.now(),
            content: getQRContent(),
            dataType: state.dataType,
            image: dataUrl,
            timestamp: new Date().toISOString()
        });

        if (history.length > 10) history.length = 10;
        localStorage.setItem('qrHistory', JSON.stringify(history));
    } catch (error) {
        console.error('History save error:', error);
    }
}

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
        const listEl = document.getElementById('historyList');

        if (history.length === 0) {
            listEl.innerHTML = '<p class="text-gray-400 text-center col-span-3">Henüz geçmiş yok</p>';
            return;
        }

        listEl.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <img src="${item.image}" alt="QR Code">
                <p class="text-sm text-gray-300 truncate">${item.content}</p>
                <p class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
        `).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const historyItem = history.find(h => h.id === id);
                if (historyItem) {
                    state.dataType = historyItem.dataType;
                    document.getElementById('dataType').value = historyItem.dataType;
                    renderInputFields();
                    setTimeout(() => {
                        const fields = dataTypeFields[state.dataType];
                        if (fields[0]) {
                            const input = document.getElementById(fields[0].id);
                            if (input) input.value = historyItem.content;
                        }
                        generateQRCode();
                    }, 100);
                    document.getElementById('historyModal').classList.remove('active');
                }
            });
        });
    } catch (error) {
        console.error('History load error:', error);
    }
}

// Local Storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('qrGeneratorState', JSON.stringify(state));
    } catch (error) {
        console.error('LocalStorage save error:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('qrGeneratorState');
        if (saved) {
            const savedState = JSON.parse(saved);
            Object.assign(state, savedState);
            if (state.theme === 'light') {
                document.body.classList.add('light-mode');
            }
        }
    } catch (error) {
        console.error('LocalStorage load error:', error);
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
setInterval(saveToLocalStorage, 5000);
