<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>📝 Inscription - Chasse au Trésor</title>
    <meta name="theme-color" content="#667eea">
    <link rel="stylesheet" href="css/inscription.css">
</head>
<body>

    <h1>📝 Inscription</h1>
    <div class="message"><?= $message ?? '' ?></div>

    <form id="registerForm">
        <label>Nom :</label>
        <input type="text" name="name" required>

        <label>Prénom :</label>
        <input type="text" name="surname" required>

        <label>Email :</label>
        <input type="email" name="email" required>

        <button type="submit">S'inscrire</button>

        <p style="margin-top:15px; text-align:center;">
            Déjà inscrit ? <a href="connexion.php">Se connecter</a>
        </p>
    </form>
    <script src="js/inscription.js"></script>

</body>
</html>
