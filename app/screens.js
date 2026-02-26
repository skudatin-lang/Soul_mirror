// Управление экранами приложения
window.ScreenManager = {
    currentScreen: 1,
    
    // Загрузка экрана
    load(screenNumber) {
        this.currentScreen = screenNumber;
        
        // Обновляем прогресс-бар
        this.updateProgressBar(screenNumber);
        
        // Загружаем нужный экран
        switch(screenNumber) {
            case 1:
                Screen1.render();
                break;
            case 2:
                Screen2.render();
                break;
            case 3:
                Screen3.render();
                break;
            case 4:
                if (AppState.user.contractGenerated) {
                    if (!AppState.user.archetype) {
                        AppState.user.archetype = AppState.calculateArchetype();
                    }
                    if (!AppState.user.orderId) {
                        AppState.generateOrderId();
                    }
                }
                Screen4.render();
                break;
            case 5:
                if (!AppState.user.paymentCompleted) {
                    this.showPaymentPage();
                    return;
                }
                Screen5.render();
                break;
        }
        
        this.scrollToTop();
    },
    
    scrollToTop() {
        setTimeout(() => {
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 50);
    },
    
    // Показать страницу оплаты
    showPaymentPage() {
        const container = document.getElementById('app-container');
        
        const format = AppState.getSelectedFormat();
        const results = AppState.user.archetypeResults || {};
        
        // Безопасное экранирование данных
        const safeOrderId = window.Security ? 
            window.Security.escapeHtml(AppState.user.orderId || 'Не указан') : 
            (AppState.user.orderId || 'Не указан');
            
        const safeClientName = window.Security ? 
            window.Security.escapeHtml(AppState.user.clientName || 'Не указано') : 
            (AppState.user.clientName || 'Не указано');
            
        const safeFormatName = format ? 
            (window.Security ? window.Security.escapeHtml(format.name) : format.name) : 
            '3D модель Зеркало Души';
            
        const safeArchetypeValue = results.dominantArchetype || AppState.user.archetype?.name || 'Не определен';
        const safeArchetype = window.Security ? 
            window.Security.escapeHtml(safeArchetypeValue) : 
            safeArchetypeValue;
            
        const safePrice = format && format.price ? 
            format.price.toLocaleString() + ' ₽' : 
            '12 000 ₽';
        
        container.innerHTML = `
            <div class="screen active" id="paymentScreen">
                <div class="screen-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="header-text">
                            <h1 class="screen-title">Оплата заказа</h1>
                            <p class="screen-subtitle">Завершите оформление, чтобы получить результаты</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-container">
                    <div class="payment-info">
                        <div class="payment-card">
                            <div class="payment-header">
                                <i class="fas fa-shopping-cart"></i>
                                <h3>Детали заказа</h3>
                            </div>
                            <div class="payment-content">
                                <div class="payment-row">
                                    <span class="label">Номер заказа:</span>
                                    <span class="value">${safeOrderId}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Клиент:</span>
                                    <span class="value">${safeClientName}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Услуга:</span>
                                    <span class="value">${safeFormatName}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Определенный архетип:</span>
                                    <span class="value archetype-value">${safeArchetype}</span>
                                </div>
                                <div class="payment-row total">
                                    <span class="label">К оплате:</span>
                                    <span class="value price-value">${safePrice}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="payment-methods">
                            <div class="methods-header">
                                <i class="fas fa-info-circle"></i>
                                <h3>Способ оплаты</h3>
                            </div>
                            <div class="payment-info-card">
                                <div class="info-icon">
                                    <i class="fas fa-university"></i>
                                </div>
                                <div class="info-content">
                                    <h4>Перевод по номеру телефона</h4>
                                    <p>На данный момент онлайн-оплата находится в разработке. Для завершения заказа, пожалуйста, выполните перевод по номеру телефона в Т-Банк (бывший Тинькофф):</p>
                                    
                                    <div class="bank-details">
                                        <div class="detail-row">
                                            <span class="detail-label">Банк:</span>
                                            <span class="detail-value">Т-Банк (Тинькофф)</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Номер телефона:</span>
                                            <span class="detail-value highlight">8 (977) 714-53-25</span>
                                            <button class="copy-btn" id="copyPhoneBtn">
                                                <i class="far fa-copy"></i>
                                            </button>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Получатель:</span>
                                            <span class="detail-value">Константин С.</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Сумма:</span>
                                            <span class="detail-value price">${safePrice}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="payment-note-important" style="background: #e3f2fd; border-color: #90caf9;">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Если у вас нет Т-Банка, перевод можно сделать через СБП (Система быстрых платежей) любого банка по номеру телефона</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-action">
                        <div class="action-card">
                            <div class="action-header">
                                <i class="fas fa-file-invoice"></i>
                                <h3>Подтверждение оплаты</h3>
                            </div>
                            <div class="action-content">
                                <div class="upload-receipt-section">
                                    <p>После выполнения перевода, пожалуйста, загрузите скриншот подтверждения оплаты:</p>
                                    
                                    <div class="receipt-upload-area" id="receiptUploadArea">
                                        <input type="file" id="receiptFile" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;">
                                        <div class="upload-placeholder" id="uploadPlaceholder">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <span>Нажмите для загрузки скриншота</span>
                                            <span class="file-types">Поддерживаются JPG, PNG, GIF, WebP (до 5 MB)</span>
                                        </div>
                                        <div class="upload-preview" id="uploadPreview" style="display: none;">
                                            <i class="fas fa-file-image"></i>
                                            <span id="fileName"></span>
                                            <button class="remove-file" id="removeFileBtn">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div id="fileSizeError" class="file-error" style="display: none;">
                                        <i class="fas fa-exclamation-triangle"></i> Файл слишком большой. Максимальный размер: 5 MB
                                    </div>
                                    <div id="fileTypeError" class="file-error" style="display: none;">
                                        <i class="fas fa-exclamation-triangle"></i> Неподдерживаемый тип файла. Используйте JPG, PNG, GIF или WebP
                                    </div>
                                </div>
                                
                                <div class="payment-terms">
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="agreePaymentTerms">
                                        <label for="agreePaymentTerms">
                                            <span class="checkmark"></span>
                                            <span class="checkbox-text">
                                                Я подтверждаю, что выполнил(а) перевод согласно условиям договора
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                
                                <input type="hidden" id="csrfToken" value="${window.Security ? window.Security.generateCsrfToken() : ''}">
                                
                                <button class="btn btn-primary btn-lg" id="processPaymentBtn" disabled>
                                    <i class="fas fa-check-circle"></i>
                                    Отправить подтверждение
                                </button>
                                
                                <div class="payment-note">
                                    <i class="fas fa-clock"></i>
                                    <span>После проверки оплаты администратором (обычно в течение 1-2 часов) вы получите доступ к результатам на email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="navigation-buttons">
                    <button class="btn btn-outline" id="paymentPrevBtn">
                        <i class="fas fa-arrow-left"></i> Назад к договору
                    </button>
                    <button class="btn btn-outline" id="paymentSkipBtn">
                        <i class="fas fa-file-alt"></i> Просмотреть договор
                    </button>
                </div>
                
                <div class="help-tip">
                    <i class="fas fa-info-circle"></i>
                    <span>Оплата производится переводом по номеру телефона в Т-Банк согласно договору-оферте. После загрузки скриншота администратор проверит оплату и активирует доступ к результатам.</span>
                </div>
            </div>
        `;
        
        this.scrollToTop();
        
        setTimeout(() => {
            this.initPaymentEvents();
        }, 100);
    },
    
    // Инициализация событий оплаты
    initPaymentEvents() {
        console.log('Инициализация событий оплаты');
        
        const prevBtn = document.getElementById('paymentPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.load(4);
            });
        }
        
        const skipBtn = document.getElementById('paymentSkipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.load(4);
            });
        }
        
        const copyBtn = document.getElementById('copyPhoneBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const phoneNumber = '89777145325';
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    this.showNotification('Номер телефона скопирован', false);
                    
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                }).catch(err => {
                    console.error('Ошибка копирования:', err);
                    this.showNotification('Не удалось скопировать номер', true);
                });
            });
        }
        
        const fileInput = document.getElementById('receiptFile');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const fileNameSpan = document.getElementById('fileName');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const fileSizeError = document.getElementById('fileSizeError');
        const fileTypeError = document.getElementById('fileTypeError');
        
        if (fileInput && uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => {
                fileInput.click();
            });
            
            const uploadArea = document.getElementById('receiptUploadArea');
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleFileSelect(e.dataTransfer.files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
        
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (fileInput) {
                    fileInput.value = '';
                }
                if (uploadPreview) {
                    uploadPreview.style.display = 'none';
                }
                if (uploadPlaceholder) {
                    uploadPlaceholder.style.display = 'flex';
                }
                if (fileSizeError) {
                    fileSizeError.style.display = 'none';
                }
                if (fileTypeError) {
                    fileTypeError.style.display = 'none';
                }
                
                // Очищаем данные чека
                AppState.user.receiptFile = null;
                AppState.user.receiptFileData = null;
                
                this.updatePaymentButton();
            });
        }
        
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        if (agreeCheckbox) {
            agreeCheckbox.addEventListener('change', () => {
                this.updatePaymentButton();
            });
        }
        
        const paymentBtn = document.getElementById('processPaymentBtn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', async () => {
                await this.processPayment();
            });
        }
        
        this.updatePaymentButton();
    },
    
    // Обработка выбора файла с валидацией через Security
    async handleFileSelect(file) {
        const fileSizeError = document.getElementById('fileSizeError');
        const fileTypeError = document.getElementById('fileTypeError');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const fileNameSpan = document.getElementById('fileName');
        
        // Скрываем предыдущие ошибки
        if (fileSizeError) fileSizeError.style.display = 'none';
        if (fileTypeError) fileTypeError.style.display = 'none';
        
        // Валидация через Security модуль
        if (window.Security) {
            const validation = await window.Security.validateImageFile(file);
            
            if (!validation.valid) {
                if (validation.error && validation.error.includes('размер')) {
                    if (fileSizeError) fileSizeError.style.display = 'block';
                } else if (validation.error && (validation.error.includes('тип') || validation.error.includes('расширение'))) {
                    if (fileTypeError) fileTypeError.style.display = 'block';
                } else {
                    this.showNotification(validation.error || 'Ошибка валидации файла', true);
                }
                return;
            }
        } else {
            // Fallback валидация
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                if (fileSizeError) fileSizeError.style.display = 'block';
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                if (fileTypeError) fileTypeError.style.display = 'block';
                return;
            }
        }
        
        // Сохраняем метаданные файла
        AppState.user.receiptFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
        
        // Читаем файл для отправки (безопасно)
        const reader = new FileReader();
        reader.onload = (e) => {
            // Сохраняем только если это действительно изображение
            if (e.target.result && e.target.result.startsWith('data:image/')) {
                AppState.user.receiptFileData = e.target.result;
                console.log('✅ Файл чека загружен:', file.name);
            } else {
                this.showNotification('Файл поврежден или не является изображением', true);
                AppState.user.receiptFile = null;
                AppState.user.receiptFileData = null;
                return;
            }
        };
        reader.readAsDataURL(file);
        
        // Показываем превью
        if (uploadPlaceholder && uploadPreview && fileNameSpan) {
            uploadPlaceholder.style.display = 'none';
            fileNameSpan.textContent = file.name.length > 30 ? 
                file.name.substring(0, 27) + '...' : 
                file.name;
            uploadPreview.style.display = 'flex';
        }
        
        this.updatePaymentButton();
    },
    
    // Обновление состояния кнопки оплаты
    updatePaymentButton() {
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        const paymentBtn = document.getElementById('processPaymentBtn');
        
        if (agreeCheckbox && paymentBtn) {
            // Проверяем, что файл загружен и данные прочитаны
            const hasFile = AppState.user.receiptFile !== null;
            const hasFileData = AppState.user.receiptFileData !== null;
            paymentBtn.disabled = !(agreeCheckbox.checked && hasFile && hasFileData);
        }
    },
    
    // Обработка оплаты с проверкой CSRF
    async processPayment() {
        const paymentBtn = document.getElementById('processPaymentBtn');
        const csrfToken = document.getElementById('csrfToken');
        
        if (!paymentBtn) return;
        
        // Проверка CSRF токена
        if (window.Security && csrfToken) {
            if (!window.Security.validateCsrfToken(csrfToken.value)) {
                this.showNotification('Ошибка безопасности. Пожалуйста, обновите страницу.', true);
                return;
            }
        }
        
        // Дополнительная проверка наличия файла
        if (!AppState.user.receiptFile || !AppState.user.receiptFileData) {
            this.showNotification('Пожалуйста, загрузите чек об оплате', true);
            paymentBtn.disabled = false;
            return;
        }
        
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка подтверждения...';
        paymentBtn.disabled = true;
        
        try {
            AppState.user.paymentConfirmed = true;
            AppState.user.paymentDate = new Date().toISOString();
            
            // === ИСПРАВЛЕНИЕ: Правильная передача данных чека ===
            // Создаем объект с полными данными для отправки в Telegram
            window.receiptFileToSend = {
                name: AppState.user.receiptFile.name,
                size: AppState.user.receiptFile.size,
                type: AppState.user.receiptFile.type,
                dataUrl: AppState.user.receiptFileData  // Это поле ожидает sendReceiptMessage
            };
            
            console.log('📤 Подготовка к отправке чека:', window.receiptFileToSend.name);
            
            if (typeof window.sendOrderToTelegram === 'function') {
                await window.sendOrderToTelegram();
                console.log('✅ Данные отправлены в Telegram');
            } else {
                console.warn('Функция отправки в Telegram не найдена');
                // Имитация успешной отправки для тестирования
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Очищаем временную переменную после отправки
            setTimeout(() => {
                delete window.receiptFileToSend;
            }, 1000);
            
            this.showNotification('Подтверждение оплаты отправлено! Администратор проверит платеж в ближайшее время.', false);
            
            AppState.user.paymentUnderReview = true;
            
            setTimeout(() => {
                if (typeof Screen5 !== 'undefined' && Screen5.render) {
                    Screen5.render({ paymentUnderReview: true });
                } else {
                    this.load(5);
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ Ошибка отправки подтверждения:', error);
            this.showNotification('Ошибка отправки подтверждения: ' + 
                (error.message || 'Попробуйте еще раз'), true);
            
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;
            
            // Очищаем временную переменную в случае ошибки
            delete window.receiptFileToSend;
        }
    },
    
    updateProgressBar(step) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((stepElement, index) => {
            const stepNumber = parseInt(stepElement.dataset.step);
            if (stepNumber <= step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
    },
    
    next() {
        switch(this.currentScreen) {
            case 1:
                if (!AppState.user.selectedFormat) {
                    alert('Пожалуйста, выберите формат модели');
                    return;
                }
                AppState.resetQuestionnaire();
                this.load(2);
                break;
                
            case 2:
                const totalQuestions = AppState.data.questionnaire.length;
                const answeredQuestions = AppState.user.questionnaireAnswers.filter(a => a !== undefined).length;
                
                if (answeredQuestions < totalQuestions) {
                    alert('Пожалуйста, ответьте на все вопросы анкеты');
                    return;
                }
                this.load(3);
                break;
                
            case 3:
                if (!AppState.user.selectedPose || !AppState.user.uploadedPhoto) {
                    alert('Пожалуйста, выберите позу и загрузите фото');
                    return;
                }
                this.load(4);
                break;
                
            case 4:
                if (!AppState.user.contractGenerated) {
                    alert('Пожалуйста, сформируйте договор');
                    return;
                }
                this.showPaymentPage();
                break;
                
            case 5:
                AppState.resetAll();
                this.load(1);
                break;
        }
    },
    
    prev() {
        if (this.currentScreen > 1) {
            this.load(this.currentScreen - 1);
        }
    },
    
    showNotification(message, isError = false) {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification' + (isError ? ' error' : '');
        
        // Экранируем сообщение для безопасности
        const safeMessage = window.Security ? 
            window.Security.escapeHtml(message) : 
            message.replace(/[<>]/g, '');
        
        notification.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
            <span>${safeMessage}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
};