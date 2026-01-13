// Экран 2: Анкета (обновлённая для новой структуры)
window.Screen2 = {
    currentQuestionIndex: 0,
    
    // Рендеринг экрана
    render() {
        const container = document.getElementById('app-container');
        container.innerHTML = this.getHTML();
        
        this.currentQuestionIndex = 0;
        this.renderQuestion();
        this.initEvents();
    },
    
    // HTML экрана
    getHTML() {
        const totalQuestions = AppState.data.questionnaire ? AppState.data.questionnaire.length : 0;
        
        return `
            <div class="screen active" id="screen2">
                <div class="screen-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="header-text">
                            <h1 class="screen-title">Анкета для определения архетипа</h1>
                            <div class="screen-subtitle-container">
                                <p class="screen-subtitle-description">
                                    Это не просто вопросы — это зеркало.<br>
                                    Ответы помогут раскрыть, какой архетип живёт в тебе: Мудрец, Творец, Искатель или другой голос души.<br>
                                    Чем искреннее ты ответишь — тем точнее фигурка станет отражением твоей настоящей сути, а не социальной маски.<br>
                                    <strong>Готов увидеть себя по-настоящему? Начни — и за 3 минуты шагни ближе к целостности.</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stat-item">
                            <div class="stat-number" id="answeredCount">0</div>
                            <div class="stat-label">Отвечено</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${totalQuestions}</div>
                            <div class="stat-label">Всего вопросов</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="progressPercent">0%</div>
                            <div class="stat-label">Прогресс</div>
                        </div>
                    </div>
                </div>
                
                <div class="questionnaire-progress-container">
                    <div class="progress-info">
                        <span>Прогресс заполнения анкеты</span>
                        <span id="progressText">0 из ${totalQuestions} вопросов</span>
                    </div>
                    <div class="progress-bar-large">
                        <div class="progress-fill-large" id="questionProgress"></div>
                    </div>
                </div>
                
                <div class="questionnaire-container" id="questionnaireContainer">
                    <!-- Вопрос будет загружен здесь динамически -->
                </div>
                
                <div class="question-counter">
                    <div class="counter-content">
                        <div class="counter-current" id="currentCounter">1</div>
                        <div class="counter-separator">/</div>
                        <div class="counter-total">${totalQuestions}</div>
                    </div>
                    <div class="counter-label">Текущий вопрос</div>
                </div>
                
                <div class="questions-navigation">
                    <button class="nav-btn prev-question" id="prevQuestionBtn" disabled>
                        <i class="fas fa-chevron-left"></i>
                        <span class="nav-text">Предыдущий вопрос</span>
                    </button>
                    <button class="nav-btn next-question" id="nextQuestionBtn">
                        <span class="nav-text">Следующий вопрос</span>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-outline" id="prevBtn">
                        <i class="fas fa-arrow-left"></i> Вернуться назад
                    </button>
                    <button class="btn btn-primary" id="nextBtn" disabled>
                        <i class="fas fa-check-circle"></i> Перейти к выбору позы
                        <span class="btn-badge" id="completedCount">0/${totalQuestions}</span>
                    </button>
                </div>
                
                <div class="help-tip">
                    <i class="fas fa-info-circle"></i>
                    <span>Для точного результата важно ответить на все вопросы. Не пропускайте - каждый ответ важен!</span>
                </div>
            </div>
        `;
    },
    
    // Рендеринг текущего вопроса
    renderQuestion() {
        const container = document.getElementById('questionnaireContainer');
        
        if (!AppState.data.questionnaire || AppState.data.questionnaire.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h3>Вопросы не найдены</h3>
                    <p>Пожалуйста, проверьте подключение к интернету и попробуйте перезагрузить страницу</p>
                </div>
            `;
            return;
        }
        
        const questions = AppState.data.questionnaire;
        const question = questions[this.currentQuestionIndex];
        
        // Получаем текущий ответ
        let currentAnswer = null;
        let currentAnswerData = AppState.user.questionnaireAnswers[this.currentQuestionIndex];
        if (currentAnswerData && currentAnswerData.answerIndex !== undefined) {
            currentAnswer = currentAnswerData.answerIndex;
        }
        
        // Определяем категорию вопроса
        let categoryText = '';
        if (question.domain && AppState.data.domains && AppState.data.domains[question.domain]) {
            categoryText = AppState.data.domains[question.domain].name;
        } else if (question.domain) {
            categoryText = question.domain;
        }
        
        // Получаем информацию об архетипе
        let archetypeText = '';
        if (question.archetype && AppState.data.archetypes) {
            const archetype = Object.values(AppState.data.archetypes).find(a => 
                a.name === question.archetype
            );
            if (archetype) {
                archetypeText = archetype.name;
            } else {
                archetypeText = question.archetype;
            }
        }
        
        let html = `
            <div class="question-card active">
                <div class="question-number">
                    <span class="number">Вопрос ${this.currentQuestionIndex + 1}</span>
                    ${categoryText ? `<span class="category">${categoryText}</span>` : ''}
                </div>
                
                <div class="question-content">
                    <div class="question-text-wrapper">
                        <h2 class="question-text">${question.question}</h2>
                        ${archetypeText ? `
                            <div class="question-tags">
                                <span class="tag archetype-tag">
                                    <i class="fas fa-user-tag"></i> ${archetypeText}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="answer-options-grid">
        `;
        
        question.options.forEach((option, optIndex) => {
            const isSelected = currentAnswer === optIndex;
            const points = option.points || (5 - optIndex);
            
            html += `
                <button class="answer-option ${isSelected ? 'selected' : ''}" 
                     data-option-index="${optIndex}"
                     data-points="${points}">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + optIndex)}</div>
                        <div class="option-text-wrapper">
                            <div class="option-text">${option.text}</div>
                            <div class="option-points">${points} баллов</div>
                        </div>
                    </div>
                    ${isSelected ? '<div class="selected-check"><i class="fas fa-check"></i></div>' : ''}
                </button>
            `;
        });
        
        html += `
                    </div>
                    
                    <div class="question-hint">
                        <i class="fas fa-lightbulb"></i>
                        <span>Выберите один вариант ответа. Каждый ответ влияет на ваш интегративный портрет.</span>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this.bindAnswerEvents();
        this.updateProgress();
        this.updateNavigation();
        this.updateCounter();
    },
    
    // Привязка обработчиков к кнопкам ответов
    bindAnswerEvents() {
        const answerButtons = document.querySelectorAll('.answer-option');
        answerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectAnswer(e.currentTarget);
            });
        });
    },
    
    // Инициализация событий
    initEvents() {
        // Кнопка "Назад" (к выбору формата)
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ScreenManager.prev();
            });
        }
        
        // Кнопка "Далее" (Завершить анкету)
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ScreenManager.next();
            });
        }
        
        // Кнопки навигации по вопросам
        const prevQuestionBtn = document.getElementById('prevQuestionBtn');
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        
        if (prevQuestionBtn) {
            prevQuestionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToQuestion(-1);
            });
        }
        
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToQuestion(1);
            });
        }
        
        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => {
            if (!document.querySelector('#screen2.screen.active')) return;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateToQuestion(-1);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateToQuestion(1);
            } else if (e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const optionIndex = parseInt(e.key) - 1;
                this.selectAnswerByKeyboard(optionIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.currentQuestionIndex < AppState.data.questionnaire.length - 1) {
                    this.navigateToQuestion(1);
                }
            }
        });
    },
    
    // Выбор ответа
    selectAnswer(optionElement) {
        const optionIndex = parseInt(optionElement.dataset.optionIndex);
        const points = parseInt(optionElement.dataset.points);
        const question = AppState.data.questionnaire[this.currentQuestionIndex];
        
        // Сохраняем ответ с расширенными данными
        AppState.user.questionnaireAnswers[this.currentQuestionIndex] = {
            questionIndex: this.currentQuestionIndex,
            answerIndex: optionIndex,
            points: points,
            archetype: question.archetype || null,
            domain: question.domain || null,
            questionId: question.id
        };
        
        // Визуальное выделение
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.classList.remove('selected');
            btn.querySelector('.selected-check')?.remove();
        });
        
        optionElement.classList.add('selected');
        
        const checkMark = document.createElement('div');
        checkMark.className = 'selected-check';
        checkMark.innerHTML = '<i class="fas fa-check"></i>';
        optionElement.appendChild(checkMark);
        
        // Анимация
        optionElement.classList.add('pulse');
        setTimeout(() => {
            optionElement.classList.remove('pulse');
        }, 300);
        
        // Обновляем прогресс
        this.updateProgress();
        
        // Автоматически переходим к следующему вопросу через 0.5 сек
        setTimeout(() => {
            if (this.currentQuestionIndex < AppState.data.questionnaire.length - 1) {
                this.navigateToQuestion(1);
            }
        }, 500);
    },
    
    // Выбор ответа с клавиатуры
    selectAnswerByKeyboard(optionIndex) {
        const option = document.querySelector(`.answer-option[data-option-index="${optionIndex}"]`);
        if (option) {
            this.selectAnswer(option);
        }
    },
    
    // Навигация по вопросам
    navigateToQuestion(direction) {
        const newIndex = this.currentQuestionIndex + direction;
        const totalQuestions = AppState.data.questionnaire.length;
        
        if (newIndex < 0 || newIndex >= totalQuestions) {
            return;
        }
        
        this.currentQuestionIndex = newIndex;
        this.renderQuestion();
    },
    
    // Обновление навигации
    updateNavigation() {
        const totalQuestions = AppState.data.questionnaire.length;
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        if (nextBtn) {
            const isLastQuestion = this.currentQuestionIndex === totalQuestions - 1;
            nextBtn.disabled = isLastQuestion;
            
            if (isLastQuestion) {
                nextBtn.innerHTML = '<span class="nav-text">Последний вопрос</span><i class="fas fa-flag-checkered"></i>';
            } else {
                nextBtn.innerHTML = '<span class="nav-text">Следующий вопрос</span><i class="fas fa-chevron-right"></i>';
            }
        }
    },
    
    // Обновление счетчика
    updateCounter() {
        const counter = document.getElementById('currentCounter');
        if (counter) {
            counter.textContent = this.currentQuestionIndex + 1;
        }
    },
    
    // Обновление прогресса
    updateProgress() {
        const totalQuestions = AppState.data.questionnaire.length;
        const answeredQuestions = AppState.user.questionnaireAnswers.filter(a => a !== undefined).length;
        const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
        
        // Обновляем все счетчики
        const answeredCount = document.getElementById('answeredCount');
        const completedCount = document.getElementById('completedCount');
        const progressPercentEl = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('questionProgress');
        const nextBtn = document.getElementById('nextBtn');
        
        if (answeredCount) answeredCount.textContent = answeredQuestions;
        if (completedCount) completedCount.textContent = `${answeredQuestions}/${totalQuestions}`;
        if (progressPercentEl) progressPercentEl.textContent = `${progressPercent}%`;
        if (progressText) progressText.textContent = `${answeredQuestions} из ${totalQuestions} вопросов`;
        
        // Обновляем прогресс-бар
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // Активируем/деактивируем основную кнопку
        if (nextBtn) {
            nextBtn.disabled = answeredQuestions < totalQuestions;
            
            // Обновляем цвет кнопки в зависимости от прогресса
            if (progressPercent === 100) {
                nextBtn.classList.add('completed');
                nextBtn.innerHTML = '<i class="fas fa-check-circle"></i> Анкета завершена! <span class="btn-badge">✓</span>';
                
                // Автоматически рассчитываем результаты при завершении анкеты
                setTimeout(() => {
                    AppState.calculateQuestionnaireResults();
                    console.log('✅ Результаты анкеты рассчитаны автоматически');
                }, 100);
            } else {
                nextBtn.classList.remove('completed');
                nextBtn.innerHTML = '<i class="fas fa-check-circle"></i> Перейти к выбору позы <span class="btn-badge">' + answeredQuestions + '/' + totalQuestions + '</span>';
            }
        }
    }
};