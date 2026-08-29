<?php
/**
 * NEXUS ALPHA CONSULTING - SCRIPT DE TRAITEMENT DU FORMULAIRE DE CONTACT
 * Destinataire officiel : administration@nexusalphaconsulting.com
 */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Seules les requêtes POST sont acceptées.'
    ]);
    exit;
}

// Récupération des données (JSON ou Form-Data)
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data || !is_array($data)) {
    $data = $_POST;
}

// Protection anti-spam Honeypot (si le champ caché est rempli, on rejette silencieusement)
if (!empty($data['website_url_hp'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Demande reçue avec succès.'
    ]);
    exit;
}

// Extraction et nettoyage des champs obligatoires
$name    = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$email   = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone   = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$company = isset($data['company']) ? trim(strip_tags($data['company'])) : '';
$sector  = isset($data['sector']) ? trim(strip_tags($data['sector'])) : 'Non spécifié';
$type    = isset($data['type']) ? trim(strip_tags($data['type'])) : 'Non spécifié';
$need    = isset($data['need']) ? trim(strip_tags($data['need'])) : 'Non spécifié';
$message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

// Validation des champs requis
if (empty($name) || empty($email) || empty($phone) || empty($company) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Veuillez remplir tous les champs obligatoires (Nom, Email, Téléphone, Entreprise, Message).'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Adresse email invalide.'
    ]);
    exit;
}

// Sécurité contre les injections d'en-têtes (Header Injection)
$name  = str_replace(["\r", "\n"], ' ', $name);
$email = str_replace(["\r", "\n"], ' ', $email);

// Paramètres d'envoi
$to = 'administration@nexusalphaconsulting.com';
$subject = "=?UTF-8?B?" . base64_encode("[NEXUS ALPHA - CONTACT] Demande de {$name} ({$company})") . "?=";

// Construction du corps HTML du mail
$htmlBody = '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouvelle demande de contact - Nexus Alpha Consulting</title>
    <style>
        body { font-family: "Segoe UI", Arial, sans-serif; background-color: #070d18; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #0c1527; border: 1px solid #d5bb76; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #070d18 0%, #16243d 100%); padding: 25px; border-bottom: 2px solid #d5bb76; text-align: center; }
        .header h1 { color: #d5bb76; font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .header p { color: #94a3b8; font-size: 13px; margin: 5px 0 0 0; }
        .content { padding: 25px; }
        .item { margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; }
        .item-label { font-size: 11px; text-transform: uppercase; color: #d5bb76; font-weight: bold; margin-bottom: 4px; }
        .item-value { font-size: 15px; color: #ffffff; line-height: 1.5; }
        .message-box { background: rgba(213, 187, 118, 0.05); border-left: 3px solid #d5bb76; padding: 15px; border-radius: 4px; margin-top: 15px; white-space: pre-wrap; font-size: 14px; color: #f8fafc; }
        .footer { background: #070d18; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NEXUS ALPHA CONSULTING</h1>
            <p>Notification automatique — Demande de contact & qualification</p>
        </div>
        <div class="content">
            <div class="item">
                <div class="item-label">Nom complet & Titre</div>
                <div class="item-value">' . htmlspecialchars($name) . '</div>
            </div>
            <div class="item">
                <div class="item-label">Entreprise / Organisation</div>
                <div class="item-value">' . htmlspecialchars($company) . '</div>
            </div>
            <div class="item">
                <div class="item-label">Email professionnel</div>
                <div class="item-value"><a href="mailto:' . htmlspecialchars($email) . '" style="color: #38bdf8;">' . htmlspecialchars($email) . '</a></div>
            </div>
            <div class="item">
                <div class="item-label">Téléphone / WhatsApp</div>
                <div class="item-value"><a href="tel:' . htmlspecialchars($phone) . '" style="color: #10b981;">' . htmlspecialchars($phone) . '</a></div>
            </div>
            <div class="item">
                <div class="item-label">Secteur d\'activité</div>
                <div class="item-value">' . htmlspecialchars($sector) . '</div>
            </div>
            <div class="item">
                <div class="item-label">Type d\'organisation</div>
                <div class="item-value">' . htmlspecialchars($type) . '</div>
            </div>
            <div class="item">
                <div class="item-label">Besoin prioritaire sélectionné</div>
                <div class="item-value" style="color: #d5bb76; font-weight: bold;">' . htmlspecialchars($need) . '</div>
            </div>
            <div class="item" style="border-bottom: none;">
                <div class="item-label">Message & Enjeux exprimés</div>
                <div class="message-box">' . nl2br(htmlspecialchars($message)) . '</div>
            </div>
        </div>
        <div class="footer">
            Message envoyé depuis le site officiel <a href="https://www.nexusalphaconsulting.com/" style="color: #d5bb76;">nexusalphaconsulting.com</a><br>
            Date : ' . date('d/m/Y H:i:s') . ' (UTC) | IP : ' . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'Inconnue') . '
        </div>
    </div>
</body>
</html>
';

// Version texte brut pour les clients mails sans HTML
$plainBody = "=== NOUVELLE DEMANDE DE CONTACT - NEXUS ALPHA CONSULTING ===\n\n";
$plainBody .= "Nom : {$name}\n";
$plainBody .= "Entreprise : {$company}\n";
$plainBody .= "Email : {$email}\n";
$plainBody .= "Téléphone : {$phone}\n";
$plainBody .= "Secteur : {$sector}\n";
$plainBody .= "Type d'organisation : {$type}\n";
$plainBody .= "Besoin : {$need}\n\n";
$plainBody .= "--- Message ---\n{$message}\n\n";
$plainBody .= "---\nEnvoyé le " . date('d/m/Y H:i:s') . " depuis nexusalphaconsulting.com";

// En-têtes du courrier
$boundary = md5(uniqid(time()));

$headers = [
    'MIME-Version: 1.0',
    'From: Nexus Alpha Web <info@nexusalphaconsulting.com>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"'
];

$body = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $plainBody . "\r\n\r\n";

$body .= "--{$boundary}\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $htmlBody . "\r\n\r\n";

$body .= "--{$boundary}--";

// Envoi de l'email via la fonction native mail() du serveur LWS
$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a été transmise avec succès à notre direction. Un expert de Nexus Alpha Consulting vous recontactera sous 24h.'
    ]);
} else {
    // Si l'envoi direct échoue sur le serveur
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Une erreur est survenue lors de l\'envoi du message. Veuillez nous contacter directement à administration@nexusalphaconsulting.com ou par WhatsApp au +226 78 64 28 91.'
    ]);
}
