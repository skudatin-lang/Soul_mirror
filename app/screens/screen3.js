// Экран 3: Выбор позы
window.Screen3 = {
    // Рендеринг экрана
    render() {
        const container = document.getElementById('app-container');
        container.innerHTML = this.getHTML();
        
        // Рендерим позы
        this.renderPoses();
        
        // Инициализация событий ДОЛЖНА БЫТЬ ПОСЛЕ рендеринга
        setTimeout(() => {
            this.initEvents();
        }, 100);
        
        // Проверяем состояние для активации кнопки
        this.updateButtonState();
    },
    
    // HTML экрана
    getHTML() {
        return `
            <div class="screen active" id="screen3">
                <div class="screen-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-user-pose"></i>
                        </div>
                        <div class="header-text">
                            <h1 class="screen-title">Выбор позы для модели</h1>
                            <div class="screen-subtitle-container">
                                <p class="screen-subtitle">Выбери позу — и дай форме своему внутреннему миру</p>
                                <p class="screen-subtitle-description">
                                    Твоя фигурка — не статичная копия, а живой символ. Поза определяет, как она «звучит»: с достоинством Мудреца, в движении Искателя или с тихой силой Творца. Выбери ту, что резонирует внутри — всё остальное мы адаптируем под твой формат.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="selection-status">
                        <div class="status-item ${AppState.user.selectedPose ? 'active' : ''}">
                            <div class="status-icon">
                                <i class="fas ${AppState.user.selectedPose ? 'fa-check-circle' : 'fa-user'}"></i>
                            </div>
                            <div class="status-text">
                                <div class="status-title">Поза выбрана</div>
                                <div class="status-detail" id="selectedPoseName">${AppState.user.selectedPose ? 'Готова' : 'Не выбрана'}</div>
                            </div>
                        </div>
                        
                        <div class="status-divider">
                            <i class="fas fa-arrow-right"></i>
                        </div>
                        
                        <div class="status-item ${AppState.user.uploadedPhoto ? 'active' : ''}">
                            <div class="status-icon">
                                <i class="fas ${AppState.user.uploadedPhoto ? 'fa-check-circle' : 'fa-camera'}"></i>
                            </div>
                            <div class="status-text">
                                <div class="status-title">Фото загружено</div>
                                <div class="status-detail" id="photoStatus">${AppState.user.uploadedPhoto ? 'Готово' : 'Ожидание'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="screen-tabs">
                    <div class="tabs-container">
                        <button class="tab-btn active" data-tab="poses">
                            <i class="fas fa-user-friends"></i>
                            <span>Выбор позы</span>
                        </button>
                        <button class="tab-btn" data-tab="photo">
                            <i class="fas fa-camera"></i>
                            <span>Загрузка фото</span>
                        </button>
                    </div>
                </div>
                
                <div class="tab-content active" id="posesTab">
                    <div class="section-header">
                        <div class="section-title">
                            <i class="fas fa-user-check"></i>
                            <h3>Доступные позы для моделирования</h3>
                        </div>
                        <div class="section-subtitle">
                            Перед тобой — объёмные силуэты, созданные специально для твоего архетипа.<br>
                            Каждая поза — это воплощение энергии: покой, решимость, открытость, устремление.<br>
                            Просто выбери ту, которая вызывает отклик — мы интегрируем её в твою модель, сохранив пропорции выбранного формата (классика или CUTE).
                        </div>
                    </div>
                    
                    <div class="poses-container" id="posesContainer">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <div>Загрузка поз...</div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="photoTab">
                    <div class="section-header">
                        <div class="section-title">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <h3>Загрузка вашего фото</h3>
                        </div>
                        <div class="section-subtitle">
                            Присылай любое фото: селфи, силуэт, деталь одежды, аксессуар, даже пейзаж — всё, что несёт твой след.<br>
                            Мы возьмём из него ключевые черты — линию подбородка, очки, кольцо, прическу — и вплетём в модель, чтобы она стала ещё ближе к тебе.<br>
                            <strong>Чем глубже связь — тем сильнее зеркало.</strong>
                        </div>
                    </div>
                    
                    <div class="photo-upload-area">
                        <div class="upload-card" id="uploadCard">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="upload-text">
                                <h4>Перетащите фото сюда</h4>
                                <p>или нажмите для выбора файла</p>
                            </div>
                            <div class="upload-details">
                                <div class="detail-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Поддерживаемые форматы: JPG, PNG</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Максимальный размер: 5 МБ</span>
                                </div>
                            </div>
                            <button class="btn btn-outline upload-btn" id="selectPhotoBtn">
                                <i class="fas fa-folder-open"></i>
                                Выбрать файл
                            </button>
                            <input type="file" id="photoInput" accept="image/*" style="display: none;">
                        </div>
                        
                        <div class="photo-preview-container" id="photoPreviewContainer">
                            <div class="preview-header">
                                <h4><i class="fas fa-image"></i> Предпросмотр</h4>
                                <button class="btn-remove" id="removePhotoBtn" style="display: ${AppState.user.uploadedPhoto ? 'block' : 'none'}">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            </div>
                            <div class="preview-content" id="photoPreview">
                                ${AppState.user.uploadedPhoto ? `
                                    <div class="preview-image loaded">
                                        <img src="${AppState.user.uploadedPhoto}" alt="Загруженное фото">
                                    </div>
                                ` : `
                                    <div class="preview-placeholder">
                                        <i class="fas fa-user-circle"></i>
                                        <p>Здесь появится ваше фото</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <div class="photo-guidelines">
                        <div class="guideline-title">
                            <i class="fas fa-lightbulb"></i>
                            <span>Рекомендации для лучшего результата:</span>
                        </div>
                        <div class="guideline-list">
                            <div class="guideline-item">
                                <i class="fas fa-check"></i>
                                <span>Используйте четкое фото с хорошим освещением</span>
                            </div>
                            <div class="guideline-item">
                                <i class="fas fa-check"></i>
                                <span>Лицо должно быть хорошо видно, без очков и головных уборов</span>
                            </div>
                            <div class="guideline-item">
                                <i class="fas fa-check"></i>
                                <span>Выражение лица должно быть естественным</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="navigation-buttons">
                    <button class="btn btn-outline" id="prevBtn">
                        <i class="fas fa-arrow-left"></i> Вернуться к анкете
                    </button>
                    <button class="btn btn-primary" id="nextBtn" ${AppState.user.selectedPose && AppState.user.uploadedPhoto ? '' : 'disabled'}>
                        <i class="fas fa-file-contract"></i> ${AppState.user.selectedPose && AppState.user.uploadedPhoto ? 'Все готово! Перейти к договору' : 'Перейти к договору'}
                    </button>
                </div>
                
                <div class="help-tip">
                    <i class="fas fa-info-circle"></i>
                    <span>Выбранная поза и ваше фото будут использованы для создания уникального интегративного портрета.</span>
                </div>
            </div>
        `;
    },
    
    // Рендеринг поз
    renderPoses() {
        const container = document.getElementById('posesContainer');
        
        if (!AppState.data.poses || Object.keys(AppState.data.poses).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-user-slash"></i>
                    </div>
                    <h3>Позы не найдены</h3>
                    <p>Пожалуйста, проверьте подключение к интернету и попробуйте перезагрузить страницу</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        const allPoses = Object.values(AppState.data.poses).flat();
        
        allPoses.forEach(pose => {
            const isSelected = AppState.user.selectedPose === pose.id;
            
            html += `
                <div class="pose-card ${isSelected ? 'selected' : ''}" data-pose-id="${pose.id}">
                    <div class="pose-image-container">
                        <div class="pose-image">
                            <img src="${pose.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNNzUgNzVIMTI1VjEyNUg3NVY3NVoiIGZpbGw9IiNFMkUyRTIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iMTUiIGZpbGw9IiMzNDk4REIiLz48cGF0aCBkPSJNODAgOTVDODAgODQuNSA5MCA5MCAxMDAgOTBTMTIwIDg0LjUgMTIwIDk1VjEyMEg4MFY5NVoiIGZpbGw9IiMzNDk4REIiLz48L3N2Zz4='}" 
                                 alt="${pose.name}" 
                                 loading="lazy"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTVBNTVBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UG9zZTwvdGV4dD48L3N2Zz4=';"
                                 style="object-fit: contain; max-width: 100%; max-height: 100%;">
                        </div>
                        ${isSelected ? '<div class="pose-selected"><i class="fas fa-check-circle"></i></div>' : ''}
                    </div>
                    <div class="pose-info">
                        <div class="pose-name">${pose.name}</div>
                        <div class="pose-category">${pose.category || 'Общая поза'}</div>
                    </div>
                    <button class="pose-select-btn ${isSelected ? 'selected' : ''}">
                        ${isSelected ? '<i class="fas fa-check"></i> Выбрано' : 'Выбрать позу'}
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
        this.bindPoseEvents();
    },
    
    // Привязка обработчиков к карточкам поз
    bindPoseEvents() {
        setTimeout(() => {
            document.querySelectorAll('.pose-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // Предотвращаем срабатывание при клике на кнопку внутри карточки
                    if (!e.target.closest('.pose-select-btn')) {
                        this.selectPose(card);
                    }
                });
            });
            
            document.querySelectorAll('.pose-select-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const card = e.target.closest('.pose-card');
                    if (card) {
                        this.selectPose(card);
                    }
                });
            });
        }, 50);
    },
    
    // Инициализация событий
    initEvents() {
        console.log('Инициализация событий Screen3');
        
        // Кнопка "Назад"
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                ScreenManager.prev();
            });
        }
        
        // Кнопка "Далее"
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                ScreenManager.next();
            });
        }
        
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Выбор фото
        const selectPhotoBtn = document.getElementById('selectPhotoBtn');
        const photoInput = document.getElementById('photoInput');
        
        if (selectPhotoBtn && photoInput) {
            selectPhotoBtn.addEventListener('click', () => {
                photoInput.click();
            });
        }
        
        const uploadCard = document.getElementById('uploadCard');
        if (uploadCard) {
            uploadCard.addEventListener('click', (e) => {
                if (!e.target.closest('.upload-btn')) {
                    photoInput.click();
                }
            });
        }
        
        // Загрузка фото через input
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }
        
        // Удаление фото
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                this.removePhoto();
            });
        }
        
        // Drag and drop для фото
        this.initDragAndDrop();
    },
    
    // Инициализация drag and drop
    initDragAndDrop() {
        const uploadCard = document.getElementById('uploadCard');
        
        if (!uploadCard) return;
        
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.classList.add('dragover');
        });
        
        uploadCard.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('dragover');
        });
        
        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processPhotoFile(files[0]);
            }
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
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}Tab`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    },
    
    // Выбор позы
    selectPose(poseCard) {
        const poseId = poseCard.dataset.poseId;
        
        // Сохраняем выбранную позу
        AppState.user.selectedPose = poseId;
        
        // Снимаем выделение со всех карточек
        document.querySelectorAll('.pose-card').forEach(card => {
            card.classList.remove('selected');
            const btn = card.querySelector('.pose-select-btn');
            if (btn) {
                btn.classList.remove('selected');
                btn.innerHTML = 'Выбрать позу';
            }
            
            // Удаляем иконку выбора
            const selectedIcon = card.querySelector('.pose-selected');
            if (selectedIcon) selectedIcon.remove();
        });
        
        // Выделяем выбранную карточку
        poseCard.classList.add('selected');
        const selectBtn = poseCard.querySelector('.pose-select-btn');
        if (selectBtn) {
            selectBtn.classList.add('selected');
            selectBtn.innerHTML = '<i class="fas fa-check"></i> Выбрано';
        }
        
        // Добавляем иконку выбора
        const selectedIcon = document.createElement('div');
        selectedIcon.className = 'pose-selected';
        selectedIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        poseCard.querySelector('.pose-image-container').appendChild(selectedIcon);
        
        // Обновляем статус
        this.updateStatus();
        this.updateButtonState();
        
        // Показываем уведомление
        const poseName = poseCard.querySelector('.pose-name').textContent;
        ScreenManager.showNotification(`Выбрана поза: ${poseName}`, false);
    },
    
    // Обработка загрузки фото
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processPhotoFile(file);
        }
    },
    
    // Обработка файла фото
    processPhotoFile(file) {
        if (!file.type.match('image.*')) {
            ScreenManager.showNotification('Файл должен быть изображением (JPG, PNG, GIF)', true);
            return;
        }
        
        if (file.size > window.APP_CONFIG.MAX_PHOTO_SIZE) {
            ScreenManager.showNotification('Файл слишком большой. Максимальный размер: 5 МБ', true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.user.uploadedPhoto = e.target.result;
            this.renderPhotoPreview();
            this.updateStatus();
            this.updateButtonState();
            
            ScreenManager.showNotification('Фото успешно загружено!', false);
        };
        reader.readAsDataURL(file);
    },
    
    // Удаление фото
    removePhoto() {
        AppState.user.uploadedPhoto = null;
        const photoInput = document.getElementById('photoInput');
        if (photoInput) {
            photoInput.value = '';
        }
        this.renderPhotoPreview();
        this.updateStatus();
        this.updateButtonState();
        
        ScreenManager.showNotification('Фото удалено', false);
    },
    
    // Рендер превью фото
    renderPhotoPreview() {
        const previewContainer = document.getElementById('photoPreview');
        const removeBtn = document.getElementById('removePhotoBtn');
        
        if (AppState.user.uploadedPhoto) {
            previewContainer.innerHTML = `
                <div class="preview-image">
                    <img src="${AppState.user.uploadedPhoto}" alt="Загруженное фото" style="object-fit: contain; max-width: 100%; max-height: 100%;">
                </div>
            `;
            if (removeBtn) {
                removeBtn.style.display = 'block';
            }
            
            // Добавляем анимацию появления
            setTimeout(() => {
                const imgElement = previewContainer.querySelector('.preview-image');
                if (imgElement) {
                    imgElement.classList.add('loaded');
                }
            }, 50);
        } else {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-user-circle"></i>
                    <p>Здесь появится ваше фото</p>
                </div>
            `;
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
        }
    },
    
    // Обновление статуса
    updateStatus() {
        const selectedPoseName = document.getElementById('selectedPoseName');
        const photoStatus = document.getElementById('photoStatus');
        
        // Обновляем позу
        if (AppState.user.selectedPose && AppState.data.poses) {
            const allPoses = Object.values(AppState.data.poses).flat();
            const pose = allPoses.find(p => p.id === AppState.user.selectedPose);
            if (selectedPoseName) {
                selectedPoseName.textContent = pose ? pose.name : 'Выбрана';
            }
            
            // Обновляем иконку статуса
            const poseStatusItem = document.querySelector('.status-item:nth-child(1)');
            const poseIcon = poseStatusItem ? poseStatusItem.querySelector('.status-icon i') : null;
            
            if (poseIcon) {
                poseIcon.className = 'fas fa-check-circle';
            }
            if (poseStatusItem) {
                poseStatusItem.classList.add('active');
            }
        } else {
            if (selectedPoseName) {
                selectedPoseName.textContent = 'Не выбрана';
            }
            
            const poseStatusItem = document.querySelector('.status-item:nth-child(1)');
            const poseIcon = poseStatusItem ? poseStatusItem.querySelector('.status-icon i') : null;
            
            if (poseIcon) {
                poseIcon.className = 'fas fa-user';
            }
            if (poseStatusItem) {
                poseStatusItem.classList.remove('active');
            }
        }
        
        // Обновляем фото
        if (AppState.user.uploadedPhoto) {
            if (photoStatus) {
                photoStatus.textContent = 'Загружено';
            }
            
            const photoStatusItem = document.querySelector('.status-item:nth-child(3)');
            const photoIcon = photoStatusItem ? photoStatusItem.querySelector('.status-icon i') : null;
            
            if (photoIcon) {
                photoIcon.className = 'fas fa-check-circle';
            }
            if (photoStatusItem) {
                photoStatusItem.classList.add('active');
            }
        } else {
            if (photoStatus) {
                photoStatus.textContent = 'Ожидание';
            }
            
            const photoStatusItem = document.querySelector('.status-item:nth-child(3)');
            const photoIcon = photoStatusItem ? photoStatusItem.querySelector('.status-icon i') : null;
            
            if (photoIcon) {
                photoIcon.className = 'fas fa-camera';
            }
            if (photoStatusItem) {
                photoStatusItem.classList.remove('active');
            }
        }
    },
    
    // Обновление состояния кнопки
    updateButtonState() {
        const hasPose = !!AppState.user.selectedPose;
        const hasPhoto = !!AppState.user.uploadedPhoto;
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.disabled = !(hasPose && hasPhoto);
            
            // Меняем стиль кнопки если все готово
            if (hasPose && hasPhoto) {
                nextBtn.classList.add('ready');
                nextBtn.innerHTML = '<i class="fas fa-file-contract"></i> Все готово! Перейти к договору';
            } else {
                nextBtn.classList.remove('ready');
                nextBtn.innerHTML = '<i class="fas fa-file-contract"></i> Перейти к договору';
            }
        }
    }
};