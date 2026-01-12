// Экран 1: Выбор формата модели
window.Screen1 = {
    // Рендеринг экрана
    render() {
        const container = document.getElementById('app-container');
        container.innerHTML = this.getHTML();
        
        // Инициализация событий
        this.initEvents();
        
        // Обновляем данные
        this.updateData();
    },
    
    // HTML экрана
    getHTML() {
        return `
            <div class="screen active">
                <div class="intro-header">
                    <h1 class="intro-title">Создание интегративного портрета</h1>
                    <p class="intro-subtitle">Выберите формат вашей будущей модели</p>
                </div>
                
                <div class="welcome-text">
                    <div class="welcome-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="welcome-content">
                        <p>🌟 <strong>Добро пожаловать в «Зеркало Души»</strong></p>
                        <p>Это не просто фигурка. Это твой внутренний образ, воплощённый в форме — чтобы ты мог увидеть себя вне социальных ролей, масок и ожиданий.</p>
                        <p>Архетип — это твой вечный внутренний голос: Мудрец, Творец, Искатель… Он показывает, как ты по-настоящему устроен.</p>
                        <p>А целостность по сферам (здоровье, отношения, дело) покажет, где ты в балансе — а где душа шепчет: «Обрати внимание».</p>
                        <p>Зачем это тебе? Чтобы ставить фигурку на стол — и помнить: «Это я. Целый. Настоящий. В потоке».</p>
                        <p><strong>Готов увидеть своё отражение? Выбери формат — и начни путь.</strong></p>
                    </div>
                </div>
                
                <div class="step1-container">
                    <div class="format-grid" id="formatGrid">
                        <div class="loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <div>Загрузка форматов...</div>
                        </div>
                    </div>
                </div>

                <div class="navigation-buttons">
                    <button class="btn" id="nextBtn" disabled>
                        <i class="fas fa-arrow-right"></i> Пройти анкету
                    </button>
                </div>
            </div>
        `;
    },
    
    // Обновление данных
    updateData() {
        const formatGrid = document.getElementById('formatGrid');
        
        if (!AppState.data.formats || Object.keys(AppState.data.formats).length === 0) {
            formatGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>Форматы моделей не найдены</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        const formats = Object.values(AppState.data.formats);
        
        formats.forEach((format, index) => {
            const isSelected = AppState.user.selectedFormat === format.id;
            html += `
                <div class="format-card ${isSelected ? 'selected' : ''}" 
                     data-format-id="${format.id}">
                    ${format.imageUrl ? `
                        <div class="format-image">
                            <img src="${format.imageUrl}" 
                                 alt="${format.name}" 
                                 loading="lazy"
                                 style="object-fit: contain; max-width: 100%; max-height: 200px;"
                                 onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                    <div class="format-number">${index + 1}</div>
                    <h3>${format.name}</h3>
                    <p class="format-description">${format.description}</p>
                    <div class="format-price">${format.price.toLocaleString()} ₽</div>
                </div>
            `;
        });
        
        formatGrid.innerHTML = html;
        
        // Обновляем выбор
        if (AppState.user.selectedFormat) {
            this.selectFormat(AppState.user.selectedFormat);
        }
    },
    
    // Инициализация событий
    initEvents() {
        // Выбор формата
        setTimeout(() => {
            document.querySelectorAll('.format-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const formatId = e.currentTarget.dataset.formatId;
                    this.selectFormat(formatId);
                });
            });
        }, 100);
        
        // Кнопка "Далее"
        document.getElementById('nextBtn').addEventListener('click', () => {
            ScreenManager.next();
        });
    },
    
    // Выбор формата
    selectFormat(formatId) {
        AppState.user.selectedFormat = formatId;
        
        // Снимаем выделение со всех карточек
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Выделяем выбранную карточку
        const selectedCard = document.querySelector(`[data-format-id="${formatId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Активируем кнопку "Далее"
        document.getElementById('nextBtn').disabled = false;
    }
};