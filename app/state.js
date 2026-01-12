// Состояние приложения (исправленная версия)
window.AppState = {
    // Данные из таблицы
    data: {
        formats: {},
        questionnaire: [],
        poses: {},
        archetypes: {},
        contractTemplate: [],
        domains: {},
        recommendationRules: []
    },
    
    // Состояние пользователя
    user: {
        selectedFormat: null,
        questionnaireAnswers: [],
        selectedPose: null,
        uploadedPhoto: null,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        archetype: null,
        archetypeResults: null,
        orderId: null,
        contractGenerated: false,
        paymentCompleted: false // Новое поле для отслеживания оплаты
    },
    
    // Вспомогательные функции
    getSelectedFormat() {
        return this.data.formats[this.user.selectedFormat];
    },
    
    getSelectedPose() {
        if (!this.user.selectedPose || !this.data.poses) return null;
        const allPoses = Object.values(this.data.poses).flat();
        return allPoses.find(p => p.id === this.user.selectedPose) || null;
    },
    
    // Расширенный расчёт результатов анкеты
    calculateQuestionnaireResults() {
        if (!this.data.questionnaire || !this.user.questionnaireAnswers || 
            this.user.questionnaireAnswers.length === 0) {
            console.warn('Нет данных для расчёта результатов');
            return null;
        }
        
        console.log('📊 Начало расчёта результатов анкеты...');
        
        const results = {
            // Баллы по архетипам
            archetypeScores: {},
            archetypeCounts: {},
            
            // Баллы по сферам
            domainScores: {},
            domainCounts: {},
            
            // Общие показатели
            totalScore: 0,
            answeredQuestions: 0,
            averageScore: 0,
            
            // Определения
            dominantArchetype: null,
            dominantArchetypeScore: 0,
            secondaryArchetype: null,
            secondaryArchetypeScore: 0,
            duelArchetypes: [],
            
            // Все активные архетипы
            activeArchetypes: [],
            activeArchetypesCount: 0,
            
            // Сферы
            lowestDomain: null,
            lowestDomainScore: Infinity,
            highestDomain: null,
            highestDomainScore: 0,
            
            // Самый слабый вопрос
            weakestQuestion: null,
            weakestQuestionScore: Infinity,
            
            // Рекомендации
            recommendations: [],
            focusStatement: null,
            
            // Метрики для отображения
            metrics: {
                harmonyLevel: 'medium',
                growthAreas: [],
                strengths: []
            }
        };
        
        // 1. Собираем статистику по ответам
        this.user.questionnaireAnswers.forEach(answer => {
            if (answer && answer.questionIndex !== undefined && answer.answerIndex !== undefined) {
                const question = this.data.questionnaire[answer.questionIndex];
                if (question && question.options[answer.answerIndex]) {
                    const points = answer.points || question.options[answer.answerIndex].points;
                    const archetype = answer.archetype || question.archetype;
                    const domain = answer.domain || question.domain;
                    
                    // Суммируем по архетипам
                    if (archetype) {
                        if (!results.archetypeScores[archetype]) {
                            results.archetypeScores[archetype] = 0;
                            results.archetypeCounts[archetype] = 0;
                        }
                        results.archetypeScores[archetype] += points;
                        results.archetypeCounts[archetype] += 1;
                    }
                    
                    // Суммируем по сферам
                    if (domain) {
                        if (!results.domainScores[domain]) {
                            results.domainScores[domain] = 0;
                            results.domainCounts[domain] = 0;
                        }
                        results.domainScores[domain] += points;
                        results.domainCounts[domain] += 1;
                    }
                    
                    // Общий счёт
                    results.totalScore += points;
                    results.answeredQuestions += 1;
                    
                    // Ищем самый слабый вопрос
                    if (points < results.weakestQuestionScore) {
                        results.weakestQuestionScore = points;
                        results.weakestQuestion = {
                            questionIndex: answer.questionIndex,
                            questionText: question.question,
                            points: points,
                            archetype: archetype,
                            domain: domain,
                            answerText: question.options[answer.answerIndex].text
                        };
                    }
                }
            }
        });
        
        // Рассчитываем средний балл
        results.averageScore = results.answeredQuestions > 0 ? 
            (results.totalScore / results.answeredQuestions).toFixed(2) : 0;
        
        // 2. Определяем все активные архетипы (≥4 баллов)
        const activeArchetypes = [];
        for (const [archetype, score] of Object.entries(results.archetypeScores)) {
            const count = results.archetypeCounts[archetype] || 1;
            const normalizedScore = score / count;
            
            if (normalizedScore >= 4) {
                activeArchetypes.push({
                    name: archetype,
                    score: normalizedScore,
                    rawScore: score,
                    count: count
                });
            }
        }
        
        // Сортируем активные архетипы по баллам
        activeArchetypes.sort((a, b) => b.score - a.score);
        results.activeArchetypes = activeArchetypes;
        results.activeArchetypesCount = activeArchetypes.length;
        
        // 3. Определяем доминирующий архетип (самый высокий балл)
        if (activeArchetypes.length > 0) {
            results.dominantArchetype = activeArchetypes[0].name;
            results.dominantArchetypeScore = activeArchetypes[0].score;
            
            // Проверяем дуэль архетипов (разница меньше 1 балла)
            if (activeArchetypes.length >= 2) {
                const secondArchetype = activeArchetypes[1];
                const scoreDiff = activeArchetypes[0].score - secondArchetype.score;
                
                if (scoreDiff < 1.0) {
                    results.secondaryArchetype = secondArchetype.name;
                    results.secondaryArchetypeScore = secondArchetype.score;
                    results.duelArchetypes = [activeArchetypes[0].name, secondArchetype.name];
                    results.metrics.harmonyLevel = 'complex';
                }
            }
        } else {
            // Если нет активных архетипов, берем самый высокий балл
            let maxScore = 0;
            for (const [archetype, score] of Object.entries(results.archetypeScores)) {
                const count = results.archetypeCounts[archetype] || 1;
                const normalizedScore = score / count;
                
                if (normalizedScore > maxScore) {
                    maxScore = normalizedScore;
                    results.dominantArchetype = archetype;
                    results.dominantArchetypeScore = normalizedScore;
                }
            }
        }
        
        // 4. Определяем самую слабую и сильную сферу
        for (const [domain, score] of Object.entries(results.domainScores)) {
            const avgScore = results.domainCounts[domain] > 0 ? 
                score / results.domainCounts[domain] : 0;
            
            if (avgScore < results.lowestDomainScore) {
                results.lowestDomainScore = avgScore;
                results.lowestDomain = domain;
            }
            
            if (avgScore > results.highestDomainScore) {
                results.highestDomainScore = avgScore;
                results.highestDomain = domain;
            }
            
            // Определяем уровень гармонии по сферам
            if (avgScore <= 2) {
                results.metrics.growthAreas.push(domain);
            } else if (avgScore >= 4) {
                results.metrics.strengths.push(domain);
            }
        }
        
        // Определяем общий уровень гармонии
        if (results.metrics.growthAreas.length === 0 && results.metrics.strengths.length >= 2) {
            results.metrics.harmonyLevel = 'high';
        } else if (results.metrics.growthAreas.length >= 2) {
            results.metrics.harmonyLevel = 'low';
        }
        
        // 5. Устанавливаем фокус-утверждение
        if (results.weakestQuestion) {
            results.focusStatement = results.weakestQuestion;
        }
        
        // 6. Генерируем рекомендации
        results.recommendations = this.generateRecommendations(results);
        
        // 7. Создаём портрет для отображения
        results.portraitText = this.generatePortraitText(results);
        results.summaryText = this.generateSummaryText(results);
        
        // Сохраняем результаты
        this.user.archetypeResults = results;
        
        // Для совместимости со старым кодом
        this.user.archetype = {
            name: results.dominantArchetype || 'Универсальный',
            description: this.getArchetypeDescription(results.dominantArchetype),
            portraitText: results.portraitText,
            summary: results.summaryText,
            recommendations: results.recommendations.join('\n')
        };
        
        console.log('✅ Результаты расчёта:', {
            activeArchetypes: results.activeArchetypesCount,
            dominant: results.dominantArchetype,
            duel: results.duelArchetypes,
            lowestDomain: results.lowestDomain,
            recommendations: results.recommendations.length
        });
        
        return results;
    },
    
    // Генерация портрета с учетом всех активных архетипов
    generatePortraitText(results) {
        let text = '';
        
        // Введение с учетом всех активных архетипов
        if (results.activeArchetypes && results.activeArchetypes.length > 0) {
            if (results.activeArchetypes.length === 1) {
                const archetype = results.activeArchetypes[0];
                const archetypeInfo = this.data.archetypes[archetype.name];
                text += `Ваш доминирующий архетип — ${archetype.name} (${archetype.score.toFixed(1)}/5). `;
                if (archetypeInfo && archetypeInfo.description) {
                    text += archetypeInfo.description + ' ';
                }
            } else if (results.duelArchetypes && results.duelArchetypes.length === 2) {
                const archetype1 = this.data.archetypes[results.duelArchetypes[0]];
                const archetype2 = this.data.archetypes[results.duelArchetypes[1]];
                
                text += `Ваша личность сочетает две сильные энергии: ${results.duelArchetypes[0]} (${results.dominantArchetypeScore.toFixed(1)}/5) и ${results.duelArchetypes[1]} (${results.secondaryArchetypeScore.toFixed(1)}/5). `;
                if (archetype1 && archetype2) {
                    text += `Это создаёт уникальную динамику между ${archetype1.strength || 'одним качеством'} и ${archetype2.strength || 'другим качеством'}. `;
                }
            } else {
                text += `Вы проявляете активность ${results.activeArchetypes.length} архетипов: `;
                results.activeArchetypes.forEach((arch, index) => {
                    text += `${arch.name} (${arch.score.toFixed(1)}/5)`;
                    if (index < results.activeArchetypes.length - 1) {
                        text += ', ';
                    }
                });
                text += '. ';
            }
        }
        
        // Анализ сфер
        if (results.lowestDomain && this.data.domains[results.lowestDomain]) {
            const domainInfo = this.data.domains[results.lowestDomain];
            text += `Сфера, требующая наибольшего внимания — ${domainInfo.name}. `;
            
            if (results.lowestDomainScore <= 2) {
                text += domainInfo.low_score_message || 'Эта область нуждается в развитии. ';
            } else if (results.lowestDomainScore <= 3.5) {
                text += domainInfo.medium_score_message || 'В этой сфере есть потенциал для роста. ';
            }
        }
        
        // Анализ гармонии
        if (results.metrics.harmonyLevel === 'high') {
            text += 'Вы демонстрируете хороший баланс между различными сферами жизни. ';
        } else if (results.metrics.harmonyLevel === 'low') {
            text += 'Есть несколько областей, требующих внимания для достижения баланса. ';
        } else {
            text += 'Вы находитесь в процессе развития и интеграции различных аспектов личности. ';
        }
        
        // Фокус на развитии
        if (results.focusStatement) {
            text += `Ключевой точкой роста может стать работа над утверждением: "${results.focusStatement.questionText.substring(0, 60)}...". `;
        }
        
        return text;
    },
    
    // Генерация сводки
    generateSummaryText(results) {
        let summary = '';
        
        // Архетипы
        if (results.activeArchetypes && results.activeArchetypes.length > 0) {
            summary += `Активные архетипы (≥4 баллов): ${results.activeArchetypesCount}\n`;
            
            results.activeArchetypes.forEach((arch, index) => {
                const isDominant = arch.name === results.dominantArchetype;
                const isInDuel = results.duelArchetypes && results.duelArchetypes.includes(arch.name);
                const prefix = isDominant ? '★ ' : isInDuel ? '⚔️ ' : '  ';
                
                summary += `${prefix}${arch.name}: ${arch.score.toFixed(1)}/5 (${arch.rawScore} баллов за ${arch.count} вопросов)\n`;
            });
        }
        
        if (results.dominantArchetype && !results.duelArchetypes) {
            summary += `\nОсновной архетип: ${results.dominantArchetype} (${results.dominantArchetypeScore.toFixed(1)}/5)\n`;
        } else if (results.duelArchetypes && results.duelArchetypes.length === 2) {
            summary += `\nДуэль архетипов: ${results.duelArchetypes[0]} (${results.dominantArchetypeScore.toFixed(1)}/5) + ${results.duelArchetypes[1]} (${results.secondaryArchetypeScore.toFixed(1)}/5)\n`;
        }
        
        // Общий балл
        summary += `\nОбщий балл анкеты: ${results.totalScore} из ${results.answeredQuestions * 5}\n`;
        summary += `Средний балл: ${results.averageScore}/5\n\n`;
        
        // Целостность по сферам
        summary += 'Целостность по сферам:\n';
        if (results.domainScores) {
            // Сортируем по баллам
            const domainEntries = Object.entries(results.domainScores);
            domainEntries.sort((a, b) => {
                const avgA = results.domainCounts[a[0]] ? a[1] / results.domainCounts[a[0]] : 0;
                const avgB = results.domainCounts[b[0]] ? b[1] / results.domainCounts[b[0]] : 0;
                return avgA - avgB; // От меньшего к большему
            });
            
            domainEntries.forEach(([domain, score]) => {
                const avgScore = results.domainCounts[domain] > 0 ? 
                    (score / results.domainCounts[domain]).toFixed(1) : '0';
                
                const domainInfo = this.data.domains[domain];
                const domainName = domainInfo ? domainInfo.name : domain;
                
                let status = '';
                let statusIcon = '';
                
                if (avgScore >= 4) {
                    status = 'Высокая гармония';
                    statusIcon = '✓';
                } else if (avgScore <= 2) {
                    status = 'Требует внимания';
                    statusIcon = '⚠️';
                } else {
                    status = 'Умеренный баланс';
                    statusIcon = '➖';
                }
                
                const isLowest = domain === results.lowestDomain;
                const isHighest = domain === results.highestDomain;
                const focusMarker = isLowest ? ' [ФОКУС]' : '';
                const strengthMarker = isHighest ? ' [СИЛА]' : '';
                
                summary += `${statusIcon} ${domainName}: ${avgScore} баллов (${status})${focusMarker}${strengthMarker}\n`;
            });
        }
        
        // Фокус на развитии
        if (results.focusStatement) {
            summary += `\nФокус на развитии:\n"${results.focusStatement.questionText}"\n`;
            summary += `Сфера: ${this.getDomainName(results.focusStatement.domain)}, `;
            summary += `Архетип: ${results.focusStatement.archetype}, `;
            summary += `Балл: ${results.focusStatement.points}/5`;
        }
        
        return summary;
    },
    
    // Остальные функции остаются без изменений...
    generateRecommendations(results) {
        // ... (код без изменений)
        const recommendations = new Set();
        // ... (существующий код)
        return Array.from(recommendations).slice(0, 7);
    },
    
    generateBasicRecommendations(results) {
        // ... (код без изменений)
        return recommendations.slice(0, 5);
    },
    
    getArchetypeDescription(archetypeName) {
        if (!archetypeName || !this.data.archetypes) {
            return 'Архетип не определён';
        }
        
        const archetype = Object.values(this.data.archetypes).find(a => 
            a.name.toLowerCase().includes(archetypeName.toLowerCase())
        );
        
        return archetype ? archetype.description : 
               `Вы проявляете качества ${archetypeName}.`;
    },
    
    getDomainName(domainKey) {
        if (!domainKey || !this.data.domains) {
            return domainKey || 'Неизвестная сфера';
        }
        
        const domain = this.data.domains[domainKey];
        return domain ? domain.name : domainKey;
    },
    
    getDomainDescription(domainKey) {
        if (!domainKey || !this.data.domains) {
            return '';
        }
        
        const domain = this.data.domains[domainKey];
        return domain ? domain.description : '';
    },
    
    calculateArchetype() {
        this.calculateQuestionnaireResults();
        return this.user.archetype;
    },
    
    calculateTotalScore() {
        let totalScore = 0;
        this.user.questionnaireAnswers.forEach(answer => {
            if (answer && answer.points !== undefined) {
                totalScore += answer.points;
            }
        });
        return totalScore;
    },
    
    resetQuestionnaire() {
        this.user.questionnaireAnswers = [];
        this.user.archetypeResults = null;
        this.user.archetype = null;
    },
    
    generateOrderId() {
        this.user.orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        return this.user.orderId;
    },
    
    // Новая функция для сброса состояния
    resetAll() {
        this.user = {
            selectedFormat: null,
            questionnaireAnswers: [],
            selectedPose: null,
            uploadedPhoto: null,
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            archetype: null,
            archetypeResults: null,
            orderId: null,
            contractGenerated: false,
            paymentCompleted: false
        };
    }
};