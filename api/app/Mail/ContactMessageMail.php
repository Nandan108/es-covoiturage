<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

final class ContactMessageMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        private readonly string $senderName,
        private readonly string $senderEmail,
        private readonly string $messageBody,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject('Nouveau message de contact')
            ->view('emails.contact_message')
            ->with([
                'senderName'  => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'messageBody' => $this->messageBody,
            ]);
    }
}
