let playerHP = 100;
let enemyHP = 100;

const playerHpText = document.getElementById('player-hp');
const enemyHpText = document.getElementById('enemy-hp');
const attackBtn = document.getElementById('attack-btn');
const resetBtn = document.getElementById('reset-btn');
const log = document.getElementById('log');

function addLog(msg) {
    const div = document.createElement('div');
    div.textContent = msg;
    log.prepend(div);
}

attackBtn.addEventListener('click', () => {
   
    const playerDamage = Math.floor(Math.random() * 20) + 5;
    enemyHP -= playerDamage;
    if (enemyHP < 0) enemyHP = 0;
    
    addLog(`Haces ${playerDamage} de daño.`);
    enemyHpText.textContent = enemyHP;

    if (enemyHP <= 0) {
        addLog("¡Ganaste yeyyy!");
        attackBtn.disabled = true;
        resetBtn.classList.remove('hidden');
        return;
    }


    const enemyDamage = Math.floor(Math.random() * 15) + 5;
    playerHP -= enemyDamage;
    if (playerHP < 0) playerHP = 0;

    addLog(`El enemigo hace ${enemyDamage} de daño.`);
    playerHpText.textContent = playerHP;

    if (playerHP <= 0) {
        addLog("¡Perdise nooooo!");
        attackBtn.disabled = true;
        resetBtn.classList.remove('hidden');
    }
});