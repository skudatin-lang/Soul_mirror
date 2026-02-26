// telegram.js - отправка данных в Telegram (исправленная версия с отправкой чека)
window.sendOrderToTelegram = async function() {
    try {
        // Загружаем Telegram конфигурацию если еще не загружена
        if (!window.APP_CONFIG.TELEGRAM_CONFIG_LOADED) {
            const loaded = await window.loadTelegramConfig();
            if (!loaded) {
                throw new Error('Не удалось загрузить конфигурацию Telegram');
            }
        }
        
        if (!window.APP_CONFIG.TELEGRAM_BOT_TOKEN || !window.APP_CONFIG.TELEGRAM_CHANNEL_ID) {
            throw new Error('Не настроены параметры Telegram');
        }
        
        if (!window.AppState || !window.AppState.user) {
            throw new Error('Данные заказа не найдены');
        }
        
        console.log('📤 Начинаем отправку данных в Telegram...');
        
        // Формируем расширенное сообщение
        const message = formatTelegramMessage();
        
        // Отправляем текстовое сообщение
        await sendTextMessage(message);
        
        // Отправляем договор как документ
        const contractText = window.generateContractText ? window.generateContractText() : 'Договор не сгенерирован';
        await sendContractMessage(contractText);
        
        // Если есть фото клиента, отправляем его
        if (window.AppState.user.uploadedPhoto) {
            await sendPhotoMessage();
        }
        
        // Отправляем чек об оплате, если он был загружен
        if (window.receiptFileToSend || window.AppState.user.receiptFile) {
            console.log('📎 Обнаружен чек для отправки');
            const receiptSent = await sendReceiptMessage();
            if (receiptSent) {
                console.log('✅ Чек успешно отправлен');
            } else {
                console.warn('⚠️ Не удалось отправить чек, но продолжаем');
            }
        } else {
            console.log('ℹ️ Чек не найден для отправки');
        }
        
        // Отправляем сводку результатов
        await sendResultsSummary();
        
        console.log('✅ Все данные успешно отправлены в Telegram');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error);
        throw error;
    }
};

function formatTelegramMessage() {
    if (!window.AppState || !window.AppState.data || !window.AppState.user) {
        return 'Данные не найдены';
    }
    
    const format = window.AppState.data.formats ? window.AppState.data.formats[window.AppState.user.selectedFormat] : null;
    const pose = window.AppState.getSelectedPose ? window.AppState.getSelectedPose() : null;
    const results = window.AppState.user.archetypeResults || {};
    
    // Экранируем все пользовательские данные для Markdown
    const escapeMarkdown = (text) => {
        if (!text) return '';
        return String(text)
            .replace(/_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/~/g, '\\~')
            .replace(/`/g, '\\`')
            .replace(/>/g, '\\>')
            .replace(/#/g, '\\#')
            .replace(/\+/g, '\\+')
            .replace(/-/g, '\\-')
            .replace(/=/g, '\\=')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\./g, '\\.')
            .replace(/!/g, '\\!');
    };
    
    const safeClientName = escapeMarkdown(window.AppState.user.clientName || 'Не указано');
    const safeClientEmail = escapeMarkdown(window.AppState.user.clientEmail || 'Не указано');
    const safeClientPhone = window.AppState.user.clientPhone ? escapeMarkdown(window.AppState.user.clientPhone) : '';
    const safeOrderId = escapeMarkdown(window.AppState.user.orderId || 'Не сгенерирован');
    const safeFormatName = format ? escapeMarkdown(format.name) : '3D модель Зеркало Души';
    const safePoseName = pose ? escapeMarkdown(pose.name) : 'Стандартная поза';
    const safeArchetype = results.dominantArchetype ? escapeMarkdown(results.dominantArchetype) : 'Не определен';
    
    let message = `🎯 *НОВЫЙ ЗАКАЗ ЗЕРКАЛО ДУШИ*\n\n`;
    
    message += `👤 *Клиент:* ${safeClientName}\n`;
    message += `📧 *Email:* ${safeClientEmail}\n`;
    if (safeClientPhone) {
        message += `📱 *Телефон:* ${safeClientPhone}\n`;
    }
    message += `🆔 *ID заказа:* ${safeOrderId}\n\n`;
    
    message += `📋 *Детали заказа:*\n`;
    message += `• Формат: ${safeFormatName}\n`;
    
    if (pose) {
        message += `• Поза: ${safePoseName}\n`;
        if (pose.description) {
            message += `  Описание: ${escapeMarkdown(pose.description)}\n`;
        }
    }
    
    const safePrice = format && format.price ? 
        format.price.toLocaleString() : '12 000';
    message += `• Стоимость: ${safePrice} ₽\n`;
    
    if (results.dominantArchetype) {
        message += `\n🧙‍♂️ *РЕЗУЛЬТАТЫ АНКЕТЫ:*\n`;
        message += `• Основной архетип: ${safeArchetype}\n`;
        
        if (results.averageScore) {
            message += `• Средний балл: ${results.averageScore}/5\n`;
        }
    }
    
    // Информация о чеке
    const receiptFile = window.receiptFileToSend || window.AppState.user.receiptFile;
    if (receiptFile) {
        message += `\n💰 *СТАТУС ОПЛАТЫ:*\n`;
        message += `• Подтверждение оплаты: ЗАГРУЖЕНО\n`;
        message += `• Файл чека: ${escapeMarkdown(receiptFile.name || 'чек')}\n`;
    } else {
        message += `\n💰 *СТАТУС ОПЛАТЫ:* Ожидает подтверждения\n`;
    }
    
    message += `\n📝 *Договор:* Сформирован автоматически\n`;
    message += `✅ *Статус:* ${window.AppState.user.paymentUnderReview ? 'На проверке оплаты' : 'Ожидает оплаты'}\n\n`;
    
    const currentDate = new Date();
    message += `📅 *Дата создания:* ${currentDate.toLocaleDateString('ru-RU')}\n`;
    message += `🕒 *Время:* ${currentDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}`;
    
    return message;
}

async function sendResultsSummary() {
    try {
        const results = window.AppState.user.archetypeResults;
        if (!results) return;
        
        const escapeMarkdown = (text) => {
            if (!text) return '';
            return String(text)
                .replace(/_/g, '\\_')
                .replace(/\*/g, '\\*')
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)')
                .replace(/~/g, '\\~')
                .replace(/`/g, '\\`');
        };
        
        let summary = `📊 *ДЕТАЛЬНАЯ СВОДКА РЕЗУЛЬТАТОВ*\n\n`;
        
        summary += `🧙‍♂️ *АРХЕТИПЫ:*\n`;
        if (results.archetypeScores) {
            const archetypeEntries = Object.entries(results.archetypeScores);
            archetypeEntries.sort((a, b) => {
                const avgA = results.archetypeCounts[a[0]] ? a[1] / results.archetypeCounts[a[0]] : 0;
                const avgB = results.archetypeCounts[b[0]] ? b[1] / results.archetypeCounts[b[0]] : 0;
                return avgB - avgA;
            });
            
            for (const [archetype, score] of archetypeEntries) {
                const count = results.archetypeCounts[archetype] || 1;
                const avg = (score / count).toFixed(1);
                const isActive = avg >= 4;
                const marker = isActive ? '✅' : '➖';
                const isDominant = archetype === results.dominantArchetype;
                
                let prefix = '';
                if (isDominant) prefix = '★ ';
                
                summary += `${marker} ${prefix}${escapeMarkdown(archetype)}: ${avg}/5 (${score} баллов за ${count} вопросов)\n`;
            }
        }
        
        summary += `\n⚖️ *ЦЕЛОСТНОСТЬ ПО СФЕРАМ:*\n`;
        if (results.domainScores) {
            const domainEntries = Object.entries(results.domainScores);
            domainEntries.sort((a, b) => {
                const avgA = results.domainCounts[a[0]] ? a[1] / results.domainCounts[a[0]] : 0;
                const avgB = results.domainCounts[b[0]] ? b[1] / results.domainCounts[b[0]] : 0;
                return avgA - avgB;
            });
            
            for (const [domain, score] of domainEntries) {
                const count = results.domainCounts[domain] || 1;
                const avg = (score / count).toFixed(1);
                const domainName = window.AppState.getDomainName ? 
                    window.AppState.getDomainName(domain) : domain;
                
                let status = '';
                if (avg >= 4) status = '✓ Высокая гармония';
                else if (avg <= 2) status = '⚠️ Требует внимания';
                else status = '➖ Умеренный баланс';
                
                const focusMarker = domain === results.lowestDomain ? ' [ФОКУС]' : '';
                const strengthMarker = domain === results.highestDomain ? ' [СИЛА]' : '';
                summary += `• ${escapeMarkdown(domainName)}: ${avg} баллов (${status})${focusMarker}${strengthMarker}\n`;
            }
        }
        
        await sendTextMessage(summary);
        
    } catch (error) {
        console.warn('Не удалось отправить сводку результатов:', error);
    }
}

async function sendTextMessage(text) {
    const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const maxLength = 4000;
    if (text.length > maxLength) {
        const parts = [];
        let remainingText = text;
        while (remainingText.length > 0) {
            parts.push(remainingText.substring(0, maxLength));
            remainingText = remainingText.substring(maxLength);
        }
        
        for (const part of parts) {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: window.APP_CONFIG.TELEGRAM_CHANNEL_ID,
                    text: part,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.warn('Ошибка отправки части сообщения:', error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: window.APP_CONFIG.TELEGRAM_CHANNEL_ID,
                text: text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Ошибка отправки текста: ${error.description || response.status}`);
        }
    }
}

async function sendPhotoMessage() {
    if (!window.AppState || !window.AppState.user.uploadedPhoto) return;
    
    try {
        console.log('📸 Отправка фото клиента...');
        
        // Получаем blob из data URL
        const response = await fetch(window.AppState.user.uploadedPhoto);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('chat_id', window.APP_CONFIG.TELEGRAM_CHANNEL_ID);
        formData.append('photo', blob, `client_photo_${window.AppState.user.orderId || 'order'}.jpg`);
        
        const safeClientName = window.AppState.user.clientName ? 
            window.AppState.user.clientName.replace(/[<>]/g, '') : 'Не указан';
        
        formData.append('caption', `📸 Фото клиента для заказа ${window.AppState.user.orderId || 'Не указан'}\nКлиент: ${safeClientName}`);
        
        const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!apiResponse.ok) {
            const error = await apiResponse.json();
            console.warn('Ошибка отправки фото:', error);
        } else {
            console.log('✅ Фото клиента отправлено');
        }
        
    } catch (error) {
        console.warn('Не удалось отправить фото:', error);
    }
}

// ИСПРАВЛЕННАЯ функция отправки чека
async function sendReceiptMessage() {
    try {
        // Получаем файл чека (сначала из временной переменной, потом из состояния)
        const receiptFile = window.receiptFileToSend || window.AppState.user.receiptFile;
        
        if (!receiptFile) {
            console.log('ℹ️ Чек не найден для отправки');
            return false;
        }
        
        console.log('📎 Начинаем отправку чека:', receiptFile.name);
        
        let blob;
        let fileName;
        
        // ИСПРАВЛЕНИЕ: Правильная обработка dataUrl
        if (receiptFile.dataUrl) {
            // Если есть dataUrl, конвертируем его в blob
            console.log('🔄 Конвертация dataUrl в blob...');
            
            // Извлекаем base64 данные из data URL
            const base64Data = receiptFile.dataUrl.split(',')[1];
            if (!base64Data) {
                console.error('❌ Неверный формат dataUrl');
                return false;
            }
            
            // Декодируем base64 в бинарные данные
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            
            blob = new Blob(byteArrays, { type: receiptFile.type || 'image/jpeg' });
            
            // Определяем расширение файла
            const fileExt = receiptFile.name ? 
                receiptFile.name.split('.').pop() : 
                (receiptFile.type === 'image/png' ? 'png' : 'jpg');
            
            fileName = receiptFile.name || `cheque_${window.AppState.user.orderId || 'order'}.${fileExt}`;
            
            console.log(`✅ DataUrl сконвертирован, размер: ${blob.size} bytes`);
            
        } else if (receiptFile.file) {
            // Если есть оригинальный файл
            blob = receiptFile.file;
            fileName = receiptFile.file.name;
            console.log(`✅ Используется оригинальный файл, размер: ${blob.size} bytes`);
            
        } else {
            console.error('❌ Нет данных для отправки чека');
            return false;
        }
        
        // Дополнительная проверка blob
        if (!blob || blob.size === 0) {
            console.error('❌ Получен пустой blob');
            return false;
        }
        
        // Создаем безопасное имя файла
        const safeOrderId = window.AppState.user.orderId ? 
            window.AppState.user.orderId.replace(/[^a-zA-Z0-9-]/g, '') : 'zakaz';
        
        // Очищаем имя файла от потенциально опасных символов
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.\u0400-\u04FF-]/g, '_');
        const finalFileName = `Cheque_${safeOrderId}_${safeFileName}`;
        
        const formData = new FormData();
        formData.append('chat_id', window.APP_CONFIG.TELEGRAM_CHANNEL_ID);
        formData.append('document', blob, finalFileName);
        
        // Безопасные данные для подписи
        const safeClientName = window.AppState.user.clientName ? 
            window.AppState.user.clientName.replace(/[<>]/g, '') : 'Не указан';
        const safeClientEmail = window.AppState.user.clientEmail ? 
            window.AppState.user.clientEmail.replace(/[<>]/g, '') : 'Не указан';
        
        const caption = `💰 *ПОДТВЕРЖДЕНИЕ ОПЛАТЫ*\n\n` +
            `🆔 Заказ: ${window.AppState.user.orderId || 'Не указан'}\n` +
            `👤 Клиент: ${safeClientName}\n` +
            `📧 Email: ${safeClientEmail}\n` +
            `📅 Дата: ${new Date().toLocaleDateString('ru-RU')}\n` +
            `🕒 Время: ${new Date().toLocaleTimeString('ru-RU')}\n\n` +
            `Файл: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`;
        
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');
        
        const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendDocument`;
        
        console.log('📤 Отправка запроса в Telegram API...');
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Ошибка API Telegram:', errorData);
            throw new Error(`Ошибка отправки чека: ${errorData.description || 'Неизвестная ошибка'}`);
        }
        
        const responseData = await response.json();
        console.log('✅ Ответ от Telegram:', responseData.ok ? 'Успешно' : 'Ошибка');
        
        // Отправляем дополнительное уведомление
        await sendTextMessage(`✅ *ЧЕК ПОЛУЧЕН*\n\nЗаказ: ${window.AppState.user.orderId || 'Не указан'}\nКлиент: ${safeClientName}\nФайл: ${fileName}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка при отправке чека:', error);
        return false;
    }
}

async function sendContractMessage(contractText) {
    try {
        console.log('📄 Отправка договора...');
        
        const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
        
        const safeOrderId = window.AppState.user.orderId ? 
            window.AppState.user.orderId.replace(/[^a-zA-Z0-9-]/g, '') : 'zakaz';
        const fileName = `Dogovor_${safeOrderId}.txt`;
        
        const formData = new FormData();
        formData.append('chat_id', window.APP_CONFIG.TELEGRAM_CHANNEL_ID);
        formData.append('document', blob, fileName);
        
        const safeClientName = window.AppState.user.clientName ? 
            window.AppState.user.clientName.replace(/[<>]/g, '') : 'Не указан';
        const safeClientEmail = window.AppState.user.clientEmail ? 
            window.AppState.user.clientEmail.replace(/[<>]/g, '') : 'Не указан';
        
        formData.append('caption', `📄 *ДОГОВОР*\n\nЗаказ: ${window.AppState.user.orderId || 'Не указан'}\nКлиент: ${safeClientName}\nEmail: ${safeClientEmail}`);
        formData.append('parse_mode', 'Markdown');
        
        const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendDocument`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.warn('Ошибка отправки договора:', error);
        } else {
            console.log('✅ Договор отправлен');
        }
        
    } catch (error) {
        console.warn('Не удалось отправить договор:', error);
    }
}

if (!window.getCurrentDate) {
    window.getCurrentDate = function() {
        return new Date().toLocaleDateString('ru-RU');
    };
}