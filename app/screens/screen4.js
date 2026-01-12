// Экран 4: Договор
window.Screen4 = {
    // Рендеринг экрана
    render() {
        const container = document.getElementById('app-container');
        container.innerHTML = this.getHTML();
        
        // Инициализация событий ДОЛЖНА БЫТЬ ПОСЛЕ рендеринга
        setTimeout(() => {
            this.initEvents();
        }, 100);
        
        // Если договор уже сгенерирован, показываем его
        if (AppState.user.contractGenerated) {
            setTimeout(() => {
                this.showContract();
                this.showPreviewSection();
            }, 200);
        }
    },
    
    // HTML экрана
    getHTML() {
        const format = AppState.getSelectedFormat();
        const totalQuestions = AppState.data.questionnaire ? AppState.data.questionnaire.length : 0;
        const answeredQuestions = AppState.user.questionnaireAnswers.filter(a => a !== undefined).length;
        
        return `
            <div class="screen active" id="screen4">
                <div class="screen-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-file-contract"></i>
                        </div>
                        <div class="header-text">
                            <h1 class="screen-title">Договор-оферта и итоги заказа</h1>
                            <div class="screen-subtitle-container">
                                <p class="screen-subtitle">Это не просто формальность — это ритуал начала.</p>
                                <p class="screen-subtitle-description">
                                    Здесь ты подтверждаешь: «Да, я готов принять своё Зеркало Души».
                                    После подписания и оплаты мы немедленно начнём создавать твой персональный артефакт целостности — и уже через 24 часа ты увидишь первые образы.
                                    Всё, что нужно — указать имя и согласиться с условиями. Остальное — за нами. После формирования договора, ты перейдёшь к безопасной оплате через ЮKassa.
                                    Как только платёж пройдёт — мы начнём работу. Первые 4 варианта твоего образа пришлём в течение 24 часов.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <div class="summary-card">
                            <div class="summary-header">
                                <i class="fas fa-clipboard-check"></i>
                                <h3>Сводка заказа</h3>
                            </div>
                            <div class="summary-content">
                                <div class="summary-row">
                                    <span class="label">Выбранный формат:</span>
                                    <span class="value" id="summaryFormat">${format ? format.name : 'Не выбран'}</span>
                                </div>
                                <div class="summary-row">
                                    <span class="label">Прогресс анкеты:</span>
                                    <span class="value">${answeredQuestions}/${totalQuestions} вопросов</span>
                                </div>
                                <div class="summary-row">
                                    <span class="label">Определенный архетип:</span>
                                    <span class="value archetype-value">${AppState.user.archetype ? AppState.user.archetype.name : 'Не определен'}</span>
                                </div>
                                <div class="summary-row total">
                                    <span class="label">Итоговая стоимость:</span>
                                    <span class="value price-value">${format ? format.price.toLocaleString() + ' ₽' : '0 ₽'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="contract-container">
                    <div class="contract-form-section">
                        <div class="section-header">
                            <div class="section-title">
                                <i class="fas fa-user-edit"></i>
                                <h3>Ваши данные для договора</h3>
                            </div>
                            <div class="section-subtitle">Заполните поля ниже для формирования договора</div>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label" for="clientName">
                                    <i class="fas fa-user"></i>
                                    ФИО или Telegram-ник
                                    <span class="required">*</span>
                                </label>
                                <div class="input-wrapper">
                                    <input type="text" 
                                           class="form-input" 
                                           id="clientName" 
                                           placeholder="Иванов Иван Иванович"
                                           value="${AppState.user.clientName || ''}"
                                           autocomplete="name">
                                    <div class="input-icon">
                                        <i class="fas fa-check-circle ${AppState.user.clientName ? 'valid' : ''}"></i>
                                    </div>
                                </div>
                                <div class="form-hint">Как указать в договоре</div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="clientEmail">
                                    <i class="fas fa-envelope"></i>
                                    Электронная почта
                                    <span class="required">*</span>
                                </label>
                                <div class="input-wrapper">
                                    <input type="email" 
                                           class="form-input" 
                                           id="clientEmail" 
                                           placeholder="example@mail.ru"
                                           value="${AppState.user.clientEmail || ''}"
                                           autocomplete="email">
                                    <div class="input-icon">
                                        <i class="fas fa-check-circle ${this.isValidEmail(AppState.user.clientEmail || '') ? 'valid' : ''}"></i>
                                    </div>
                                </div>
                                <div class="form-hint">Для отправки договора и результатов</div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="clientPhone">
                                    <i class="fas fa-phone"></i>
                                    Номер телефона (опционально)
                                </label>
                                <div class="input-wrapper">
                                    <input type="tel" 
                                           class="form-input" 
                                           id="clientPhone" 
                                           placeholder="+7 (999) 123-45-67"
                                           value="${AppState.user.clientPhone || ''}"
                                           autocomplete="tel">
                                    <div class="input-icon">
                                        <i class="fas fa-check-circle ${this.isValidPhone(AppState.user.clientPhone || '') ? 'valid' : ''}"></i>
                                    </div>
                                </div>
                                <div class="form-hint">Для связи по вопросам заказа</div>
                            </div>
                        </div>
                        
                        <div class="agreement-section">
                            <div class="agreement-header">
                                <i class="fas fa-file-signature"></i>
                                <h4>Согласие с условиями</h4>
                            </div>
                            <div class="agreement-content">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="agreeDataProcessing" ${AppState.user.contractGenerated ? 'checked' : ''}>
                                    <label for="agreeDataProcessing">
                                        <span class="checkmark"></span>
                                        <span class="checkbox-text">
                                            Я даю согласие на обработку моих персональных данных (ФИО, фото, ответы на анкету) исключительно для выполнения услуги
                                        </span>
                                    </label>
                                </div>
                                <div class="checkbox-group">
                                    <input type="checkbox" id="agreeContractTerms" ${AppState.user.contractGenerated ? 'checked' : ''}>
                                    <label for="agreeContractTerms">
                                        <span class="checkmark"></span>
                                        <span class="checkbox-text">
                                            Я принимаю условия договора-оферты и подтверждаю свой заказ
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-primary" id="generateContractBtn" ${AppState.user.contractGenerated ? 'disabled' : ''}>
                                <i class="fas fa-file-signature"></i>
                                ${AppState.user.contractGenerated ? 'Договор сформирован' : 'Сформировать договор'}
                                ${AppState.user.contractGenerated ? '<i class="fas fa-check ml-1"></i>' : ''}
                            </button>
                        </div>
                    </div>
                    
                    <div class="contract-preview-section" id="contractPreviewSection" ${AppState.user.contractGenerated ? 'class="active"' : ''}>
                        <div class="preview-header">
                            <div class="preview-title">
                                <i class="fas fa-file-alt"></i>
                                <h3>Предварительный просмотр договора</h3>
                            </div>
                            <div class="preview-actions">
                                <button class="btn btn-outline btn-sm" id="copyContractBtn" ${!AppState.user.contractGenerated ? 'disabled' : ''}>
                                    <i class="fas fa-copy"></i> Копировать
                                </button>
                                <button class="btn btn-outline btn-sm" id="printContractBtn" ${!AppState.user.contractGenerated ? 'disabled' : ''}>
                                    <i class="fas fa-print"></i> Печать
                                </button>
                            </div>
                        </div>
                        
                        <div class="contract-preview-container">
                            ${!AppState.user.contractGenerated ? `
                                <div class="preview-placeholder" id="previewPlaceholder">
                                    <div class="placeholder-icon">
                                        <i class="fas fa-file-invoice"></i>
                                    </div>
                                    <div class="placeholder-text">
                                        <h4>Договор еще не сформирован</h4>
                                        <p>Заполните форму слева и нажмите "Сформировать договор"</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="contract-content" id="contractPreview" ${AppState.user.contractGenerated ? 'class="active"' : ''}>
                                <!-- Договор будет загружен здесь -->
                            </div>
                        </div>
                        
                        <div class="contract-signature" id="contractSignature" style="${!AppState.user.contractGenerated ? 'display: none;' : ''}">
                            <div class="signature-info">
                                <i class="fas fa-info-circle"></i>
                                <span>Договор считается заключенным с момента его формирования. Копия будет отправлена на ваш email.</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="navigation-buttons">
                    <button class="btn btn-outline" id="prevBtn">
                        <i class="fas fa-arrow-left"></i> Назад к выбору позы
                    </button>
                    <button class="btn btn-primary" id="nextBtn" ${AppState.user.contractGenerated ? '' : 'disabled'}>
                        <i class="fas fa-check-circle"></i> ${AppState.user.contractGenerated ? 'Все готово! Перейти к оплате' : 'Перейти к оплате'}
                    </button>
                </div>
                
                <div class="help-tip">
                    <i class="fas fa-info-circle"></i>
                    <span>После формирования договора вы получите его копию на email. Все данные защищены и не передаются третьим лицам.</span>
                </div>
            </div>
        `;
    },
    
    // Инициализация событий
    initEvents() {
        console.log('Инициализация событий Screen4');
        
        // Кнопка "Назад"
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                ScreenManager.prev();
            });
        }
        
        // Кнопка "Далее" (теперь ведет на оплату)
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                ScreenManager.next();
            });
        }
        
        // Кнопка "Сформировать договор"
        const generateBtn = document.getElementById('generateContractBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateContract();
            });
        }
        
        // Кнопка "Копировать договор"
        const copyBtn = document.getElementById('copyContractBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyContractToClipboard();
            });
        }
        
        // Кнопка "Печать договора"
        const printBtn = document.getElementById('printContractBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printContract();
            });
        }
        
        // Валидация формы в реальном времени
        const formInputs = ['clientName', 'clientEmail', 'clientPhone'];
        formInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.validateInput(id);
                    this.checkFormCompletion();
                });
                
                // Инициализируем валидацию при загрузке
                setTimeout(() => {
                    this.validateInput(id);
                }, 100);
            }
        });
        
        // Чекбоксы
        ['agreeDataProcessing', 'agreeContractTerms'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.checkFormCompletion();
                });
            }
        });
        
        // Инициализируем проверку формы
        setTimeout(() => {
            this.checkFormCompletion();
        }, 150);
    },
    
    // Валидация поля ввода
    validateInput(fieldId) {
        const input = document.getElementById(fieldId);
        const icon = input ? input.parentNode.querySelector('.input-icon i') : null;
        
        if (!input || !icon) return;
        
        let isValid = false;
        const value = input.value.trim();
        
        switch(fieldId) {
            case 'clientName':
                isValid = value.length >= 2;
                break;
            case 'clientEmail':
                isValid = this.isValidEmail(value);
                break;
            case 'clientPhone':
                // Телефон опционален, но если введен - проверяем
                isValid = value === '' || this.isValidPhone(value);
                break;
        }
        
        // Обновляем иконку
        if (value === '') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = isValid ? 'fas fa-check-circle valid' : 'fas fa-exclamation-circle invalid';
        }
        
        // Обновляем стиль input
        input.classList.toggle('valid', isValid && value !== '');
        input.classList.toggle('invalid', !isValid && value !== '');
    },
    
    // Проверка email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Проверка телефона
    isValidPhone(phone) {
        // Простая проверка - минимум 10 цифр
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    },
    
    // Проверка заполнения формы
    checkFormCompletion() {
        if (AppState.user.contractGenerated) {
            return true;
        }
        
        const name = document.getElementById('clientName');
        const email = document.getElementById('clientEmail');
        const phone = document.getElementById('clientPhone');
        const agreeData = document.getElementById('agreeDataProcessing');
        const agreeContract = document.getElementById('agreeContractTerms');
        
        if (!name || !email || !agreeData || !agreeContract) {
            return false;
        }
        
        const isValid = name.value.trim() && 
                       this.isValidEmail(email.value.trim()) && 
                       agreeData.checked && 
                       agreeContract.checked;
        
        const generateBtn = document.getElementById('generateContractBtn');
        if (generateBtn) {
            generateBtn.disabled = !isValid;
        }
        
        return isValid;
    },
    
    // Генерация договора
    generateContract() {
        if (!this.checkFormCompletion()) {
            ScreenManager.showNotification('Пожалуйста, заполните все обязательные поля корректно', true);
            return;
        }
        
        // Сохраняем данные клиента
        AppState.user.clientName = document.getElementById('clientName').value.trim();
        AppState.user.clientEmail = document.getElementById('clientEmail').value.trim();
        AppState.user.clientPhone = document.getElementById('clientPhone').value.trim();
        
        // Генерируем ID заказа
        if (!AppState.user.orderId) {
            AppState.generateOrderId();
        }
        
        // Рассчитываем архетип, если еще не рассчитан
        if (!AppState.user.archetype) {
            AppState.user.archetype = AppState.calculateArchetype();
        }
        
        // Показываем загрузку
        const generateBtn = document.getElementById('generateContractBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Формирование...';
        generateBtn.disabled = true;
        
        // Имитация загрузки
        setTimeout(() => {
            // Обновляем состояние
            AppState.user.contractGenerated = true;
            
            // Показываем договор
            this.showContract();
            
            // Показываем секцию предпросмотра
            this.showPreviewSection();
            
            // Активируем кнопки
            document.getElementById('nextBtn').disabled = false;
            document.getElementById('copyContractBtn').disabled = false;
            document.getElementById('printContractBtn').disabled = false;
            
            // Обновляем кнопку генерации
            generateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Договор сформирован <i class="fas fa-check ml-1"></i>';
            generateBtn.classList.add('success');
            
            // Обновляем навигационную кнопку
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.innerHTML = '<i class="fas fa-credit-card"></i> Все готово! Перейти к оплате';
            nextBtn.classList.add('ready');
            
            ScreenManager.showNotification('Договор успешно сформирован!', false);
            
            // Прокручиваем к договору
            document.getElementById('contractPreviewSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 1500);
    },
    
    // Показ секции предпросмотра
    showPreviewSection() {
        const section = document.getElementById('contractPreviewSection');
        const signature = document.getElementById('contractSignature');
        const placeholder = document.getElementById('previewPlaceholder');
        
        if (section) {
            section.classList.add('active');
        }
        if (signature) {
            signature.style.display = 'block';
            // Анимация появления
            setTimeout(() => {
                signature.classList.add('active');
            }, 100);
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    },
    
    // Показ договора
    showContract() {
        const container = document.getElementById('contractPreview');
        
        if (!AppState.data.contractTemplate || AppState.data.contractTemplate.length === 0) {
            container.innerHTML = `
                <div class="contract-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Шаблон договора не найден</h4>
                    <p>Пожалуйста, проверьте подключение к интернету</p>
                </div>
            `;
            return;
        }
        
        // Используем новую функцию для генерации HTML договора
        if (typeof generateContractHTML === 'function') {
            const contractHTML = generateContractHTML();
            container.innerHTML = contractHTML;
            
            // Показываем контент с анимацией
            setTimeout(() => {
                container.classList.add('active');
            }, 100);
        } else {
            container.innerHTML = `
                <div class="contract-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Ошибка генерации договора</h4>
                    <p>Функция generateContractHTML не найдена</p>
                </div>
            `;
        }
    },
    
    // Копирование договора в буфер обмена
    copyContractToClipboard() {
        if (typeof generateContractText === 'function') {
            const contractText = generateContractText();
            
            navigator.clipboard.writeText(contractText).then(() => {
                ScreenManager.showNotification('Договор скопирован в буфер обмена!', false);
                
                // Визуальная обратная связь
                const copyBtn = document.getElementById('copyContractBtn');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                copyBtn.classList.add('success');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('success');
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
                ScreenManager.showNotification('Не удалось скопировать договор', true);
            });
        } else {
            ScreenManager.showNotification('Функция генерации текста не найдена', true);
        }
    },
    
    // Получение договора как текста
    getContractAsText() {
        if (typeof generateContractText === 'function') {
            return generateContractText();
        }
        return 'Ошибка: функция генерации текста не найдена';
    },
    
    // Печать договора
    printContract() {
        if (!AppState.user.contractGenerated) {
            ScreenManager.showNotification('Сначала сформируйте договор', true);
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const contractText = this.getContractAsText();
        
        if (contractText.includes('Ошибка')) {
            ScreenManager.showNotification('Не удалось получить текст договора', true);
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Договор-оферта № ${AppState.user.orderId}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=PT+Serif&display=swap');
                    
                    body { 
                        font-family: 'PT Serif', serif; 
                        line-height: 1.6; 
                        padding: 40px; 
                        max-width: 800px;
                        margin: 0 auto;
                        color: #333;
                    }
                    .contract-header { 
                        text-align: center; 
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #333;
                    }
                    .contract-header h1 { 
                        font-size: 24px; 
                        margin-bottom: 10px;
                        font-weight: 700;
                    }
                    .contract-date { 
                        font-size: 16px; 
                        color: #666;
                        margin-bottom: 20px;
                    }
                    .contract-parties {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 40px;
                    }
                    .party {
                        width: 45%;
                        font-size: 15px;
                    }
                    .party-title {
                        font-weight: 700;
                        margin-bottom: 5px;
                        border-bottom: 1px solid #333;
                        padding-bottom: 3px;
                    }
                    .contract-section {
                        margin-bottom: 30px;
                        text-align: justify;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 700;
                        margin-bottom: 15px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #ccc;
                    }
                    .section-content {
                        font-size: 14.5px;
                    }
                    .contract-footer {
                        margin-top: 60px;
                        padding-top: 30px;
                        border-top: 2px solid #333;
                    }
                    .signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 50px;
                    }
                    .signature-block {
                        width: 45%;
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        margin: 40px 0 10px;
                        width: 100%;
                    }
                    .signature-label {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .signature-name {
                        font-weight: 700;
                        font-size: 16px;
                        margin-bottom: 5px;
                    }
                    .signature-note {
                        font-size: 12px;
                        color: #999;
                        font-style: italic;
                        margin-top: 5px;
                    }
                    .no-print { 
                        display: none; 
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                        .page-break { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                ${generateContractHTML()}
                <div class="no-print">
                    <button onclick="window.print()" style="
                        padding: 12px 24px;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-top: 30px;
                        display: block;
                        margin-left: auto;
                        margin-right: auto;
                    ">
                        <i class="fas fa-print"></i> Печатать договор
                    </button>
                    <p style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
                        Рекомендуется сохранить копию договора для ваших записей
                    </p>
                </div>
                <script>
                    // Добавляем иконки FontAwesome
                    const faScript = document.createElement('script');
                    faScript.src = 'https://kit.fontawesome.com/a076d05399.js';
                    faScript.crossOrigin = 'anonymous';
                    document.head.appendChild(faScript);
                    
                    // Автоматическая печать через 1 секунду
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
};