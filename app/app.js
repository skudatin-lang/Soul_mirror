// Главный скрипт приложения
window.App = {
    async init() {
        try {
            this.showLoading(true, 'Загрузка данных из таблицы...');
            await this.loadData();
            ScreenManager.load(1);
            ScreenManager.showNotification('Данные успешно загружены из таблицы!', false);
        } catch (error) {
            document.getElementById('app-container').innerHTML = `
                <div class="error-screen">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>Ошибка загрузки данных</h2>
                        <p>Не удалось загрузить данные. Проверьте подключение к интернету.</p>
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
            this.showLoading(false);
        }
    },

    async loadData() {
        if (typeof window.loadAllData !== 'function') {
            throw new Error('Функция загрузки данных не найдена');
        }

        const data = await window.loadAllData();

        if (!data) throw new Error('Данные не загружены');
        if (!data.formats || Object.keys(data.formats).length === 0) throw new Error('Не найдены форматы моделей в таблице');
        if (!data.questionnaire || data.questionnaire.length === 0) throw new Error('Не найдены вопросы анкеты в таблице');

        AppState.data = data;
    },

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
            if (loader) loader.remove();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => { App.init(); });
