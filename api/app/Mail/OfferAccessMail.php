<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class OfferAccessMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public Event $event,
        public Offer $offer,
        public string $token,
        public string $frontendUrl,
        public string $expiresAtIso,
    ) {
    }

    /** @psalm-suppress PossiblyUnusedMethod*/
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre lien pour gérer votre offre de covoiturage',
        );
    }

    /** @psalm-suppress PossiblyUnusedMethod*/
    public function content(): Content
    {
        $viewUrl = $this->frontendUrl."/events/{$this->event->hashId}/offers/{$this->offer->id}";
        $editUrl = $viewUrl."/edit?token={$this->token}";

        return new Content(
            view: 'emails.offer_access',
            with: [
                'event'    => $this->event,
                'offer'    => $this->offer,
                'token'    => $this->token,
                'viewUrl'  => $viewUrl.'?token='.$this->token,
                'editUrl'  => $editUrl,
                'expires'  => $this->expiresAtIso,
            ],
        );
    }
}
