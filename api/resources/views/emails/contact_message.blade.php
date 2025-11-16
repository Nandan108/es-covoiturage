<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouveau message de contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
    <h2 style="font-weight: 600; margin-bottom: 16px;">Nouveau message reçu depuis es-cov</h2>
    <p style="margin-bottom: 12px;">
        <strong>Nom : </strong>{{ $senderName }}<br>
        <strong>Courriel : </strong>{{ $senderEmail }}
    </p>
    <p style="white-space: pre-line; border: 1px solid #cbd5f5; padding: 12px; border-radius: 8px;">{{ $messageBody }}</p>
</body>
</html>
