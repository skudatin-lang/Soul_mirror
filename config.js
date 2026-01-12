window.APP_CONFIG = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzqAWp4O2L-Y26Rc62n2d_BPpsY4pm4qJZ8Xc2n38gn2_HJ5D-5M9F2IlIVDy4ND0en/exec",
    // Telegram данные будут загружаться динамически из таблицы для безопасности
    TELEGRAM_CONFIG_LOADED: false,
    MAX_PHOTO_SIZE: 5 * 1024 * 1024,
    PRICES: {
        full: 12000,
        mini: 12000
    }
};

// Безопасная загрузка Telegram конфигурации
window.loadTelegramConfig = async function() {
    try {
        const response = await fetch(`${window.APP_CONFIG.WEB_APP_URL}?sheet=telegram_config`);
        const data = await response.json();
        
        if (data && !data.error) {
            const config = data[0]; // Первая строка из таблицы
            window.APP_CONFIG.TELEGRAM_BOT_TOKEN = config.bot_token || '';
            window.APP_CONFIG.TELEGRAM_CHANNEL_ID = config.channel_id || '';
            window.APP_CONFIG.TELEGRAM_CONFIG_LOADED = true;
            console.log('Telegram config loaded securely');
            return true;
        }
    } catch (error) {
        console.error('Error loading Telegram config:', error);
    }
    return false;
};