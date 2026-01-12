// contract.js - функции для работы с договором

function numberToWords(n) {
    const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 
                   'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 
                   'четырнадцать', 'пятнадцать', 'шестнадцать', 
                   'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 
                  'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 
                      'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    
    let result = '';
    let num = Math.floor(n);
    
    if (num === 0) return 'ноль рублей';
    
    if (num >= 100) {
        result += hundreds[Math.floor(num / 100)] + ' ';
        num %= 100;
    }
    
    if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        num = 0;
    }
    
    if (num > 0) {
        result += units[num] + ' ';
    }
    
    return result.trim() + ' рублей';
}

function getMonthName(m) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return months[m];
}

function getCurrentDate() {
    const now = new Date();
    const day = now.getDate();
    const month = getMonthName(now.getMonth());
    const year = now.getFullYear();
    
    return `г. Москва, ${day} ${month} ${year} г.`;
}

function replacePlaceholders(text, data) {
    let result = text;
    
    // Основные замены
    result = result.replace(/{{date}}/g, data.date || getCurrentDate());
    result = result.replace(/{{customerName}}/g, data.customerName || '');
    result = result.replace(/{{price}}/g, data.price || '12 000');
    result = result.replace(/{{priceWords}}/g, data.priceWords || 'двенадцать тысяч');
    result = result.replace(/{{orderId}}/g, data.orderId || '');
    result = result.replace(/{{archetype}}/g, data.archetype || 'Не определен');
    result = result.replace(/{{pose}}/g, data.pose || 'Стандартная поза');
    result = result.replace(/{{format}}/g, data.format || '3D модель');
    result = result.replace(/{{email}}/g, data.email || '');
    result = result.replace(/{{phone}}/g, data.phone || '');
    
    // Альтернативные варианты написания (на всякий случай)
    result = result.replace(/\{date\}/g, data.date || getCurrentDate());
    result = result.replace(/\{customerName\}/g, data.customerName || '');
    result = result.replace(/\{price\}/g, data.price || '12 000');
    result = result.replace(/\{priceWords\}/g, data.priceWords || 'двенадцать тысяч');
    result = result.replace(/\{orderId\}/g, data.orderId || '');
    
    return result;
}

function generateContractFromTemplate(templateData, clientData, orderData) {
    if (!templateData || !Array.isArray(templateData)) {
        return 'Шаблон договора не найден';
    }
    
    let contractText = '';
    
    // Формируем данные для замены
    const replaceData = {
        date: getCurrentDate(),
        customerName: clientData.name || 'Не указано',
        price: orderData.price || '12 000',
        priceWords: numberToWords(orderData.price || 12000),
        orderId: orderData.orderId || '',
        archetype: orderData.archetype || 'Не определен',
        pose: orderData.pose || 'Стандартная поза',
        format: orderData.format || '3D модель',
        email: clientData.email || 'Не указано',
        phone: clientData.phone || 'Не указано'
    };
    
    templateData.forEach(section => {
        let sectionText = section.text || '';
        
        // Заменяем плейсхолдеры
        sectionText = replacePlaceholders(sectionText, replaceData);
        
        if (section.section && section.section.trim()) {
            contractText += `\n${section.section}\n\n`;
        }
        
        contractText += sectionText + '\n\n';
    });
    
    return contractText.trim();
}

function generateContractText() {
    // Получаем данные из текущего состояния
    const clientData = {
        name: AppState.user.clientName,
        email: AppState.user.clientEmail,
        phone: AppState.user.clientPhone
    };
    
    const format = AppState.getSelectedFormat();
    const pose = AppState.getSelectedPose();
    
    const orderData = {
        orderId: AppState.user.orderId,
        format: format ? format.name : '3D модель Зеркало Души',
        price: format ? format.price.toLocaleString() : '12 000',
        priceNumber: format ? format.price : 12000,
        archetype: AppState.user.archetype ? AppState.user.archetype.name : 'Не определен',
        pose: pose ? pose.name : 'Стандартная поза'
    };
    
    // Генерируем договор из шаблона
    return generateContractFromTemplate(AppState.data.contractTemplate, clientData, orderData);
}

function generateContractHTML() {
    // Получаем данные из текущего состояния
    const clientData = {
        name: AppState.user.clientName,
        email: AppState.user.clientEmail,
        phone: AppState.user.clientPhone
    };
    
    const format = AppState.getSelectedFormat();
    const pose = AppState.getSelectedPose();
    
    const replaceData = {
        date: getCurrentDate(),
        customerName: clientData.name || 'Не указано',
        price: format ? format.price.toLocaleString() : '12 000',
        priceWords: numberToWords(format ? format.price : 12000),
        orderId: AppState.user.orderId || '',
        archetype: AppState.user.archetype ? AppState.user.archetype.name : 'Не определен',
        pose: pose ? pose.name : 'Стандартная поза',
        format: format ? format.name : '3D модель Зеркало Души',
        email: clientData.email || 'Не указано',
        phone: clientData.phone || 'Не указано'
    };
    
    let contractHTML = '';
    
    if (!AppState.data.contractTemplate || AppState.data.contractTemplate.length === 0) {
        return '<p class="contract-error">Шаблон договора не найден</p>';
    }
    
    // Создаём HTML версию договора
    contractHTML += `
        <div class="contract-header">
            <div class="contract-title">
                <h2>Договор-оферта № ${replaceData.orderId}</h2>
                <div class="contract-date">${replaceData.date}</div>
            </div>
            <div class="contract-parties">
                <div class="party">
                    <div class="party-title">Исполнитель:</div>
                    <div class="party-details">Зеркало Души</div>
                </div>
                <div class="party">
                    <div class="party-title">Заказчик:</div>
                    <div class="party-details">${replaceData.customerName}</div>
                </div>
            </div>
        </div>
        
        <div class="contract-body">
    `;
    
    AppState.data.contractTemplate.forEach((section, index) => {
        let sectionText = section.text || '';
        
        // Заменяем плейсхолдеры
        sectionText = replacePlaceholders(sectionText, replaceData);
        
        contractHTML += `
            <div class="contract-section">
                ${section.section ? `<h3 class="section-title">${section.section}</h3>` : ''}
                <div class="section-content">
                    ${sectionText.split('\n').map(paragraph => 
                        `<p>${paragraph}</p>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    contractHTML += `
        </div>
        
        <div class="contract-footer">
            <div class="signatures">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <div class="signature-label">Подпись Заказчика</div>
                    <div class="signature-name">${replaceData.customerName}</div>
                    <div class="signature-note">(считается проставленной автоматически при оплате и предоставлении данных)</div>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <div class="signature-label">Подпись Исполнителя</div>
                    <div class="signature-name">Зеркало Души</div>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// Экспортируем функции
window.generateContractText = generateContractText;
window.generateContractHTML = generateContractHTML;
window.numberToWords = numberToWords;
window.getCurrentDate = getCurrentDate;