// gsheet.js - загрузка данных из Google Sheets
async function loadSheetData(sheetName) {
    try {
        const url = `${window.APP_CONFIG.WEB_APP_URL}?sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (parseError) {
            throw new Error(`Некорректный ответ сервера`);
        }

        if (data && data.error) throw new Error(data.message || 'Ошибка сервера');

        return data || [];

    } catch (error) {
        throw error;
    }
}

async function loadAllData() {
    const sheets = [
        'model_formats', 'questionnaire', 'poses', 'archetypes',
        'contract_template', 'domains', 'recommendation_rules'
    ];

    try {
        const results = {};
        for (const sheetName of sheets) {
            try {
                results[sheetName] = await loadSheetData(sheetName);
            } catch (error) {
                results[sheetName] = [];
            }
        }
        return transformData(results);
    } catch (error) {
        throw error;
    }
}

function transformData(rawData) {
    const formatsMap = {};
    if (rawData.model_formats && Array.isArray(rawData.model_formats)) {
        rawData.model_formats.forEach(item => {
            const id = item.id || item.ID || item.Id || '';
            if (id) {
                formatsMap[id] = {
                    id,
                    name: item.name || item.Name || item.title || '',
                    description: item.description || item.Description || '',
                    price: parseFloat(item.price || item.Price || item.cost || 12000),
                    imageUrl: item.imageUrl || item.image || item.Image || ''
                };
            }
        });
    }

    const questionnaireData = [];
    if (rawData.questionnaire && Array.isArray(rawData.questionnaire)) {
        rawData.questionnaire.forEach((q, index) => {
            const questionId = q.id || q.ID || `q${index + 1}`;
            const options = [];
            for (let i = 1; i <= 5; i++) {
                let optionText = q[`option_${i}`] || q[`Option${i}`] || q[`вариант${i}`];
                let points = q[`points_${i}`] || q[`Points${i}`] || q[`баллы${i}`];
                if (optionText && optionText.trim() !== '') {
                    options.push({ text: optionText.trim(), points: parseInt(points) || (6 - i) });
                }
            }
            if (options.length === 0) {
                options.push(
                    { text: 'Полностью согласен', points: 5 },
                    { text: 'Согласен', points: 4 },
                    { text: 'Нейтрально', points: 3 },
                    { text: 'Не согласен', points: 2 },
                    { text: 'Полностью не согласен', points: 1 }
                );
            }
            questionnaireData.push({
                id: questionId,
                question: q.question || q.Question || q.Вопрос || `Вопрос ${index + 1}`,
                archetype: q.archetype || q.Archetype || q.архетип || '',
                domain: q.domain || q.Domain || q.сфера || 'general',
                options
            });
        });
    }

    const posesByCategory = { general: [] };
    if (rawData.poses && Array.isArray(rawData.poses)) {
        rawData.poses.forEach(pose => {
            const category = pose.category || pose.Category || 'general';
            const poseId = pose.id || pose.ID || pose.name;
            if (!posesByCategory[category]) posesByCategory[category] = [];
            posesByCategory[category].push({
                id: poseId,
                name: pose.name || pose.Name || pose.title || 'Поза',
                category,
                imageUrl: pose.imageUrl || pose.image || pose.Image || ''
            });
        });
    }

    const archetypesData = {};
    if (rawData.archetypes && Array.isArray(rawData.archetypes)) {
        rawData.archetypes.forEach(arch => {
            const id = arch.id || arch.ID || arch.name;
            if (id) {
                archetypesData[id] = {
                    id, name: arch.name || arch.Name || 'Архетип',
                    description: arch.description || arch.Description || '',
                    minScore: parseInt(arch.minScore || arch.min_score || 0),
                    maxScore: parseInt(arch.maxScore || arch.max_score || 100),
                    portraitText: arch.portraitText || arch.portrait_text || arch.description || '',
                    summary: arch.summary || arch.Summary || '',
                    recommendations: arch.recommendations || arch.Recommendations || '',
                    strength: arch.strength || arch.Strength || '',
                    challenge: arch.challenge || arch.Challenge || ''
                };
            }
        });
    }

    const contractTemplateData = [];
    if (rawData.contract_template && Array.isArray(rawData.contract_template)) {
        rawData.contract_template.forEach((item, index) => {
            const text = item.text || item.Text || item.Текст || '';
            if (text && text.trim() !== '') {
                contractTemplateData.push({
                    id: (item.id || item.ID || index + 1).toString(),
                    section: item.section || item.Section || item.Раздел || '',
                    text
                });
            }
        });
        contractTemplateData.sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
    }

    const domainsData = {};
    if (rawData.domains && Array.isArray(rawData.domains)) {
        rawData.domains.forEach(domain => {
            const id = domain.id || domain.ID || domain.name;
            if (id) {
                domainsData[id] = {
                    id, name: domain.name || domain.Name || 'Сфера',
                    description: domain.description || domain.Description || '',
                    low_score_message: domain.low_score_message || domain.lowScoreMessage || '',
                    medium_score_message: domain.medium_score_message || domain.mediumScoreMessage || '',
                    high_score_message: domain.high_score_message || domain.highScoreMessage || '',
                    recommendations_low: (domain.recommendations_low || domain.recommendationsLow || '').split('\n').filter(r => r.trim()),
                    recommendations_medium: (domain.recommendations_medium || domain.recommendationsMedium || '').split('\n').filter(r => r.trim()),
                    recommendations_high: (domain.recommendations_high || domain.recommendationsHigh || '').split('\n').filter(r => r.trim())
                };
            }
        });
    }

    const recommendationRulesData = [];
    if (rawData.recommendation_rules && Array.isArray(rawData.recommendation_rules)) {
        rawData.recommendation_rules.forEach(rule => {
            const id = rule.id || rule.ID || '';
            if (id) {
                recommendationRulesData.push({
                    id,
                    condition_type: rule.condition_type || rule.conditionType || '',
                    condition_value: rule.condition_value || rule.conditionValue || '',
                    recommendation_text: rule.recommendation_text || rule.recommendationText || '',
                    priority: parseInt(rule.priority || rule.Priority || 1),
                    applicable_domains: (rule.applicable_domains || rule.applicableDomains || '').split(',').map(d => d.trim()).filter(d => d),
                    applicable_archetypes: (rule.applicable_archetypes || rule.applicableArchetypes || '').split(',').map(a => a.trim()).filter(a => a)
                });
            }
        });
        recommendationRulesData.sort((a, b) => a.priority - b.priority);
    }

    return {
        formats: formatsMap,
        questionnaire: questionnaireData,
        poses: posesByCategory,
        archetypes: archetypesData,
        contractTemplate: contractTemplateData,
        domains: domainsData,
        recommendationRules: recommendationRulesData
    };
}

window.loadAllData = loadAllData;
window.loadSheetData = loadSheetData;
