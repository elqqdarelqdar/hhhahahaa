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
    // В случае ошибки возвращаем самый частый приз
    return prizes[0]; 
}

// --- 2. Генерация секторов для рулетки ---
function populateWheel() {
    // Создаем "длинную" рулетку, повторяя призы много раз
    const REPETITIONS = 20;

    for (let i = 0; i < REPETITIONS; i++) {
        // Перемешиваем призы, чтобы создать непредсказуемый порядок
        const shuffledPrizes = [...prizes].sort(() => Math.random() - 0.5);

        shuffledPrizes.forEach(prize => {
            const sector = document.createElement('div');
            sector.className = 'sector';
            sector.setAttribute('data-id', prize.id);
            sector.setAttribute('data-chance-group', prize.chanceGroup);
            sector.textContent = prize.text;
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

    // 1. Определяем приз-победитель
    const winningPrize = getWinningPrize();
    console.log("Выигрышный приз:", winningPrize.text);

    // 2. Выбираем, на каком секторе-дубликате остановиться
    const winningSectors = sectorsInWheel.filter(s => s.getAttribute('data-id') === winningPrize.id);
    
    // Выбираем сектор для остановки в последней трети, чтобы обеспечить достаточный "пробег"
    const startRange = Math.floor(winningSectors.length * 0.7);
    const endRange = winningSectors.length - 1; 
    
    if (startRange > endRange) startRange = endRange;

    const selectedSectorIndex = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
    const finalSector = winningSectors[selectedSectorIndex];
    
    // Индекс этого сектора в общем списке секторов
    const finalPositionIndex = sectorsInWheel.indexOf(finalSector);

    // 3. Расчет смещения
    
    // Мы хотим, чтобы ВЕРХНЯЯ ГРАНИЦА выигрышного сектора остановилась ровно посередине
    // Посередине - это 1.5 высоты сектора от верха контейнера (так как видно 3 сектора)
    
    // Смещение до верха сектора: finalPositionIndex * SECTOR_HEIGHT
    // Центрирование: -(Смещение до верха сектора) + (1 * SECTOR_HEIGHT)
    // 1 * SECTOR_HEIGHT - это смещение, чтобы верх сектора был на 100px ниже центра указателя
    const translateY = (finalPositionIndex * SECTOR_HEIGHT) - (SECTOR_HEIGHT * 1);
    
    // Добавляем дополнительные обороты, чтобы рулетка прокрутилась много раз
    const extraSpins = 10 * sectorsInWheel.length;
    const finalTransform = -(extraSpins * SECTOR_HEIGHT + translateY);
    
    // Применяем вращение
    wheel.style.transition = 'none'; // Сброс
    wheel.style.transform = `translateY(0px)`;
    
    // Ждем, чтобы применить сброс, прежде чем начать анимацию
    setTimeout(() => {
        wheel.classList.add('spinning');
        wheel.style.transform = `translateY(${finalTransform}px)`;

        // 4. Обработка завершения вращения
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            
            // --- Логика для Telegram Web App ---
            let resultMessage = `🎉 Вы выиграли ${winningPrize.text}!`;
            
            if (window.Telegram && window.Telegram.WebApp) {
                // Отправляем результат обратно в бота
                Telegram.WebApp.ready();
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                
                // В Mini App лучше использовать Telegram.WebApp.showAlert
                Telegram.WebApp.showAlert(resultMessage, () => {
                    // Отправка данных при закрытии алерта
                    Telegram.WebApp.sendData(JSON.stringify({
                        prize_id: winningPrize.id,
                        discount: parseInt(winningPrize.id),
                        result: resultMessage
                    }));
                });
            } else {
                // Если не в Telegram
                alert(resultMessage);
            }

            // **ВАЖНО:** Сброс позиции для следующего спина
            wheel.classList.remove('spinning');
            
            // Смещаем рулетку обратно, вычитая полные обороты
            const remainderOffset = -(translateY); 
            wheel.style.transform = `translateY(${remainderOffset}px)`;
            
        }, TOTAL_DURATION); // Используем переменную длительности
    }, 50);
});

// Инициализация при загрузке
populateWheel();
