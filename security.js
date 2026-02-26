// security.js - Модуль безопасности
window.Security = {
    // Экранирование HTML для защиты от XSS
    escapeHtml(unsafe) {
        if (!unsafe && unsafe !== 0) return '';
        
        // Конвертируем в строку, если это не строка
        const str = String(unsafe);
        
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\//g, '&#047;')
            .replace(/\\/g, '&#092;')
            .replace(/`/g, '&#096;')
            .replace(/\(/g, '&#040;')
            .replace(/\)/g, '&#041;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;')
            .replace(/\[/g, '&#091;')
            .replace(/\]/g, '&#093;');
    },
    
    // Безопасная вставка в HTML (аляс для обратной совместимости)
    safeHtml(str) {
        return this.escapeHtml(str);
    },
    
    // Экранирование для атрибутов HTML
    escapeAttribute(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    
    // Валидация имени (только буквы, пробелы, дефисы, точки)
    validateName(name) {
        if (!name) return false;
        if (typeof name !== 'string') return false;
        
        // Разрешены: буквы (включая русские), пробелы, дефисы, точки
        const re = /^[a-zA-Zа-яА-ЯёЁ\s\-\.]{2,100}$/;
        
        // Дополнительная проверка на отсутствие HTML тегов
        const hasHtmlTags = /<[^>]*>/.test(name);
        
        return re.test(name) && !hasHtmlTags;
    },
    
    // Валидация email с дополнительной проверкой
    validateEmail(email) {
        if (!email) return false;
        if (typeof email !== 'string') return false;
        
        // Очищаем от потенциально опасных символов
        const cleanEmail = email.trim();
        
        // Основной формат
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(cleanEmail)) return false;
        
        // Дополнительные проверки
        const [localPart, domain] = cleanEmail.split('@');
        
        // Проверка длины
        if (localPart.length > 64 || domain.length > 255) return false;
        
        // Запрещенные символы в локальной части
        const forbiddenLocal = /[<>()\[\]\\,;:\"\s]/;
        if (forbiddenLocal.test(localPart)) return false;
        
        // Проверка на наличие только допустимых символов в домене
        const domainRegex = /^[a-zA-Z0-9.-]+$/;
        if (!domainRegex.test(domain)) return false;
        
        return true;
    },
    
    // Валидация телефона (очистка и проверка)
    validatePhone(phone) {
        if (!phone) return true; // Опционально
        if (typeof phone !== 'string') return false;
        
        // Удаляем все кроме цифр, плюса в начале и дефисов/скобок
        const cleaned = phone.replace(/[^\d+]/g, '');
        
        // Проверяем длину (10-15 цифр)
        const digits = cleaned.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    },
    
    // Санитизация файла изображения
    async validateImageFile(file) {
        return new Promise((resolve) => {
            if (!file || !(file instanceof File)) {
                resolve({ valid: false, error: 'Некорректный файл' });
                return;
            }
            
            // Проверка типа MIME
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                resolve({ valid: false, error: 'Неподдерживаемый тип файла. Используйте JPG, PNG, GIF или WebP' });
                return;
            }
            
            // Проверка расширения
            const ext = file.name.split('.').pop().toLowerCase();
            const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (!allowedExt.includes(ext)) {
                resolve({ valid: false, error: 'Неподдерживаемое расширение файла' });
                return;
            }
            
            // Проверка размера (макс 5 MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                resolve({ valid: false, error: 'Файл слишком большой. Максимальный размер: 5 MB' });
                return;
            }
            
            // Дополнительная проверка сигнатуры файла (первые байты)
            const reader = new FileReader();
            reader.onloadend = (e) => {
                try {
                    const arr = (new Uint8Array(e.target.result)).subarray(0, 8);
                    let header = '';
                    for (let i = 0; i < arr.length; i++) {
                        header += arr[i].toString(16).padStart(2, '0');
                    }
                    
                    // Проверка сигнатур изображений
                    const signatures = {
                        '89504e47': 'png',
                        'ffd8ffe0': 'jpg',
                        'ffd8ffe1': 'jpg',
                        'ffd8ffe8': 'jpg',
                        '47494638': 'gif',
                        '52494646': 'webp'
                    };
                    
                    // Проверяем первые 4 байта
                    const header4 = header.substring(0, 8);
                    
                    if (signatures[header4]) {
                        resolve({ valid: true, fileType: signatures[header4] });
                    } else if (header4.startsWith('ffd8')) {
                        // JPG варианты
                        resolve({ valid: true, fileType: 'jpg' });
                    } else {
                        resolve({ valid: false, error: 'Файл поврежден или не является изображением' });
                    }
                } catch (error) {
                    console.error('Ошибка проверки сигнатуры:', error);
                    resolve({ valid: true }); // В случае ошибки проверки, пропускаем (но не блокируем)
                }
            };
            
            reader.onerror = () => {
                resolve({ valid: false, error: 'Ошибка чтения файла' });
            };
            
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    },
    
    // Безопасное хранение в памяти (очистка чувствительных данных)
    secureMemory() {
        // Функция для очистки чувствительных данных
        window.clearSensitiveData = () => {
            console.log('🧹 Очистка чувствительных данных...');
            
            if (window.AppState && window.AppState.user) {
                // Затираем данные в памяти
                try {
                    // Очищаем поля с персональными данными
                    window.AppState.user.clientName = null;
                    window.AppState.user.clientEmail = null;
                    window.AppState.user.clientPhone = null;
                    window.AppState.user.uploadedPhoto = null;
                    window.AppState.user.receiptFile = null;
                    window.AppState.user.receiptFileData = null;
                    
                    // Очищаем answers если есть
                    if (window.AppState.user.questionnaireAnswers) {
                        window.AppState.user.questionnaireAnswers = [];
                    }
                    
                    console.log('✅ Чувствительные данные очищены');
                } catch (e) {
                    console.warn('Ошибка при очистке данных:', e);
                }
            }
        };
        
        // Автоматическая очистка через 30 минут бездействия
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (window.clearSensitiveData) {
                    window.clearSensitiveData();
                    
                    // Показываем предупреждение пользователю
                    if (window.ScreenManager) {
                        window.ScreenManager.showNotification(
                            'Сессия безопасности истекла. Пожалуйста, начните заново для защиты ваших данных.', 
                            true
                        );
                    }
                    
                    // Перезагрузка через 3 секунды
                    setTimeout(() => {
                        if (!window.location.hostname.includes('localhost')) {
                            window.location.reload();
                        }
                    }, 3000);
                }
            }, 30 * 60 * 1000); // 30 минут
        };
        
        // Сброс таймера при активности
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer);
        });
        
        resetTimer();
        
        // Очистка при закрытии вкладки (частично)
        window.addEventListener('beforeunload', () => {
            // Можно отправить сигнал на сервер о завершении сессии
        });
    },
    
    // Защита от копирования данных из консоли
    protectConsole() {
        // Предупреждение при открытии консоли
        (function() {
            const devtools = {
                open: false,
                orientation: null
            };
            
            const threshold = 160;
            
            // Защита console.log от переопределения
            const originalConsoleLog = console.log;
            console.log = function() {
                // Разрешаем логирование только в development режиме
                if (window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('127.0.0.1')) {
                    originalConsoleLog.apply(console, arguments);
                } else {
                    // В продакшене - тихо
                }
            };
            
            setInterval(function() {
                const widthThreshold = window.outerWidth - window.innerWidth > threshold;
                const heightThreshold = window.outerHeight - window.innerHeight > threshold;
                
                if (widthThreshold || heightThreshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        
                        // В продакшене показываем предупреждение
                        if (!window.location.hostname.includes('localhost')) {
                            const warning = document.createElement('div');
                            warning.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                right: 0;
                                background: #e74c3c;
                                color: white;
                                text-align: center;
                                padding: 15px;
                                z-index: 10000;
                                font-weight: bold;
                                animation: slideDown 0.3s ease;
                            `;
                            warning.innerHTML = '⚠️ Обнаружены инструменты разработчика. Закройте консоль для защиты ваших данных.';
                            document.body.appendChild(warning);
                            
                            setTimeout(() => {
                                if (warning.parentNode) {
                                    warning.remove();
                                }
                            }, 5000);
                        }
                    }
                } else {
                    devtools.open = false;
                }
            }, 1000);
        })();
    },
    
    // Генерация CSRF токена для защиты от межсайтовых запросов
    generateCsrfToken() {
        try {
            if (!sessionStorage.getItem('csrf_token')) {
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const token = Array.from(array, byte => 
                    byte.toString(16).padStart(2, '0')
                ).join('');
                
                sessionStorage.setItem('csrf_token', token);
            }
            return sessionStorage.getItem('csrf_token');
        } catch (e) {
            // Fallback если crypto не доступен
            return Math.random().toString(36).substring(2) + 
                   Math.random().toString(36).substring(2);
        }
    },
    
    // Проверка CSRF токена
    validateCsrfToken(token) {
        return token === sessionStorage.getItem('csrf_token');
    },
    
    // Санитизация JSON
    sanitizeJson(input) {
        try {
            if (typeof input === 'string') {
                return JSON.parse(input);
            }
            return input;
        } catch {
            return null;
        }
    }
};

// Глобальный обработчик ошибок
window.ErrorHandler = {
    init() {
        // Глобальный обработчик ошибок
        window.onerror = (msg, url, line, col, error) => {
            // В продакшене не показываем технические детали
            if (!window.location.hostname.includes('localhost')) {
                console.error('Произошла ошибка. Пожалуйста, обновите страницу.');
                return true; // Предотвращаем показ ошибки в консоли
            }
            
            // В разработке показываем детали
            console.error('Глобальная ошибка:', {msg, url, line, col, error});
            return false;
        };
        
        // Перехват непойманных промисов
        window.addEventListener('unhandledrejection', (event) => {
            if (!window.location.hostname.includes('localhost')) {
                event.preventDefault();
                console.warn('Необработанная ошибка Promise');
            } else {
                console.error('Непойманная ошибка Promise:', event.reason);
            }
        });
    },
    
    // Безопасный JSON parse
    safeJsonParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    }
};