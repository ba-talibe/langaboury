
let groupId = null;
let currentEnigme = null;
let scanner = null;
let isScanning = false;


function fetchHistorique() {
    fetch(`api_simple.php?action=get_good_answers&group_id=${groupId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('historique-content');
            if (data.status === 'success') {
                if (data.data.length === 0) {
                    container.innerHTML = '<p class="no-history">Aucune bonne réponse pour le moment.</p>';
                    return;
                }

                let html = `
                        <table class="historique-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Bonne réponse</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                for (const row of data.data) {
                    html += `
                            <tr>
                                <td>${row.question_name}</td>
                                <td><strong>${row.correct_answer}</strong></td>
                            </tr>
                        `;
                }

                html += '</tbody></table>';
                container.innerHTML = html;
            } else {
                container.innerHTML = '<p class="no-history" style="color:#ef4444;">Erreur de chargement de l\'historique.</p>';
            }
        })
        .catch(() => {
            document.getElementById('historique-content').innerHTML = '<p class="no-history" style="color:#ef4444;">Erreur de connexion au serveur.</p>';
        });
}

async function loadGameState() {
    try {
        const res = await fetch(`api_simple.php?action=get_state&group_id=${groupId}`);
        const data = await res.json();

        document.getElementById('score').textContent = data.score;
        document.getElementById('currentStep').textContent = data.current_step;
        document.getElementById('totalSteps').textContent = data.total_steps;

        const progress = (data.current_step / data.total_steps) * 100;
        document.getElementById('progress').style.width = Math.min(progress, 100) + '%';

        loadLeaderboard();
    } catch (error) {
        console.error('Erreur:', error);
    }
}



async function loadTeamName() {
    try {
        // Récupérer le nom du groupe depuis la session PHP
        const teamName = "<?php echo isset($_SESSION['group_name']) ? htmlspecialchars($_SESSION['group_name']) : 'Mon Groupe'; ?>";
        document.getElementById('teamName').textContent = teamName;

    } catch (error) {
        console.error('Erreur chargement nom:', error);
        document.getElementById('teamName').textContent = 'Mon Groupe';
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch('api_simple.php?action=get_leaderboard&game_id=1');
        const data = await res.json();

        const container = document.getElementById('leaderboard');
        container.innerHTML = '';

        data.leaderboard.forEach((group, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item' + (group.id == groupId ? ' current' : '');
            item.innerHTML = `
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-name">${group.name}</div>
                    <div class="leaderboard-score">${group.score}</div>
                `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function startLeaderboardRefresh() {
    setInterval(() => {
        loadLeaderboard();
        loadGameState();
    }, 5000);
}

function toggleScanner() {
    if (isScanning) {
        stopScanner();
    } else {
        startScanner();
    }
}

async function startScanner() {
    try {
        scanner = new Html5Qrcode("reader");
        const cameras = await Html5Qrcode.getCameras();

        if (cameras && cameras.length > 0) {
            await scanner.start(
                cameras[cameras.length - 1].id,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (code) => {
                    stopScanner();
                    submitQRCode(code);
                }
            );
            isScanning = true;
            const btn = document.getElementById('startScanBtn');
            btn.innerHTML = '<span>🛑</span><span>Arrêter la Caméra</span>';
        }
    } catch (error) {
        alert('Erreur caméra: ' + error.message);
    }
}

function stopScanner() {
    if (scanner && isScanning) {
        scanner.stop();
        isScanning = false;
        const btn = document.getElementById('startScanBtn');
        btn.innerHTML = '<span>📷</span><span>Activer la Caméra</span>';
    }
}

function toggleManual() {
    const manual = document.getElementById('manualInput');
    manual.classList.toggle('show');
    if (manual.classList.contains('show')) {
        document.getElementById('qrCodeInput').focus();
    }
}

async function submitQRCode(code) {
    if (!code) {
        code = document.getElementById('qrCodeInput').value.trim().toUpperCase();
    }

    if (!code) {
        alert('Entrez un code QR');
        return;
    }

    try {
        const res = await fetch('api_simple.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'scan_qr',
                group_id: groupId,
                qr_code: code
            })
        });

        const data = await res.json();

        if (data.success) {
            currentEnigme = data.enigme;
            showEnigme(data.enigme);
        } else {
            alert(data.error || 'QR Code invalide');
        }
    } catch (error) {
        alert('Erreur réseau');
    }
}

function showEnigme(enigme) {
    document.getElementById('scannerCard').classList.add('hidden');
    document.getElementById('enigmeCard').classList.remove('hidden');
    document.getElementById('enigmeText').textContent = enigme.enigme_text;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    document.getElementById('result').classList.remove('show');
}

async function submitAnswer() {
    const answer = document.getElementById('answerInput').value.trim().toUpperCase();

    if (!answer) {
        alert('Entrez une réponse');
        return;
    }

    try {
        const res = await fetch('api_simple.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submit_answer',
                group_id: groupId,
                enigme_id: currentEnigme.id,
                answer: answer
            })
        });

        const data = await res.json();

        const resultDiv = document.getElementById('result');
        resultDiv.classList.add('show');

        if (data.correct) {
            resultDiv.className = 'result show success';
            resultDiv.innerHTML = `
                    <div class="result-icon">✅</div>
                    <div style="font-size: 24px; margin-bottom: 15px; font-weight: bold;">Bravo !</div>
                    <div style="font-size: 18px;">+${data.points} points</div>
                    ${data.next_location ? `
                        <div class="next-location">
                            <strong>📍 Prochaine étape:</strong><br>
                            ${data.next_location}
                        </div>
                    ` : '<div class="next-location"><strong>🎉 Félicitations ! Vous avez terminé !</strong></div>'}
                `;

            setTimeout(() => {
                document.getElementById('enigmeCard').classList.add('hidden');
                document.getElementById('scannerCard').classList.remove('hidden');
                loadGameState();
            }, 5000);
        } else {
            resultDiv.className = 'result show error';
            resultDiv.innerHTML = `
                    <div class="result-icon">❌</div>
                    <div style="font-size: 22px; margin-bottom: 10px;">Mauvaise réponse</div>
                    <div style="margin-top: 15px; font-size: 16px;">Réessayez !</div>
                `;

            setTimeout(() => {
                resultDiv.classList.remove('show');
                document.getElementById('answerInput').value = '';
                document.getElementById('answerInput').focus();
            }, 3000);
        }
    } catch (error) {
        alert('Erreur réseau');
    }
}

// Enter pour valider
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('answerInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    document.getElementById('qrCodeInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitQRCode();
    });
});



// 🔁 Rafraîchir toutes les 2 secondes
setInterval(fetchHistorique, 2000);

// // 🏁 Charger une première fois au démarrage
// document.addEventListener('DOMContentLoaded', fetchHistorique);
