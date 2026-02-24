// telegram.js - отправка данных в Telegram (обновлённая версия)
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
        
        // Формируем расширенное сообщение
        const message = formatTelegramMessage();
        
        // Отправляем текстовое сообщение
        await sendTextMessage(message);
        
        // Отправляем договор как документ
        const contractText = window.generateContractText ? window.generateContractText() : 'Договор не сгенерирован';
        await sendContractMessage(contractText);
        
        // Если есть фото, отправляем его
        if (window.AppState.user.uploadedPhoto) {
            await sendPhotoMessage();
        }
        
        // Отправляем сводку результатов
        await sendResultsSummary();
        
        console.log('Данные успешно отправлены в Telegram');
        return true;
        
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
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
    
    let message = `🎯 *НОВЫЙ ЗАКАЗ ЗЕРКАЛО ДУШИ*\n\n`;
    
    // Информация о клиенте
    message += `👤 *Клиент:* ${window.AppState.user.clientName || 'Не указано'}\n`;
    message += `📧 *Email:* ${window.AppState.user.clientEmail || 'Не указано'}\n`;
    if (window.AppState.user.clientPhone) {
        message += `📱 *Телефон:* ${window.AppState.user.clientPhone}\n`;
    }
    message += `🆔 *ID заказа:* ${window.AppState.user.orderId || 'Не сгенерирован'}\n\n`;
    
    // Детали заказа
    message += `📋 *Детали заказа:*\n`;
    message += `• Формат: ${format ? format.name : '3D модель Зеркало Души'}\n`;
    
    // Детальное описание позы
    if (pose) {
        message += `• Поза: ${pose.name}\n`;
        if (pose.description) {
            message += `  Описание: ${pose.description}\n`;
        }
        if (pose.keywords) {
            message += `  Ключевые слова: ${pose.keywords}\n`;
        }
    } else {
        message += `• Поза: Стандартная поза\n`;
    }
    
    message += `• Стоимость: ${format ? format.price.toLocaleString() : '12 000'} ₽\n`;
    
    // Результаты анкеты
    if (results.dominantArchetype) {
        message += `\n🧙‍♂️ *РЕЗУЛЬТАТЫ АНКЕТЫ:*\n`;
        
        // Все активные архетипы
        const activeArchetypes = [];
        if (results.archetypeScores) {
            for (const [archetype, score] of Object.entries(results.archetypeScores)) {
                const count = results.archetypeCounts[archetype] || 1;
                const avg = score / count;
                if (avg >= 4) {
                    activeArchetypes.push({
                        name: archetype,
                        score: avg.toFixed(1)
                    });
                }
            }
        }
        
        if (activeArchetypes.length > 0) {
            message += `• Активные архетипы (≥4 баллов):\n`;
            activeArchetypes.forEach((arch, index) => {
                message += `  ${index + 1}. ${arch.name} - ${arch.score}/5\n`;
            });
            
            // Основной архетип (с максимальным баллом)
            if (results.dominantArchetype) {
                message += `\n• Основной архетип: ${results.dominantArchetype} (${results.dominantArchetypeScore ? results.dominantArchetypeScore.toFixed(1) : '0'}/5)\n`;
            }
            
            // Дуэль архетипов если есть
            if (results.duelArchetypes && results.duelArchetypes.length === 2) {
                message += `• Дуэль архетипов: ${results.duelArchetypes.join(' + ')}\n`;
            }
        } else if (results.dominantArchetype) {
            message += `• Основной архетип: ${results.dominantArchetype}\n`;
        }
        
        message += `• Общий балл: ${results.totalScore || 0} / ${results.answeredQuestions ? results.answeredQuestions * 5 : 0}\n`;
        message += `• Средний балл: ${results.averageScore || 0}/5\n`;
        
        if (results.lowestDomain) {
            const domainName = window.AppState.getDomainName ? 
                window.AppState.getDomainName(results.lowestDomain) : results.lowestDomain;
            message += `• Сфера внимания: ${domainName}\n`;
        }
    }
    
    // Статус договора
    message += `\n📝 *Договор:* Сформирован автоматически\n`;
    message += `✅ *Статус:* Ожидает оплаты\n\n`;
    
    message += `📅 *Дата создания:* ${window.getCurrentDate ? window.getCurrentDate() : new Date().toLocaleDateString('ru-RU')}\n`;
    message += `🕒 *Время:* ${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}`;
    
    return message;
}

async function sendResultsSummary() {
    try {
        const results = window.AppState.user.archetypeResults;
        if (!results) return;
        
        let summary = `📊 *ДЕТАЛЬНАЯ СВОДКА РЕЗУЛЬТАТОВ*\n\n`;
        
        // Архетипы - детальная информация
        summary += `🧙‍♂️ *АРХЕТИПЫ:*\n`;
        if (results.archetypeScores) {
            // Сортируем по среднему баллу
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
                const isInDuel = results.duelArchetypes && results.duelArchetypes.includes(archetype);
                
                let prefix = '';
                if (isDominant) prefix = '★ ';
                if (isInDuel) prefix = '⚔️ ';
                
                summary += `${marker} ${prefix}${archetype}: ${avg}/5 (${score} баллов за ${count} вопросов)\n`;
                
                // Добавляем описание для активных архетипов
                if (isActive && window.AppState.data.archetypes) {
                    const archetypeData = window.AppState.data.archetypes[archetype];
                    if (archetypeData && archetypeData.short_description) {
                        summary += `   ${archetypeData.short_description.substring(0, 60)}...\n`;
                    }
                }
            }
        }
        
        // Сферы
        summary += `\n⚖️ *ЦЕЛОСТНОСТЬ ПО СФЕРАМ:*\n`;
        if (results.domainScores) {
            // Сортируем по среднему баллу
            const domainEntries = Object.entries(results.domainScores);
            domainEntries.sort((a, b) => {
                const avgA = results.domainCounts[a[0]] ? a[1] / results.domainCounts[a[0]] : 0;
                const avgB = results.domainCounts[b[0]] ? b[1] / results.domainCounts[b[0]] : 0;
                return avgA - avgB; // От меньшего к большему
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
                summary += `• ${domainName}: ${avg} баллов (${status})${focusMarker}${strengthMarker}\n`;
            }
        }
        
        // Рекомендации
        if (results.recommendations && results.recommendations.length > 0) {
            summary += `\n🧭 *КЛЮЧЕВЫЕ РЕКОМЕНДАЦИИ:*\n`;
            results.recommendations.slice(0, 5).forEach((rec, index) => {
                summary += `${index + 1}. ${rec}\n`;
            });
        }
        
        // Фокус на развитии
        if (results.focusStatement) {
            summary += `\n🎯 *ФОКУС НА РАЗВИТИИ:*\n`;
            summary += `Вопрос: "${results.focusStatement.questionText.substring(0, 100)}..."\n`;
            summary += `Сфера: ${window.AppState.getDomainName ? 
                window.AppState.getDomainName(results.focusStatement.domain) : results.focusStatement.domain}\n`;
            summary += `Архетип: ${results.focusStatement.archetype}\n`;
            summary += `Балл: ${results.focusStatement.points}/5\n`;
        }
        
        // Отправляем сводку
        await sendTextMessage(summary);
        
    } catch (error) {
        console.warn('Не удалось отправить сводку результатов:', error);
    }
}

async function sendTextMessage(text) {
    const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Разбиваем длинные сообщения
    const maxLength = 4000;
    if (text.length > maxLength) {
        const parts = [];
        while (text.length > 0) {
            parts.push(text.substring(0, maxLength));
            text = text.substring(maxLength);
        }
        
        for (const part of parts) {
            await fetch(url, {
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
            
            // Задержка между сообщениями
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
        const blob = await fetch(window.AppState.user.uploadedPhoto).then(r => r.blob());
        
        const formData = new FormData();
        formData.append('chat_id', window.APP_CONFIG.TELEGRAM_CHANNEL_ID);
        formData.append('photo', blob, 'client_photo.jpg');
        formData.append('caption', `Фото клиента для заказа ${window.AppState.user.orderId}`);
        
        const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.warn('Ошибка отправки фото:', error);
        }
        
    } catch (error) {
        console.warn('Не удалось отправить фото:', error);
    }
}

async function sendContractMessage(contractText) {
    try {
        const blob = new Blob([contractText], { type: 'text/plain' });
        
        const formData = new FormData();
        formData.append('chat_id', window.APP_CONFIG.TELEGRAM_CHANNEL_ID);
        formData.append('document', blob, `Договор_${window.AppState.user.orderId}.txt`);
        formData.append('caption', `📄 Договор по заказу ${window.AppState.user.orderId}\nКлиент: ${window.AppState.user.clientName}`);
        
        const url = `https://api.telegram.org/bot${window.APP_CONFIG.TELEGRAM_BOT_TOKEN}/sendDocument`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.warn('Ошибка отправки договора:', error);
        }
        
    } catch (error) {
        console.warn('Не удалось отправить договор:', error);
    }
}