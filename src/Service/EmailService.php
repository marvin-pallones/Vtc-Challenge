<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EmailService
{
    private string $emailDir;

    public function __construct(ParameterBagInterface $params)
    {
        $this->emailDir = $params->get('kernel.project_dir') . '/var/emails';
    }

    public function sendConfirmationEmail(User $user, string $confirmationUrl): void
    {
        if (!is_dir($this->emailDir)) {
            mkdir($this->emailDir, 0755, true);
        }

        $emailContent = $this->buildConfirmationEmail($user, $confirmationUrl);
        $filename = sprintf('%s/confirmation_%s_%s.html',
            $this->emailDir,
            $user->getId(),
            date('Y-m-d_H-i-s')
        );

        file_put_contents($filename, $emailContent);
    }

    private function buildConfirmationEmail(User $user, string $confirmationUrl): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirm Your Account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to VTC Notes!</h1>
        <p>Hello,</p>
        <p>Thank you for registering with email: <strong>{$user->getEmail()}</strong></p>
        <p>Please click the button below to confirm your account:</p>
        <p><a href="{$confirmationUrl}" class="button">Confirm My Account</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="{$confirmationUrl}">{$confirmationUrl}</a></p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>VTC Notes Team</p>
    </div>
</body>
</html>
HTML;
    }
}
