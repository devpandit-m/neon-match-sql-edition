let icons = ['🚀','🚀','🪐','🪐','🛸','🛸','🛰️','🛰️','🌌','🌌','☄️','☄️','💎','💎','👾','👾'];
let flipped = [];
let score = 0;
let timeLeft = 45;
let timer;
let gameActive = false;

function startGame() {
    score = 0;
    timeLeft = 45;
    flipped = [];
    document.getElementById('score').innerText = score;
    document.getElementById('timer').innerText = timeLeft;
    document.getElementById('overlay').style.display = 'none';
    
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    [...icons].sort(() => Math.random() - 0.5).forEach(icon => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = icon;
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });

    gameActive = true;
    startTimer();
}

function flipCard(card) {
    if (!gameActive) return;
    if (flipped.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        card.innerText = card.dataset.icon;
        flipped.push(card);
        if (flipped.length === 2) checkMatch();
    }
}

function checkMatch() {
    const [c1, c2] = flipped;
    if (c1.dataset.icon === c2.dataset.icon) {
        score += 20;
        document.getElementById('score').innerText = score;
        flipped = [];
        if (document.querySelectorAll('.flipped').length === icons.length) {
            endGame("MISSION ACCOMPLISHED!");
        }
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            c1.innerText = '';
            flipped = [];
        }, 600);
    }
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) endGame("TIME EXPIRED!");
    }, 1000);
}

function endGame(msg) {
    clearInterval(timer);
    gameActive = false;
    
    let playerName = prompt(msg + "\nFinal Score: " + score + "\nEnter Name:");
    if (!playerName) playerName = "Guest";

    // Direct path use karne se CORS issue nahi aata
    fetch('/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score: score })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            const list = document.getElementById('leaderboard-list');
            list.innerHTML = data.leaderboard.map(item => 
                `<li><span>${item.name}</span> <span>${item.score}</span></li>`
            ).join('');
        }
        document.getElementById('overlay').style.display = 'flex';
    })
    .catch(err => {
        console.error("Error:", err);
        document.getElementById('overlay').style.display = 'flex';
    });
}
