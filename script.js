const prizes = [
  { name: "Скидка 30%", chance: 330, image: "images/Frame 7.png" },
  { name: "Скидка 50%", chance: 150, image: "images/Frame 6.png" },
  { name: "Скидка 5%", chance: 4000, image: "images/Frame 2.png" },
  { name: "Скидка 20%", chance: 1000, image: "images/Frame 5.png" },
  { name: "Скидка 15%", chance: 1500, image: "images/Frame 4.png" },
  { name: "Скидка 10%", chance: 3000, image: "images/Frame 3.png" },
  { name: "JACKPOT", chance: 20, image: "images/Frame 1 (2).png" }
];

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const prizePopup = document.getElementById("prizePopup");
const prizeName = document.getElementById("prizeName");
const prizeImage = document.getElementById("prizeImage");
const closePopup = document.getElementById("closePopup");

// Создаем секции колеса
prizes.forEach(prize => {
  const section = document.createElement("div");
  section.className = "section";
  section.innerHTML = `<img src="${prize.image}" alt="${prize.name}">${prize.name}`;
  wheel.appendChild(section);
});

// Функция выбора приза по шансам
function getRandomPrize() {
  const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
  let random = Math.floor(Math.random() * totalChance);
  for (let prize of prizes) {
    if (random < prize.chance) return prize;
    random -= prize.chance;
  }
}

// Функция вращения колеса
function spinWheel() {
  const prize = getRandomPrize();
  const sectionHeight = 57; // высота одной секции
  const index = prizes.indexOf(prize);

  // Вращаем колесо так, чтобы выбранная секция остановилась сверху
  const rotations = 7; // количество полных циклов
  const finalTranslate = -(rotations * prizes.length + index) * sectionHeight;

  wheel.style.transition = "transform 7s cubic-bezier(0.25, 1, 0.5, 1)";
  wheel.style.transform = `translateY(${finalTranslate}px)`;

  spinBtn.disabled = true;

  setTimeout(() => {
    prizeName.textContent = prize.name;
    prizeImage.src = prize.image;
    prizePopup.style.display = "flex";
    wheel.style.transition = "none";
    // Сброс позиции колеса для бесконечного эффекта
    wheel.style.transform = `translateY(${-index * sectionHeight}px)`;
    spinBtn.disabled = false;
  }, 7000);
}

spinBtn.addEventListener("click", spinWheel);
closePopup.addEventListener("click", () => {
  prizePopup.style.display = "none";
});
