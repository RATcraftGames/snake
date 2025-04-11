// DOM-элементы
const menu = document.getElementById("menu");
const settings = document.getElementById("settings");
const game = document.getElementById("game");
const gameOverScreen = document.getElementById("gameOver");
const gameOverScore = document.createElement("p"); // Для отображения счета
gameOverScreen.appendChild(gameOverScore);
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Кнопки
const newGameButton = document.getElementById("newGame");
const backToMenuButton = document.getElementById("backToMenu");
const startGameButton = document.getElementById("startGame");
const restartGameButton = document.getElementById("restartGame");
const backToMenuFromGameButton = document.getElementById("backToMenuFromGame");

// Настройки
let gameSettings = {
    speed: 10,
    wallCollision: true,
    selfCollision: true,
    foodCount: 1
};

// Переменные игры
let snake, direction, food, running, interval;
let score = 0;

// Инициализация игры
function initGame() {
    snake = [{ x: Math.floor(canvas.width / 40), y: Math.floor(canvas.height / 40) }];
    direction = { x: 0, y: 0 }; // Начальное направление
    food = [];
    running = true;
    score = 0; // Обнуляем счет

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < gameSettings.foodCount; i++) {
        placeFood();
    }

    drawGame();
    const speedDelay = mapSpeedToDelay(gameSettings.speed);
    interval = setInterval(updateGame, speedDelay);
}

// Преобразование скорости (1-25) в задержку обновления игры
function mapSpeedToDelay(speed) {
    const maxDelay = 200; // Максимальная задержка для самой медленной скорости
    const minDelay = 30;  // Минимальная задержка для самой быстрой скорости
    return maxDelay - ((speed - 1) * (maxDelay - minDelay) / 24);
}

// Добавление еды на случайную позицию
function placeFood() {
    const foodX = Math.floor(Math.random() * (canvas.width / 20));
    const foodY = Math.floor(Math.random() * (canvas.height / 20));
    food.push({ x: foodX, y: foodY });
}

// Логика игры
function updateGame() {
    if (!running) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Проверка столкновения со стеной
    if (gameSettings.wallCollision) {
        if (head.x < 0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20) {
            endGame();
            return;
        }
    } else {
        // Оборачивание змейки вокруг поля
        head.x = (head.x + canvas.width / 20) % (canvas.width / 20);
        head.y = (head.y + canvas.height / 20) % (canvas.height / 20);
    }

    // Проверка столкновения головы со своим телом
    if (gameSettings.selfCollision && snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head); // Добавляем голову в начало змейки

    // Проверка, съела ли змейка еду
    if (food.some(f => f.x === head.x && f.y === head.y)) {
        food = food.filter(f => !(f.x === head.x && f.y === head.y)); // Удаляем съеденную еду
        placeFood(); // Добавляем новую еду
        score++; // Увеличиваем счет
    } else {
        snake.pop(); // Убираем хвост, если еда не съедена
    }

    drawGame();
}

// Отображение игры
function drawGame() {
    ctx.fillStyle = "#111"; // Фон игрового поля
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем змейку
    ctx.fillStyle = "lime";
    snake.forEach(segment => ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18));

    // Рисуем еду
    ctx.fillStyle = "red";
    food.forEach(f => ctx.fillRect(f.x * 20, f.y * 20, 18, 18));

    // Рисуем счет
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Завершение игры
function endGame() {
    running = false;
    clearInterval(interval);
    gameOverScore.textContent = `Your score: ${score}`; // Отображаем счет
    gameOverScreen.classList.remove("hidden");
}

// Управление змейкой
document.addEventListener("keydown", event => {
    const key = event.key;
    const newDirection = {
        "ArrowUp": { x: 0, y: -1 },
        "ArrowDown": { x: 0, y: 1 },
        "ArrowLeft": { x: -1, y: 0 },
        "ArrowRight": { x: 1, y: 0 },
        "w": { x: 0, y: -1 },
        "s": { x: 0, y: 1 },
        "a": { x: -1, y: 0 },
        "d": { x: 1, y: 0 }
    };

    if (newDirection[key] && !isOppositeDirection(direction, newDirection[key])) {
        direction = newDirection[key];
    }
});

// Проверка на противоположное направление
function isOppositeDirection(current, next) {
    return current.x + next.x === 0 && current.y + next.y === 0;
}

// Обработчики событий
newGameButton.addEventListener("click", () => {
    menu.classList.add("hidden");
    settings.classList.remove("hidden");
});

startGameButton.addEventListener("click", () => {
    gameSettings.speed = parseInt(document.getElementById("speed").value);
    gameSettings.wallCollision = document.getElementById("wallCollision").value === "true";
    gameSettings.selfCollision = document.getElementById("selfCollision").value === "true";
    gameSettings.foodCount = parseInt(document.getElementById("foodCount").value);

    settings.classList.add("hidden");
    game.classList.remove("hidden");
    initGame();
});

backToMenuButton.addEventListener("click", () => {
    settings.classList.add("hidden");
    menu.classList.remove("hidden");
});

restartGameButton.addEventListener("click", () => {
    gameOverScreen.classList.add("hidden");
    initGame();
});

backToMenuFromGameButton.addEventListener("click", () => {
    game.classList.add("hidden");
    menu.classList.remove("hidden");
});