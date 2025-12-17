const tg = window.Telegram.WebApp;
tg.expand();

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const overlay = document.getElementById("subscribeOverlay");
const subscribedBtn = document.getElementById("subscribedBtn");

const SECTION_HEIGHT = 300;
let currentOffset = 0;
let spinning = false;

/**
 * 🔥 ВСЕ СЕКЦИИ ЗАДАЮТСЯ ТУТ 🔥
 */
const sections = [
  {
    name: "Скидка 30%",
    chance: 330,
    image: "images/Frame 7.png"
  },
  {
    name: "Скидка 50%;",
    chance: 150,
    image: "images/Frame 6.png"
  },
  {
    name: "Скидка 5%",
    chance: 4000,
    image: "images/Frame 2.png"
  },
  {
    name: "Скидка 20%",
    chance: 1000,
    image: "images/Frame 5.png"
  },
  {
    name: "Скидка 15%",
    chance: 1500,
    image: "images/Frame 4.png"
  },
  {
    name: "Скидка 10%",
    chance: 3000,
    image: "images/Frame 3.png"
  },
  {
    name: "JACKPOT",
    chance: 20,
    image: "images/Frame 1 (2).png"
  }
];

/**
 * 🧠 Рендер секций
 */
sections.forEach(section => {
  const img = document.createElement("img");
  img.src = section.image;
  wheel.appendChild(img);
});

/**
 * 🎯 Взвешенный рандом
 */
function getRandomSectionIndex() {
  const total = sections.reduce((sum, s) => sum + s.chance, 0);
  let rand = Math.random() * total;

  for (let i = 0; i < sections.length; i++) {
    if (rand < sections[i].chance) return i;
    rand -= sections[i].chance;
  }
}

/**
 * 🎰 Крутилка
 */
spinBtn.onclick = () => {
  if (spinning) return;
  spinning = true;

  const index = getRandomSectionIndex();
  const spins = 8;

  const offset =
    spins * sections.length * SECTION_HEIGHT +
    index * SECTION_HEIGHT;

  currentOffset += offset;
  wheel.style.transform = translateY(-${currentOffset}px);

  setTimeout(() => {
    result.textContent = Вам выпала: ${sections[index].name};
    spinning = false;
  }, 3000);
};

/**
 * 🔓 "Проверка" подписки
 */
subscribedBtn.onclick = () => {
  overlay.style.display = "none";
  spinBtn.disabled = false;
};