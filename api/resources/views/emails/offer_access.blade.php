@php
    /** @var \App\Models\Event $event */
    /** @var \App\Models\Offer $offer */
@endphp

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Offre de covoiturage</title>
</head>
<body style="font-family: Arial, sans-serif; color:#111; line-height:1.5;">
    <h1>Merci pour votre offre de covoiturage</h1>

    <p>
        Bonjour {{ $offer->name }},
    </p>

    <p>
        Votre offre pour l'événement <strong>{{ $event->name }}</strong> est enregistrée.<br>
        Gardez précieusement ces liens — ils vous permettent de consulter et de modifier votre annonce.
    </p>

    <ul>
        <li><a href="{{ $viewUrl }}" style="color:#1f2937;">Voir mon offre sur la carte</a></li>
        <li><a href="{{ $editUrl }}" style="color:#1f2937;">Modifier ou supprimer mon offre</a></li>
    </ul>

    <p style="font-size:0.9em; color:#555;">
        Ces liens resteront valides jusqu'à la fin de l'événement : {{ \Carbon\Carbon::parse($expires)->locale('fr')->isoFormat('LLL') }}.
    </p>

    <p>
        Merci pour votre participation et à bientôt.
    </p>
</body>
</html>
