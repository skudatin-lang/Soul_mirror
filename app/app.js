// Главный скрипт приложения
window.App = {
    // Инициализация приложения
    async init() {
        try {
            console.log('🚀 Инициализация приложения...');
            
            // Показываем индикатор загрузки
            this.showLoading(true, 'Загрузка данных из таблицы...');
            
            // Загружаем данные из таблицы
            await this.loadData();
            
            // Загружаем первый экран
            ScreenManager.load(1);
            
            // Показываем уведомление
            ScreenManager.showNotification('Данные успешно загружены из таблицы!', false);
            
        } catch (error) {
            console.error('💥 Ошибка инициализации:', error);
            
            // Показываем ошибку
            document.getElementById('app-container').innerHTML = `
                <div class="error-screen">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>Ошибка загрузки данных</h2>
                        <p>${error.message || 'Не удалось загрузить данные из таблицы'}</p>
                        <div class="error-help">
                            <p><strong>Проверьте:</strong></p>
                            <ul>
                                <li>Доступность Google Таблицы</li>
                                <li>Наличие нужных листов в таблице</li>
                                <li>Интернет-соединение</li>
                                <li>Настройки APPS Script</li>
                            </ul>
                        </div>
                        <button class="btn" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Перезагрузить страницу
                        </button>
                    </div>
                </div>
            `;
            
        } finally {
            // Скрываем индикатор загрузки
            this.showLoading(false);
        }
    },
    
    // Загрузка данных из Google Sheets
    async loadData() {
        if (typeof window.loadAllData !== 'function') {
            throw new Error('Функция загрузки данных не найдена');
        }
        
        const data = await window.loadAllData();
        
        // Проверяем, что данные загрузились
        if (!data) {
            throw new Error('Данные не загружены');
        }
        
        // Проверяем наличие основных данных
        if (!data.formats || Object.keys(data.formats).length === 0) {
            throw new Error('Не найдены форматы моделей в таблице');
        }
        
        if (!data.questionnaire || data.questionnaire.length === 0) {
            throw new Error('Не найдены вопросы анкеты в таблице');
        }
        
        // Проверяем наличие новых полей в анкете
        const firstQuestion = data.questionnaire[0];
        if (!firstQuestion.archetype) {
            console.warn('⚠️ В вопросах анкеты отсутствует поле "archetype". Результаты могут быть некорректными.');
        }
        
        if (!firstQuestion.domain) {
            console.warn('⚠️ В вопросах анкеты отсутствует поле "domain". Анализ целостности будет ограничен.');
        }
        
        // Проверяем наличие листа архетипов
        if (!data.archetypes || Object.keys(data.archetypes).length === 0) {
            console.warn('⚠️ Лист архетипов не найден. Будут использованы базовые описания.');
        }
        
        // Проверяем наличие листа доменов
        if (!data.domains || Object.keys(data.domains).length === 0) {
            console.warn('⚠️ Лист сфер (domains) не найден. Анализ целостности будет ограничен.');
        }
        
        // Проверяем наличие правил рекомендаций
        if (!data.recommendationRules || data.recommendationRules.length === 0) {
            console.warn('⚠️ Лист правил рекомендаций не найден. Будут использованы общие рекомендации.');
        }
        
        // Сохраняем данные в состоянии
        AppState.data = data;
        
        console.log('✅ Данные успешно загружены в AppState');
        console.log('📊 Статистика:', {
            форматы: Object.keys(data.formats).length,
            вопросы: data.questionnaire.length,
            архетипы: Object.keys(data.archetypes || {}).length,
            сферы: Object.keys(data.domains || {}).length,
            правила: data.recommendationRules?.length || 0
        });
    },
    
    // Показать/скрыть индикатор загрузки
    showLoading(show, message = 'Загрузка...') {
        let loader = document.getElementById('app-loader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'app-loader';
                loader.innerHTML = `
                    <div class="loading-overlay">
                        <div class="loading-content">
                            <i class="fas fa-spinner fa-spin"></i>
                            <div>${message}</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }
};

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});