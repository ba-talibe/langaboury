<?php
	session_start();
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🎮 Jouer - Chasse au Trésor</title>
    <meta name="theme-color" content="#667eea">
    <link rel="stylesheet" href="style/player.css">
</head>
<body>
    <div class="container">
        <!-- Chargement en cours -->
        <div class="header" id="loadingGroup">
            <h3>🎮 Chargement...</h3>
            <div class="loader"></div>
            <p style="text-align: center; color: #6b7280; margin-top: 15px;">
                Récupération de vos informations...
            </p>
        </div>
        
        <!-- Interface de jeu -->
        <div id="gameInterface" class="hidden">
            <div class="header">
                <div class="team-info">
                    <div class="team-details">
                        <h2 id="teamName">Mon Groupe</h2>
                        <div class="team-step">
                            Étape <span id="currentStep">1</span>/<span id="totalSteps">0</span>
                        </div>
                    </div>
                    <div class="score-display">
                        <div class="score-value"><span id="score">0</span></div>
                        <div class="score-label">Points</div>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
            </div>

            <!-- Scanner QR -->
            <div class="card" id="scannerCard">
                <h3><span>📷</span> Scanner le QR Code</h3>
                <div class="scanner-box">
                    <div class="scanner-icon">📱</div>
                    <p class="scanner-text">Scannez le QR code avec votre caméra</p>
                </div>
                <div id="reader"></div>
                <button class="btn btn-primary" id="startScanBtn" onclick="toggleScanner()">
                    <span>📷</span>
                    <span>Activer la Caméra</span>
                </button>
                <button class="btn btn-secondary" onclick="toggleManual()">
                    <span>⌨️</span>
                    <span>Entrer le code manuellement</span>
                </button>
                
                <div class="manual-input" id="manualInput">
                    <div class="input-group">
                        <input type="text" id="qrCodeInput" placeholder="Ex: X7K9M2P4" maxlength="12">
                        <button class="btn btn-primary" onclick="submitQRCode()" style="width: auto; padding: 15px 30px;">
                            ✓ OK
                        </button>
                    </div>
                </div>
            </div>

            <!-- Énigme -->
            <div class="card hidden" id="enigmeCard">
                <h3><span>🧩</span> Énigme</h3>
                <div class="enigme-box">
                    <div class="enigme-text" id="enigmeText"></div>
                    <input type="text" class="answer-input" id="answerInput" placeholder="VOTRE RÉPONSE" maxlength="50">
                </div>
                <button class="btn btn-primary" onclick="submitAnswer()">
                    <span>✓</span>
                    <span>Valider la Réponse</span>
                </button>
                <div class="result" id="result"></div>
            </div>

            <!-- Classement -->
            <div class="card">
                <h3><span>🏆</span> Classement</h3>
                <div id="leaderboard">
                    <div class="loader"></div>
                </div>
            </div>

            <!-- 🧩 Historique des bonnes réponses du groupe -->
           <div class="historique-wrapper">
                <h2 class="historique-title">🏆 Historique des bonnes réponses du groupe</h2>
                <div id="historique-content">
                    <div style="text-align: center; padding: 20px; color: #555;">
                        <div class="loader"></div>
                        <p>Chargement de l'historique...</p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <script src="https://unpkg.com/html5-qrcode"></script>
    <script>

        let groupId = null;
        let currentEnigme = null;
        let scanner = null;
        let isScanning = false;

        let sessionTeamName = <?php echo isset($_SESSION['group_name']) ? $_SESSION['group_name'] : 'null'; ?>;

        async function startGame() {
            try {
                // Récupérer le groupId depuis la session PHP
                const sessionGroupId = <?php echo isset($_SESSION['group_id']) ? $_SESSION['group_id'] : 'null'; ?>;

                if (!sessionGroupId) {
                    throw new Error('Aucun groupe trouvé dans la session');
                }

                groupId = sessionGroupId;

                // Masquer le loading et afficher l'interface de jeu
                document.getElementById('loadingGroup').classList.add('hidden');
                document.getElementById('gameInterface').classList.remove('hidden');

                // Charger les données initiales
                await loadGameState();
                await loadTeamName();
                startLeaderboardRefresh();

            } catch (error) {
                console.error('Erreur démarrage:', error);
                alert('Erreur: ' + error.message + '\nRedirection vers la connexion...');
                window.location.href = '/connexion.php';
            }
        }
                // Charger les groupes au démarrage
        window.addEventListener('load', startGame);
     
    </script>
    <script src="js/player.js"></script>
</body>
</html>
