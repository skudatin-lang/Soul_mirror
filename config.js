// config.js - конфигурация приложения
window.APP_CONFIG = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzqAWp4O2L-Y26Rc62n2d_BPpsY4pm4qJZ8Xc2n38gn2_HJ5D-5M9F2IlIVDy4ND0en/exec",
    TELEGRAM_CONFIG_LOADED: false,
    MAX_PHOTO_SIZE: 5 * 1024 * 1024,
    PRICES: { full: 12000, mini: 12000 }
};

// Оставляем функцию для обратной совместимости, но токен теперь не нужен
window.loadTelegramConfig = async function() {
    window.APP_CONFIG.TELEGRAM_CONFIG_LOADED = true;
    return true;
};
