// Экран 5: Результаты (исправленная версия)
window.Screen5 = {
    // Рендеринг экрана
    render() {
        // Рассчитываем результаты если еще не рассчитаны
        if (!AppState.user.archetypeResults) {
            AppState.calculateQuestionnaireResults();
        }
        
        const container = document.getElementById('app-container');
        container.innerHTML = this.getHTML();
        
        // Рендерим результаты
        this.renderResults();
        
        // Инициализация событий
        setTimeout(() => {
            this.initEvents();
        }, 100);
    },
    
    // HTML экрана
    getHTML() {
        const format = AppState.getSelectedFormat();
        const results = AppState.user.archetypeResults || {};
        
        return `
            <div class="screen active" id="screen5">
                <div class="screen-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="header-text">
                            <h1 class="screen-title">Ваш интегративный портрет готов!</h1>
                            <p class="screen-subtitle">Познакомьтесь с результатами вашего психологического профиля</p>
                        </div>
                    </div>
                    
                    <div class="result-summary">
                        <div class="summary-card">
                            <div class="summary-header">
                                <i class="fas fa-check-circle"></i>
                                <h3>Заказ успешно завершен</h3>
                            </div>
                            <div class="summary-content">
                                <div class="summary-row">
                                    <span class="label">Номер заказа:</span>
                                    <span class="value">${AppState.user.orderId || 'Не указан'}</span>
                                </div>
                                <div class="summary-row">
                                    <span class="label">Клиент:</span>
                                    <span class="value">${AppState.user.clientName || 'Не указано'}</span>
                                </div>
                                <div class="summary-row">
                                    <span class="label">Активных архетипов:</span>
                                    <span class="value archetype-badge" id="mainArchetype">
                                        ${results.activeArchetypesCount || 0}
                                        ${results.activeArchetypesCount === 1 ? 'архетип' : 
                                          results.activeArchetypesCount > 1 ? 'архетипа' : 'архетипов'}
                                    </span>
                                </div>
                                <div class="summary-row total">
                                    <span class="label">Итоговая стоимость:</span>
                                    <span class="value price-value">${format ? format.price.toLocaleString() + ' ₽' : '0 ₽'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="results-container">
                    <div class="results-tabs">
                        <div class="tabs-container">
                            <button class="tab-btn active" data-tab="overview">
                                <i class="fas fa-chart-pie"></i>
                                <span>Обзор</span>
                            </button>
                            <button class="tab-btn" data-tab="archetypes">
                                <i class="fas fa-user-circle"></i>
                                <span>Архетипы</span>
                            </button>
                            <button class="tab-btn" data-tab="balance">
                                <i class="fas fa-balance-scale"></i>
                                <span>Целостность</span>
                            </button>
                            <button class="tab-btn" data-tab="recommendations">
                                <i class="fas fa-lightbulb"></i>
                                <span>Маршрут</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="tab-content active" id="overviewTab">
                        <div class="result-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <i class="fas fa-chart-pie"></i>
                                </div>
                                <div class="header-text">
                                    <h3>Обзор вашего профиля</h3>
                                    <p>Ключевые выводы на основе анализа анкеты</p>
                                </div>
                                ${results.metrics && results.metrics.harmonyLevel === 'high' ? `
                                    <div class="header-badge success">
                                        <span class="badge-text">Высокая гармония</span>
                                    </div>
                                ` : results.metrics && results.metrics.harmonyLevel === 'low' ? `
                                    <div class="header-badge warning">
                                        <span class="badge-text">Требует внимания</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="card-content">
                                <div class="overview-grid">
                                    <div class="overview-item">
                                        <div class="overview-icon">
                                            <i class="fas fa-star"></i>
                                        </div>
                                        <div class="overview-content">
                                            <div class="overview-title">Общий балл</div>
                                            <div class="overview-value">${results.totalScore || 0} / ${results.answeredQuestions ? results.answeredQuestions * 5 : 0}</div>
                                            <div class="overview-subtext">${results.averageScore || 0} средний балл</div>
                                        </div>
                                    </div>
                                    
                                    <div class="overview-item">
                                        <div class="overview-icon">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <div class="overview-content">
                                            <div class="overview-title">Ответов</div>
                                            <div class="overview-value">${results.answeredQuestions || 0} / ${AppState.data.questionnaire ? AppState.data.questionnaire.length : 0}</div>
                                            <div class="overview-subtext">${results.answeredQuestions && AppState.data.questionnaire ? 
                                                Math.round((results.answeredQuestions / AppState.data.questionnaire.length) * 100) : 0}% заполнено</div>
                                        </div>
                                    </div>
                                    
                                    <div class="overview-item">
                                        <div class="overview-icon">
                                            <i class="fas fa-layer-group"></i>
                                        </div>
                                        <div class="overview-content">
                                            <div class="overview-title">Активных архетипов</div>
                                            <div class="overview-value">${results.activeArchetypesCount || 0}</div>
                                            <div class="overview-subtext">из ${results.archetypeScores ? Object.keys(results.archetypeScores).length : 0}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="overview-item">
                                        <div class="overview-icon">
                                            <i class="fas fa-heart"></i>
                                        </div>
                                        <div class="overview-content">
                                            <div class="overview-title">Уровень гармонии</div>
                                            <div class="overview-value">${results.metrics && results.metrics.harmonyLevel === 'high' ? 'Высокий' : 
                                                results.metrics && results.metrics.harmonyLevel === 'low' ? 'Низкий' : 'Средний'}</div>
                                            <div class="overview-subtext">
                                                ${results.metrics && results.metrics.strengths ? results.metrics.strengths.length : 0} сильных сфер
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="portrait-section">
                                    <div class="section-header">
                                        <i class="fas fa-portrait"></i>
                                        <h4>Ваш интегративный портрет</h4>
                                    </div>
                                    <div class="portrait-text">
                                        ${AppState.user.archetype?.portraitText || results.portraitText || 'Портрет не сформирован'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="archetypesTab">
                        <div class="result-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="header-text">
                                    <h3>Распределение по архетипам</h3>
                                    <p>Баллы по различным психологическим моделям личности</p>
                                </div>
                                ${results.duelArchetypes ? `
                                    <div class="header-badge info">
                                        <span class="badge-text">Дуэль архетипов</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="card-content">
                                <div id="archetypeChart">
                                    <!-- Диаграмма архетипов будет отрисована здесь -->
                                </div>
                                
                                ${results.duelArchetypes && results.duelArchetypes.length === 2 ? `
                                    <div class="duel-notice">
                                        <i class="fas fa-handshake"></i>
                                        <div class="duel-content">
                                            <h4>Дуэль архетипов: ${results.duelArchetypes.join(' + ')}</h4>
                                            <p>Вы обладаете сильными качествами двух архетипов. Ищите гармонию между ${this.getArchetypeStrength(results.duelArchetypes[0])} и ${this.getArchetypeStrength(results.duelArchetypes[1])}.</p>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${results.activeArchetypes && results.activeArchetypes.length > 0 ? `
                                    <div class="active-archetypes-section">
                                        <div class="section-header">
                                            <i class="fas fa-star"></i>
                                            <h4>Активные архетипы (≥4 баллов)</h4>
                                        </div>
                                        <div class="archetypes-grid">
                                            ${results.activeArchetypes.map((arch, index) => {
                                                const isDominant = arch.name === results.dominantArchetype;
                                                const isInDuel = results.duelArchetypes && results.duelArchetypes.includes(arch.name);
                                                const archetypeInfo = AppState.data.archetypes ? AppState.data.archetypes[arch.name] : null;
                                                
                                                return `
                                                    <div class="archetype-card ${isDominant ? 'dominant' : ''} ${isInDuel ? 'duel' : ''}">
                                                        <div class="archetype-header">
                                                            <div class="archetype-rank">
                                                                ${index + 1}
                                                                ${isDominant ? '<span class="dominant-marker">★</span>' : ''}
                                                                ${isInDuel ? '<span class="duel-marker">⚔️</span>' : ''}
                                                            </div>
                                                            <div class="archetype-name">${arch.name}</div>
                                                        </div>
                                                        <div class="archetype-score">
                                                            <div class="score-value">${arch.score.toFixed(1)}</div>
                                                            <div class="score-label">средний балл</div>
                                                        </div>
                                                        ${archetypeInfo && archetypeInfo.short_description ? `
                                                            <div class="archetype-description">
                                                                ${archetypeInfo.short_description}
                                                            </div>
                                                        ` : ''}
                                                        <div class="archetype-meta">
                                                            <span class="meta-item">
                                                                <i class="fas fa-chart-line"></i>
                                                                ${arch.rawScore} баллов
                                                            </span>
                                                            <span class="meta-item">
                                                                <i class="fas fa-question-circle"></i>
                                                                ${arch.count} вопросов
                                                            </span>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="balanceTab">
                        <div class="result-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <i class="fas fa-balance-scale"></i>
                                </div>
                                <div class="header-text">
                                    <h3>Целостность по сферам жизни</h3>
                                    <p>Баланс и гармония в различных областях</p>
                                </div>
                            </div>
                            <div class="card-content">
                                <div id="balanceChart">
                                    <!-- Диаграмма баланса будет отрисована здесь -->
                                </div>
                                
                                <div class="balance-summary">
                                    ${results.domainScores ? Object.entries(results.domainScores).map(([domain, score]) => {
                                        const count = results.domainCounts[domain] || 1;
                                        const avg = (score / count).toFixed(1);
                                        const domainInfo = AppState.data.domains ? AppState.data.domains[domain] : null;
                                        const domainName = domainInfo ? domainInfo.name : domain;
                                        
                                        let status = '';
                                        let statusClass = '';
                                        let statusIcon = '';
                                        
                                        if (avg >= 4) {
                                            status = 'Высокая гармония';
                                            statusClass = 'high';
                                            statusIcon = '✓';
                                        } else if (avg <= 2) {
                                            status = 'Требует внимания';
                                            statusClass = 'low';
                                            statusIcon = '⚠️';
                                        } else {
                                            status = 'Умеренный баланс';
                                            statusClass = 'medium';
                                            statusIcon = '➖';
                                        }
                                        
                                        const isLowest = domain === results.lowestDomain;
                                        const isHighest = domain === results.highestDomain;
                                        
                                        return `
                                            <div class="balance-item ${isLowest ? 'focus' : ''} ${isHighest ? 'strength' : ''}">
                                                <div class="balance-domain">
                                                    <span class="domain-icon">${statusIcon}</span>
                                                    <span class="domain-name">${domainName}</span>
                                                    ${isLowest ? '<span class="focus-badge">Фокус внимания</span>' : ''}
                                                    ${isHighest ? '<span class="strength-badge">Сильная сторона</span>' : ''}
                                                </div>
                                                <div class="balance-details">
                                                    <div class="balance-score ${statusClass}">
                                                        <span class="score-value">${avg}</span>
                                                        <span class="score-label">средний балл</span>
                                                    </div>
                                                    <div class="balance-status ${statusClass}">
                                                        <span class="status-text">${status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('') : '<p>Данные по сферам не доступны</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="recommendationsTab">
                        <div class="result-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <div class="header-text">
                                    <h3>Маршрут для изменений</h3>
                                    <p>Персональные рекомендации на основе вашего профиля</p>
                                </div>
                            </div>
                            <div class="card-content">
                                ${results.focusStatement ? `
                                    <div class="focus-statement">
                                        <div class="focus-header">
                                            <i class="fas fa-bullseye"></i>
                                            <h4>Ключевой фокус внимания</h4>
                                        </div>
                                        <div class="focus-content">
                                            <p class="focus-quote">"${results.focusStatement.questionText}"</p>
                                            <div class="focus-meta">
                                                <span class="meta-item">
                                                    <i class="fas fa-layer-group"></i>
                                                    Сфера: ${AppState.getDomainName ? AppState.getDomainName(results.focusStatement.domain) : results.focusStatement.domain}
                                                </span>
                                                <span class="meta-item">
                                                    <i class="fas fa-user-tag"></i>
                                                    Архетип: ${results.focusStatement.archetype}
                                                </span>
                                                <span class="meta-item">
                                                    <i class="fas fa-star"></i>
                                                    Ваш балл: ${results.focusStatement.points}/5
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="recommendations-section">
                                    <div class="section-header">
                                        <i class="fas fa-road"></i>
                                        <h4>Ваш маршрут развития</h4>
                                    </div>
                                    <div class="recommendations-list" id="recommendationsList">
                                        ${this.formatRecommendations(results.recommendations || [])}
                                    </div>
                                </div>
                                
                                ${results.summaryText ? `
                                    <div class="summary-section">
                                        <div class="section-header">
                                            <i class="fas fa-file-alt"></i>
                                            <h4>Сводка результатов</h4>
                                        </div>
                                        <div class="summary-text">
                                            <pre>${results.summaryText}</pre>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <div class="btn-group">
                        <button class="btn btn-outline" id="prevBtn">
                            <i class="fas fa-arrow-left"></i> Назад к договору
                        </button>
                        <button class="btn btn-success" id="newOrderBtn">
                            <i class="fas fa-plus-circle"></i> Новый заказ
                        </button>
                    </div>
                </div>
                
                <div class="help-tip">
                    <i class="fas fa-info-circle"></i>
                    <span>Результаты сохранены в системе. Вы можете вернуться к ним в любое время по номеру заказа ${AppState.user.orderId || ''}.</span>
                </div>
            </div>
        `;
    },
    
    // Форматирование рекомендаций
    formatRecommendations(recommendations) {
        console.log('Рекомендации для форматирования:', recommendations);
        
        if (!recommendations || recommendations.length === 0) {
            return `
                <div class="no-recommendations">
                    <div class="no-rec-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <h4>Рекомендации будут доступны после полной загрузки данных</h4>
                    <p>Ваши персональные рекомендации формируются на основе анализа всех ответов.</p>
                    <p>Если это сообщение остаётся долгое время, пожалуйста, обновите страницу.</p>
                </div>
            `;
        }
        
        let html = '';
        
        recommendations.forEach((rec, index) => {
            html += `
                <div class="recommendation-item">
                    <div class="rec-number">${index + 1}</div>
                    <div class="rec-text">${rec}</div>
                </div>
            `;
        });
        
        return html;
    },
    
    // Получение силы архетипа
    getArchetypeStrength(archetypeName) {
        if (!archetypeName || !AppState.data.archetypes) return 'его качествами';
        
        const archetype = Object.values(AppState.data.archetypes).find(a => 
            a.name === archetypeName
        );
        
        return archetype ? archetype.strength || 'его сильными сторонами' : 'его качествами';
    },
    
    // Рендеринг результатов
    renderResults() {
        const results = AppState.user.archetypeResults;
        
        if (!results) {
            return;
        }
        
        // Создаем диаграмму архетипов
        this.renderArchetypeChart(results);
        
        // Создаем диаграмму баланса (радиальную)
        this.renderBalanceChart(results);
    },
    
    // Создание диаграммы архетипов
    renderArchetypeChart(results) {
        const container = document.getElementById('archetypeChart');
        if (!container || !results.archetypeScores) return;
        
        const archetypes = Object.keys(results.archetypeScores);
        const scores = archetypes.map(a => results.archetypeScores[a]);
        const counts = archetypes.map(a => results.archetypeCounts[a] || 1);
        
        if (archetypes.length === 0) {
            container.innerHTML = '<p class="no-data">Нет данных по архетипам</p>';
            return;
        }
        
        // Рассчитываем средние баллы
        const averages = scores.map((score, i) => (score / counts[i]).toFixed(1));
        const maxAvg = Math.max(...averages.map(a => parseFloat(a)));
        
        // Сортируем по баллам
        const archetypeData = archetypes.map((name, index) => ({
            name,
            avg: parseFloat(averages[index]),
            rawScore: scores[index],
            count: counts[index]
        })).sort((a, b) => b.avg - a.avg);
        
        let html = '<div class="archetype-bars">';
        
        archetypeData.forEach((data) => {
            const percentage = maxAvg > 0 ? (data.avg / maxAvg) * 100 : 0;
            const isDominant = data.name === results.dominantArchetype;
            const isInDuel = results.duelArchetypes && results.duelArchetypes.includes(data.name);
            const isActive = data.avg >= 4;
            
            // Получаем информацию об архетипе
            const archetypeInfo = AppState.data.archetypes ? 
                AppState.data.archetypes[data.name] : null;
            
            html += `
                <div class="archetype-bar ${isDominant ? 'dominant' : ''} ${isInDuel ? 'duel' : ''} ${isActive ? 'active' : 'inactive'}">
                    <div class="bar-info">
                        <span class="archetype-name">
                            ${data.name}
                            ${isDominant ? '<span class="dominant-marker">★</span>' : ''}
                            ${isInDuel ? '<span class="duel-marker">⚔️</span>' : ''}
                        </span>
                        <span class="archetype-score">${data.avg.toFixed(1)}/5</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                        <div class="bar-threshold" style="left: ${(4 / maxAvg) * 100}%"></div>
                    </div>
                    <div class="bar-details">
                        <span class="details-text">${data.rawScore} баллов за ${data.count} вопросов</span>
                    </div>
                    ${archetypeInfo && archetypeInfo.strength ? `
                        <div class="archetype-hint">${archetypeInfo.strength}</div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color dominant"></span>
                    <span>Доминирующий архетип</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color duel"></span>
                    <span>Дуэль архетипов</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color active"></span>
                    <span>Активный (≥4 баллов)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color"></span>
                    <span>Порог активации →</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    // Создание диаграммы баланса (радиальная диаграмма)
    renderBalanceChart(results) {
        const container = document.getElementById('balanceChart');
        if (!container || !results.domainScores) return;
        
        const domains = Object.keys(results.domainScores);
        if (domains.length === 0) {
            container.innerHTML = '<p class="no-data">Нет данных по сферам</p>';
            return;
        }
        
        // Подготавливаем данные для радиальной диаграммы
        const domainData = domains.map(domain => {
            const score = results.domainScores[domain];
            const count = results.domainCounts[domain] || 1;
            const avg = score / count;
            
            const domainInfo = AppState.data.domains ? AppState.data.domains[domain] : null;
            const domainName = domainInfo ? domainInfo.name : domain;
            
            return {
                domain: domain,
                name: domainName,
                value: avg,
                normalized: (avg / 5) * 100,
                isLowest: domain === results.lowestDomain,
                isHighest: domain === results.highestDomain
            };
        });
        
        // Сортируем по названию для красивого отображения
        domainData.sort((a, b) => a.name.localeCompare(b.name));
        
        // Создаем SVG радиальной диаграммы
        const size = 300;
        const center = size / 2;
        const radius = 120;
        const sliceAngle = (2 * Math.PI) / domainData.length;
        
        let svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="radial-svg">
                <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#e9ecef" stroke-width="2"/>
        `;
        
        // Добавляем секторы и метки
        domainData.forEach((item, index) => {
            const angle = sliceAngle * index;
            const nextAngle = sliceAngle * (index + 1);
            
            // Линия до круга
            const x1 = center + radius * Math.cos(angle);
            const y1 = center + radius * Math.sin(angle);
            
            svg += `<line x1="${center}" y1="${center}" x2="${x1}" y2="${y1}" stroke="#e9ecef" stroke-width="1"/>`;
            
            // Текст метки
            const labelAngle = angle + sliceAngle / 2;
            const labelRadius = radius + 30;
            const labelX = center + labelRadius * Math.cos(labelAngle);
            const labelY = center + labelRadius * Math.sin(labelAngle);
            
            // Определяем цвет в зависимости от балла
            let color = '#3498db'; // Синий по умолчанию
            if (item.value >= 4) {
                color = '#2ecc71'; // Зеленый для высокой гармонии
            } else if (item.value <= 2) {
                color = '#e74c3c'; // Красный для низкого балла
            }
            
            if (item.isLowest) color = '#e74c3c';
            if (item.isHighest) color = '#2ecc71';
            
            // Линия значения
            const valueRadius = radius * (item.value / 5);
            const valueX = center + valueRadius * Math.cos(labelAngle);
            const valueY = center + valueRadius * Math.sin(labelAngle);
            
            svg += `
                <line x1="${center}" y1="${center}" x2="${valueX}" y2="${valueY}" 
                      stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                <circle cx="${valueX}" cy="${valueY}" r="4" fill="${color}"/>
                
                <text x="${labelX}" y="${labelY}" text-anchor="middle" class="radial-label">
                    <tspan x="${labelX}" dy="-5" class="label-name">${item.name}</tspan>
                    <tspan x="${labelX}" dy="15" class="label-value">${item.value.toFixed(1)}</tspan>
                </text>
            `;
        });
        
        // Центр диаграммы
        svg += `
                <circle cx="${center}" cy="${center}" r="30" fill="white" stroke="#3498db" stroke-width="2"/>
                <text x="${center}" y="${center}" text-anchor="middle" dy="5" class="center-score">
                    ${results.averageScore || '0'}
                </text>
                <text x="${center}" y="${center}" text-anchor="middle" dy="25" class="center-label">
                    средний
                </text>
            </svg>
        `;
        
        // Легенда
        const legend = `
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color" style="background: #2ecc71"></span>
                    <span>Высокая гармония (≥4)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #3498db"></span>
                    <span>Умеренный баланс (2-4)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #e74c3c"></span>
                    <span>Требует внимания (≤2)</span>
                </div>
            </div>
        `;
        
        container.innerHTML = svg + legend;
    },
    
    // Инициализация вкладок
    initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
    },
    
    // Переключение вкладок
    switchTab(tabName) {
        // Деактивируем все вкладки
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Активируем выбранную вкладку
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    },
    
    // Инициализация событий
    initEvents() {
        // Кнопка "Назад"
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                ScreenManager.prev();
            });
        }
        
        // Кнопка "Новый заказ"
        const newOrderBtn = document.getElementById('newOrderBtn');
        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => {
                this.newOrder();
            });
        }
        
        // Инициализируем вкладки
        this.initTabs();
    },
    
    // Новый заказ
    newOrder() {
        // Сбрасываем состояние
        AppState.resetAll();
        
        // Возвращаемся на первый экран
        ScreenManager.load(1);
        
        ScreenManager.showNotification('Новый заказ начат. Заполните анкету заново.', false);
    }
};