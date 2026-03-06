// telegram.js — безопасная отправка через n8n (токен скрыт на сервере)

const N8N_WEBHOOK_URL = 'https://konsta.app.n8n.cloud/webhook/cf59d706-0c1d-449b-ac95-c5453972ba06';

window.sendOrderToTelegram = async function() {
    try {
        if (!AppState?.user) throw new Error('Нет данных заказа');

        const format  = AppState.getSelectedFormat?.() || {};
        const pose    = AppState.getSelectedPose?.()   || {};
        const results = AppState.user.archetypeResults || {};

        const payload = {
            clientName:   AppState.user.clientName  || '—',
            clientEmail:  AppState.user.clientEmail || '—',
            clientPhone:  AppState.user.clientPhone || '',
            orderId:      AppState.user.orderId     || '—',
            format:       format.name               || '—',
            price:        format.price ? format.price.toLocaleString('ru-RU') + ' ₽' : '—',
            pose:         pose.name                 || '—',
            archetype:    results.dominantArchetype || '—',
            averageScore: typeof results.averageScore === 'number' ? results.averageScore.toFixed(1) : '—',
            contract:     window.generateContractText ? window.generateContractText() : '',
        };

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Ошибка n8n: ${response.status}`);

        if (AppState.user.uploadedPhoto) await sendPhotoViaN8n();
        if (window.receiptFileToSend || AppState.user.receiptFile) await sendReceiptViaN8n();

        return true;

    } catch (error) {
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.showNotification('Не удалось отправить данные. Попробуйте ещё раз.', true);
        }
        throw error;
    }
};

async function sendPhotoViaN8n() {
    try {
        if (!AppState.user.uploadedPhoto) return;
        const blob = await fetch(AppState.user.uploadedPhoto).then(r => r.blob());
        const formData = new FormData();
        formData.append('orderId', AppState.user.orderId || '—');
        formData.append('clientName', AppState.user.clientName || '—');
        formData.append('type', 'photo');
        formData.append('file', blob, 'client_photo.jpg');
        await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
    } catch (err) { /* фото не критично */ }
}

async function sendReceiptViaN8n() {
    try {
        const file = window.receiptFileToSend || AppState.user.receiptFile;
        if (!file) return;
        const formData = new FormData();
        formData.append('orderId', AppState.user.orderId || '—');
        formData.append('clientName', AppState.user.clientName || '—');
        formData.append('type', 'receipt');
        formData.append('file', file, 'receipt.jpg');
        await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
    } catch (err) { /* чек не критично */ }
}
