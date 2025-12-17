const prizes = [
    // Призы и их шансы. Сумма шансов: 100
    { id: '5', chance: 35, text: '5% Скидка', chanceGroup: 'high' },
    { id: '10', chance: 25, text: '10% Скидка', chanceGroup: 'high' },
    { id: '15', chance: 15, text: '15% Скидка', chanceGroup: 'medium' },
    { id: '20', chance: 10, text: '20% Скидка', chanceGroup: 'medium' },
    { id: '30', chance: 8, text: '30% Скидка', chanceGroup: 'medium' },
    { id: '50', chance: 5, text: '50% Скидка', chanceGroup: 'low' },
    { id: '100', chance: 2, text: '100% Скидка! 🏆', chanceGroup: 'low' },
];

const wheel = document.querySelector('.wheel');
const spinButton = document.getElementById('spinButton');
const SECTOR_HEIGHT = 100; // Должно совпадать с CSS-переменной
const TOTAL_DURATION = 5000; // Длительность анимации в мс (5с)

let isSpinning = false;
let sectorsInWheel = [];

// --- 1. Функция взвешенного случайного выбора ---
function getWinningPrize() {
    let totalWeight = prizes.reduce((sum, prize) => sum + prize.chance, 0);
    let random = Math.random() * totalWeight;

    for (let prize of prizes) {
        if (random < prize.chance) {
            return prize;
        }
        random -= prize.chance;
    }
    return prizes[0]; 
}

// --- 2. Генерация секторов для рулетки ---
function populateWheel() {
    // Создаем "длинную" рулетку, повторяя призы
    const REPETITIONS = 20;

    for (let i = 0; i < REPETITIONS; i++) {
        const shuffledPrizes = [...prizes].sort(() => Math.random() - 0.5);

        shuffledPrizes.forEach(prize => {
            const sector = document.createElement('div');
            sector.className = 'sector';
            sector.setAttribute('data-id', prize.id);
            sector.setAttribute('data-chance-group', prize.chanceGroup);
            sector.textContent = prize.text;
            // Если используете изображения, замените строку выше на:
            // sector.innerHTML = `<img src="images/discount_${prize.id}.png" alt="${prize.text}">`;
            wheel.appendChild(sector);
            sectorsInWheel.push(sector);
        });
    }
}

// --- 3. Логика вращения ---
spinButton.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;

    const winningPrize = getWinningPrize();
    
    // Определяем, на каком секторе-дубликате остановиться (выбираем в последней трети)
    const winningSectors = sectorsInWheel.filter(s => s.getAttribute('data-id') === winningPrize.id);
    const startRange = Math.floor(winningSectors.length * 0.7);
    const endRange = winningSectors.length - 1; 
    
    // Случайный выбор конечного сектора
    const selectedSectorIndex = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
    const finalSector = winningSectors[selectedSectorIndex];
    const finalPositionIndex = sectorsInWheel.indexOf(finalSector);

    
    // --- Расчет смещения для центрирования ---
    
    // 1. Позиция остановки (перемещение, чтобы выигрышный сектор был в центре видимой области)
    // Центр контейнера (указатель) находится на 1.5 * SECTOR_HEIGHT (так как видно 3 сектора)
    // Мы хотим, чтобы ВЕРХНЯЯ ГРАНИЦА выигрышного сектора оказалась на расстоянии 1 * SECTOR_HEIGHT от верха.
    const translateY_Stop = (finalPositionIndex * SECTOR_HEIGHT) - (SECTOR_HEIGHT * 1);
    
    // 2. Добавляем дополнительные обороты для эффекта
    const fullSpins = 10; // Минимум 10 полных оборотов
    const totalWheelLength = sectorsInWheel.length * SECTOR_HEIGHT;
    
    // Общее расстояние, на которое нужно сместить рулетку вверх (отрицательное значение)
    const finalTransform = -( (fullSpins * totalWheelLength) + translateY_Stop );
    
    
    // --- Сброс и запуск анимации ---
    
    // 1. Мгновенно сбрасываем transition и позицию перед стартом
    wheel.style.transition = 'none';
    
    // Устанавливаем позицию в 0 (если она была сброшена после предыдущего вращения)
    // Это критично для избежания "белого фона", если предыдущее вращение закончилось далеко.
    wheel.style.transform = `translateY(${-(translateY_Stop)}px)`; 
    // ^ Устанавливаем в "начало" выигрышного сектора, чтобы анимация стартовала плавно

    
    // 2. Запуск анимации
    setTimeout(() => {
        wheel.classList.add('spinning');
        wheel.style.transform = `translateY(${finalTransform}px)`;

        // 3. Обработка завершения вращения
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            
            let resultMessage = `🎉 Вы выиграли ${winningPrize.text}!`;
            
            if (window.Telegram && window.Telegram.WebApp) {
                // Логика для Telegram Mini App (вибрация, алерт, отправка данных)
                Telegram.WebApp.ready();
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                Telegram.WebApp.showAlert(resultMessage, () => {
                    Telegram.WebApp.sendData(JSON.stringify({
                        prize_id: winningPrize.id,
                        discount: parseInt(winningPrize.id),
                        result: resultMessage
                    }));
                });
            } else {
                alert(resultMessage);
            }

            // **ВАЖНО:** Финальный сброс позиции для следующего спина
            wheel.classList.remove('spinning');
            
            // Устанавливаем рулетку в позицию остановки БЕЗ анимации
            const remainderOffset = -(translateY_Stop); 
            wheel.style.transform = `translateY(${remainderOffset}px)`;
            
        }, TOTAL_DURATION);
    }, 50); // Небольшая задержка для применения сброса
});

// Инициализация при загрузке
populateWheel();
                
