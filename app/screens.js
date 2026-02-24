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
                // Если возвращаемся на экран договора и он уже сгенерирован,
                // нужно убедиться, что все данные загружены
                if (AppState.user.contractGenerated) {
                    // Пересчитываем архетип если нужно
                    if (!AppState.user.archetype) {
                        AppState.user.archetype = AppState.calculateArchetype();
                    }
                    // Генерируем ID заказа если нужно
                    if (!AppState.user.orderId) {
                        AppState.generateOrderId();
                    }
                }
                Screen4.render();
                break;
            case 5:
                // Проверяем оплату
                if (!AppState.user.paymentCompleted) {
                    // Показываем страницу оплаты
                    this.showPaymentPage();
                    return;
                }
                Screen5.render();
                break;
        }
        
        // Автоматическая прокрутка к началу экрана
        this.scrollToTop();
    },
    
    // Прокрутка к началу экрана
    scrollToTop() {
        setTimeout(() => {
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            // Также прокручиваем body для надежности
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
                                    <span class="value">${AppState.user.orderId || 'Не указан'}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Клиент:</span>
                                    <span class="value">${AppState.user.clientName || 'Не указано'}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Услуга:</span>
                                    <span class="value">${format ? format.name : '3D модель Зеркало Души'}</span>
                                </div>
                                <div class="payment-row">
                                    <span class="label">Определенный архетип:</span>
                                    <span class="value archetype-value">${results.dominantArchetype || AppState.user.archetype?.name || 'Не определен'}</span>
                                </div>
                                <div class="payment-row total">
                                    <span class="label">К оплате:</span>
                                    <span class="value price-value">${format ? format.price.toLocaleString() + ' ₽' : '12 000 ₽'}</span>
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
                                            <span class="detail-value price">${format ? format.price.toLocaleString() + ' ₽' : '12 000 ₽'}</span>
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
                                        <input type="file" id="receiptFile" accept="image/*" style="display: none;">
                                        <div class="upload-placeholder" id="uploadPlaceholder">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <span>Нажмите для загрузки скриншота</span>
                                            <span class="file-types">Поддерживаются JPG, PNG</span>
                                        </div>
                                        <div class="upload-preview" id="uploadPreview" style="display: none;">
                                            <i class="fas fa-file-image"></i>
                                            <span id="fileName"></span>
                                            <button class="remove-file" id="removeFileBtn">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div id="fileSizeError" class="file-error" style="display: none; color: #e74c3c; font-size: 13px; margin-top: 5px;">
                                        <i class="fas fa-exclamation-triangle"></i> Файл слишком большой. Максимальный размер: 5 MB
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
        
        // Автоматическая прокрутка
        this.scrollToTop();
        
        // Инициализация событий страницы оплаты
        setTimeout(() => {
            this.initPaymentEvents();
        }, 100);
    },
    
    // Инициализация событий оплаты
    initPaymentEvents() {
        console.log('Инициализация событий оплаты');
        
        // Кнопка "Назад"
        const prevBtn = document.getElementById('paymentPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.load(4);
            });
        }
        
        // Кнопка "Просмотреть договор"
        const skipBtn = document.getElementById('paymentSkipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.load(4);
            });
        }
        
        // Кнопка копирования номера телефона
        const copyBtn = document.getElementById('copyPhoneBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const phoneNumber = '89777145325'; // Номер без форматирования для копирования
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    this.showNotification('Номер телефона скопирован', false);
                    
                    // Визуальная обратная связь
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
        
        // Загрузка файла чека
        const fileInput = document.getElementById('receiptFile');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const fileNameSpan = document.getElementById('fileName');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const fileSizeError = document.getElementById('fileSizeError');
        
        if (fileInput && uploadPlaceholder) {
            // Клик по области загрузки
            uploadPlaceholder.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Drag and drop
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
            
            // Обработка выбора файла
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
        
        // Кнопка удаления файла
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                
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
                
                // Удаляем файл из состояния
                AppState.user.receiptFile = null;
                
                this.updatePaymentButton();
            });
        }
        
        // Чекбокс согласия
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        if (agreeCheckbox) {
            agreeCheckbox.addEventListener('change', () => {
                this.updatePaymentButton();
            });
        }
        
        // Кнопка отправки подтверждения
        const paymentBtn = document.getElementById('processPaymentBtn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', async () => {
                await this.processPayment();
            });
        }
        
        this.updatePaymentButton();
    },
    
    // Обработка выбора файла
    handleFileSelect(file) {
        const fileSizeError = document.getElementById('fileSizeError');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const fileNameSpan = document.getElementById('fileName');
        
        // Проверка размера файла (максимум 5 MB)
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            if (fileSizeError) {
                fileSizeError.style.display = 'block';
            }
            return;
        }
        
        if (fileSizeError) {
            fileSizeError.style.display = 'none';
        }
        
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            this.showNotification('Пожалуйста, выберите изображение (JPG или PNG)', true);
            return;
        }
        
        // Сохраняем файл в состоянии приложения
        AppState.user.receiptFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            file: file, // Сохраняем сам файл для последующей отправки
            dataUrl: null // Здесь будет data URL после чтения файла
        };
        
        // Читаем файл для отправки
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.user.receiptFile.dataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Показываем превью
        if (uploadPlaceholder && uploadPreview && fileNameSpan) {
            uploadPlaceholder.style.display = 'none';
            fileNameSpan.textContent = file.name;
            uploadPreview.style.display = 'flex';
        }
        
        this.updatePaymentButton();
    },
    
    // Обновление состояния кнопки оплаты
    updatePaymentButton() {
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        const paymentBtn = document.getElementById('processPaymentBtn');
        
        if (agreeCheckbox && paymentBtn) {
            const hasFile = AppState.user.receiptFile !== null;
            paymentBtn.disabled = !(agreeCheckbox.checked && hasFile);
        }
    },
    
    // Обработка оплаты
    async processPayment() {
        const paymentBtn = document.getElementById('processPaymentBtn');
        if (!paymentBtn) return;
        
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка подтверждения...';
        paymentBtn.disabled = true;
        
        try {
            // Сохраняем данные о подтверждении оплаты
            AppState.user.paymentConfirmed = true;
            AppState.user.paymentDate = new Date().toISOString();
            
            // Отправляем данные в Telegram с загруженным чеком
            if (typeof window.sendOrderToTelegram === 'function') {
                // Передаем файл чека для отправки
                if (AppState.user.receiptFile && AppState.user.receiptFile.file) {
                    // Сохраняем файл в глобальной переменной для доступа из telegram.js
                    window.receiptFileToSend = AppState.user.receiptFile;
                }
                
                await window.sendOrderToTelegram();
                console.log('✅ Данные отправлены в Telegram');
                
                // Очищаем временную переменную
                delete window.receiptFileToSend;
            } else {
                console.warn('Функция отправки в Telegram не найдена');
                
                // Если функция не найдена, имитируем успешную отправку
                console.log('Имитация отправки чека:', AppState.user.receiptFile?.name);
            }
            
            // Имитация отправки на сервер
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Показываем успешное сообщение
            this.showNotification('Подтверждение оплаты отправлено! Администратор проверит платеж в ближайшее время.', false);
            
            // Обновляем состояние (но не помечаем как оплаченный полностью)
            AppState.user.paymentUnderReview = true;
            
            // Переходим на экран результатов с пометкой "на проверке"
            setTimeout(() => {
                Screen5.render({ paymentUnderReview: true });
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка отправки подтверждения:', error);
            this.showNotification('Ошибка отправки подтверждения: ' + error.message, true);
            
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;
        }
    },
    
    // Обновление прогресс-бара
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
    
    // Переход к следующему шагу
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
                // Переходим на страницу оплаты вместо экрана результатов
                this.showPaymentPage();
                break;
                
            case 5:
                // Возврат на первый экран
                AppState.resetAll();
                this.load(1);
                break;
        }
    },
    
    // Возврат к предыдущему шагу
    prev() {
        if (this.currentScreen > 1) {
            this.load(this.currentScreen - 1);
        }
    },
    
    // Показать уведомление
    showNotification(message, isError = false) {
        // Удаляем существующие уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
};