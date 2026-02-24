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
                                <i class="fas fa-wallet"></i>
                                <h3>Способы оплаты</h3>
                            </div>
                            <div class="methods-grid">
                                <div class="method-card" data-method="bank-card">
                                    <div class="method-icon">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <div class="method-info">
                                        <div class="method-name">Банковская карта</div>
                                        <div class="method-description">Visa, Mastercard, Мир</div>
                                    </div>
                                </div>
                                <div class="method-card" data-method="yoomoney">
                                    <div class="method-icon">
                                        <i class="fas fa-wallet"></i>
                                    </div>
                                    <div class="method-info">
                                        <div class="method-name">ЮMoney</div>
                                        <div class="method-description">Кошелёк или карта</div>
                                    </div>
                                </div>
                                <div class="method-card" data-method="sberbank">
                                    <div class="method-icon">
                                        <i class="fas fa-university"></i>
                                    </div>
                                    <div class="method-info">
                                        <div class="method-name">Сбербанк Онлайн</div>
                                        <div class="method-description">По QR-коду или номеру телефона</div>
                                    </div>
                                </div>
                                <div class="method-card" data-method="tinkoff">
                                    <div class="method-icon">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="method-info">
                                        <div class="method-name">Тинькофф</div>
                                        <div class="method-description">По номеру телефона</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-action">
                        <div class="action-card">
                            <div class="action-header">
                                <i class="fas fa-lock"></i>
                                <h3>Безопасная оплата</h3>
                            </div>
                            <div class="action-content">
                                <div class="security-info">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Все платежи защищены SSL-шифрованием</span>
                                </div>
                                <div class="privacy-info">
                                    <i class="fas fa-user-shield"></i>
                                    <span>Ваши данные не передаются третьим лицам</span>
                                </div>
                                
                                <div class="payment-terms">
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="agreePaymentTerms">
                                        <label for="agreePaymentTerms">
                                            <span class="checkmark"></span>
                                            <span class="checkbox-text">
                                                Я согласен с условиями оказания услуг и политикой конфиденциальности
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                
                                <button class="btn btn-primary btn-lg" id="processPaymentBtn">
                                    <i class="fas fa-lock"></i>
                                    Перейти к безопасной оплате
                                </button>
                                
                                <div class="payment-note">
                                    <i class="fas fa-info-circle"></i>
                                    <span>После успешной оплаты вы сразу получите доступ к результатам</span>
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
                    <span>Оплата происходит через защищенное соединение. После оплаты результаты будут отправлены вам на email и доступны в личном кабинете.</span>
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
        
        // Выбор способа оплаты
        const methodCards = document.querySelectorAll('.method-card');
        methodCards.forEach(card => {
            card.addEventListener('click', () => {
                methodCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
        
        // Кнопка оплаты
        const paymentBtn = document.getElementById('processPaymentBtn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', async () => {
                await this.processPayment();
            });
        }
        
        // Чекбокс согласия
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        if (agreeCheckbox) {
            agreeCheckbox.addEventListener('change', () => {
                this.updatePaymentButton();
            });
        }
        
        this.updatePaymentButton();
    },
    
    // Обновление состояния кнопки оплаты
    updatePaymentButton() {
        const agreeCheckbox = document.getElementById('agreePaymentTerms');
        const paymentBtn = document.getElementById('processPaymentBtn');
        
        if (agreeCheckbox && paymentBtn) {
            paymentBtn.disabled = !agreeCheckbox.checked;
        }
    },
    
    // Обработка оплаты
    async processPayment() {
        const paymentBtn = document.getElementById('processPaymentBtn');
        if (!paymentBtn) return;
        
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка оплаты...';
        paymentBtn.disabled = true;
        
        try {
            // 1. Сначала отправляем данные в Telegram
            if (typeof window.sendOrderToTelegram === 'function') {
                await window.sendOrderToTelegram();
                console.log('✅ Данные отправлены в Telegram');
            } else {
                console.warn('Функция отправки в Telegram не найдена');
            }
            
            // 2. Имитация успешной оплаты (заглушка)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 3. Обновляем состояние
            AppState.user.paymentCompleted = true;
            
            // 4. Показываем успешное сообщение
            ScreenManager.showNotification('Оплата успешно завершена!', false);
            
            // 5. Переходим на экран результатов
            setTimeout(() => {
                Screen5.render();
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка обработки оплаты:', error);
            ScreenManager.showNotification('Ошибка обработки оплаты: ' + error.message, true);
            
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