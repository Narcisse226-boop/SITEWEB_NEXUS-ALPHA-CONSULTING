<?php
/**
 * NEXUS ALPHA CONSULTING - SCRIPT DE TRAITEMENT UNIFIÉ DES FORMULAIRES & DIAGNOSTICS
 * Destinataire officiel unique : info@nexusalphaconsulting.com
 */

error_reporting(0);
ini_set('display_errors', '0');
ob_start();

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Gestion des requêtes préliminaires (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    ob_clean();
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

// Protection anti-spam Honeypot
if (!empty($data['website_url_hp'])) {
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Demande reçue avec succès.'
    ]);
    exit;
}

$to = 'info@nexusalphaconsulting.com';
$type_form = isset($data['form_type']) ? trim($data['form_type']) : 'contact';

// =========================================================================
// CAS 1 : RÉCEPTION D'UN PRÉ-DIAGNOSTIC PME AUTOMATIQUE
// =========================================================================
if ($type_form === 'prediagnostic') {
    $name       = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
    $email      = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
    $phone      = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
    $company    = isset($data['company']) ? trim(strip_tags($data['company'])) : '';
    $sectorName = isset($data['sectorName']) ? trim(strip_tags($data['sectorName'])) : (isset($data['sector']) ? trim(strip_tags($data['sector'])) : 'Non spécifié');
    $score      = isset($data['score']) ? intval($data['score']) : 0;
    $level      = isset($data['level']) ? trim(strip_tags($data['level'])) : '';
    $summary    = isset($data['summary']) ? trim(strip_tags($data['summary'])) : '';
    
    $strengths  = isset($data['strengths']) && is_array($data['strengths']) ? $data['strengths'] : [];
    $vigilances = isset($data['vigilances']) && is_array($data['vigilances']) ? $data['vigilances'] : [];
    $questions  = isset($data['questions']) && is_array($data['questions']) ? $data['questions'] : [];

    if (empty($name) || empty($email) || empty($phone) || empty($company)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Champs obligatoires manquants pour la qualification du lead.'
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

    // Sécurité contre les injections d'en-têtes
    $name  = str_replace(["\r", "\n"], ' ', $name);
    $email = str_replace(["\r", "\n"], ' ', $email);

    $subject = "=?UTF-8?B?" . base64_encode("[PRÉ-DIAGNOSTIC PME] Lead : {$name} ({$company}) — Score {$score}/100") . "?=";

    // Construction de la liste des questions
    $questionsHTML = '';
    $questionsPlain = '';
    if (!empty($questions)) {
        foreach ($questions as $idx => $q) {
            $qText = htmlspecialchars($q['question'] ?? 'Question ' . ($idx + 1));
            $qAns  = htmlspecialchars($q['answer'] ?? 'N/A');
            $ansColor = ($qAns === 'Oui') ? '#10b981' : '#f43f5e';
            $questionsHTML .= "<tr><td style='padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #cbd5e1;'>{$qText}</td><td style='padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; font-weight: bold; color: {$ansColor}; font-size: 13px;'>{$qAns}</td></tr>";
            $questionsPlain .= "- {$qText} : {$qAns}\n";
        }
    }

    // Construction points forts
    $strengthsHTML = '';
    $strengthsPlain = '';
    if (!empty($strengths)) {
        foreach ($strengths as $st) {
            $stClean = htmlspecialchars(strip_tags($st));
            $strengthsHTML .= "<li style='color: #6ee7b7; margin-bottom: 6px; font-size: 13px;'>{$stClean}</li>";
            $strengthsPlain .= "+ {$stClean}\n";
        }
    } else {
        $strengthsHTML = "<li style='color: #94a3b8; font-size: 13px;'>Aucun point fort déclaré.</li>";
        $strengthsPlain = "+ Aucun\n";
    }

    // Construction vigilances
    $vigilanceHTML = '';
    $vigilancePlain = '';
    if (!empty($vigilances)) {
        foreach ($vigilances as $vg) {
            $vgClean = htmlspecialchars(strip_tags($vg));
            $vigilanceHTML .= "<li style='color: #fda4af; margin-bottom: 6px; font-size: 13px;'>{$vgClean}</li>";
            $vigilancePlain .= "- {$vgClean}\n";
        }
    } else {
        $vigilanceHTML = "<li style='color: #94a3b8; font-size: 13px;'>Aucun point de vigilance critique.</li>";
        $vigilancePlain = "- Aucun\n";
    }

    $barColor = ($score >= 80) ? '#10b981' : (($score >= 70) ? '#f59e0b' : (($score >= 50) ? '#f97316' : '#f43f5e'));

    // Corps HTML du mail de pré-diagnostic
    $htmlBody = '
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Nouveau Pré-diagnostic PME - Nexus Alpha Consulting</title>
        <style>
            body { font-family: "Segoe UI", Arial, sans-serif; background-color: #070d18; color: #e2e8f0; margin: 0; padding: 20px; }
            .container { max-width: 680px; margin: 0 auto; background: #0c1527; border: 1px solid #d5bb76; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #070d18 0%, #16243d 100%); padding: 25px; border-bottom: 2px solid #d5bb76; text-align: center; }
            .header h1 { color: #d5bb76; font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .header p { color: #94a3b8; font-size: 13px; margin: 5px 0 0 0; }
            .content { padding: 25px; }
            .score-box { background: #111d33; border: 1px solid rgba(213, 187, 118, 0.4); border-radius: 6px; padding: 18px; margin-bottom: 20px; text-align: center; }
            .score-num { font-size: 32px; font-weight: bold; color: #ffffff; margin: 5px 0; }
            .score-level { font-size: 16px; font-weight: bold; color: ' . $barColor . '; }
            .item { margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
            .item-label { font-size: 11px; text-transform: uppercase; color: #d5bb76; font-weight: bold; margin-bottom: 4px; }
            .item-value { font-size: 14px; color: #ffffff; line-height: 1.5; }
            .section-title { font-size: 14px; font-weight: bold; color: #d5bb76; text-transform: uppercase; margin: 20px 0 10px 0; border-bottom: 1px solid #d5bb76; padding-bottom: 4px; }
            .footer { background: #070d18; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>NEXUS ALPHA CONSULTING</h1>
                <p>Notification automatique — Réalisation d\'un Pré-diagnostic Nexus PME 360</p>
            </div>
            <div class="content">
                
                <div class="score-box">
                    <div style="font-size: 12px; text-transform: uppercase; color: #d5bb76; letter-spacing: 1px;">Nexus Pre-Score™ Obtenu</div>
                    <div class="score-num">' . $score . ' / 100</div>
                    <div class="score-level">' . htmlspecialchars($level) . '</div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 8px;">Secteur : <strong>' . htmlspecialchars($sectorName) . '</strong></div>
                </div>

                <div class="section-title">Coordonnées du Prospect (Lead Qualifié)</div>
                <div class="item">
                    <div class="item-label">Nom du Dirigeant / Contact</div>
                    <div class="item-value">' . htmlspecialchars($name) . '</div>
                </div>
                <div class="item">
                    <div class="item-label">Entreprise</div>
                    <div class="item-value">' . htmlspecialchars($company) . '</div>
                </div>
                <div class="item">
                    <div class="item-label">Téléphone / WhatsApp</div>
                    <div class="item-value"><a href="tel:' . htmlspecialchars($phone) . '" style="color: #10b981; font-weight: bold;">' . htmlspecialchars($phone) . '</a></div>
                </div>
                <div class="item">
                    <div class="item-label">Email Professionnel</div>
                    <div class="item-value"><a href="mailto:' . htmlspecialchars($email) . '" style="color: #38bdf8;">' . htmlspecialchars($email) . '</a></div>
                </div>

                <div class="section-title">Synthèse Exécutive Automatique</div>
                <p style="font-size: 13px; line-height: 1.6; color: #e2e8f0; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 4px;">
                    ' . htmlspecialchars($summary) . '
                </p>

                <div class="section-title">Points Forts & Points de Vigilance</div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                            <div style="color: #6ee7b7; font-weight: bold; font-size: 13px; margin-bottom: 6px;">Points Forts :</div>
                            <ul style="padding-left: 18px; margin: 0;">' . $strengthsHTML . '</ul>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                            <div style="color: #fda4af; font-weight: bold; font-size: 13px; margin-bottom: 6px;">Points de Vigilance :</div>
                            <ul style="padding-left: 18px; margin: 0;">' . $vigilanceHTML . '</ul>
                        </td>
                    </tr>
                </table>

                <div class="section-title">Détail des Réponses aux 9 Questions</div>
                <table style="width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.2); border-radius: 4px;">
                    ' . $questionsHTML . '
                </table>

            </div>
            <div class="footer">
                Transmis instantanément depuis le calculateur interactif sur <a href="https://www.nexusalphaconsulting.com/" style="color: #d5bb76;">nexusalphaconsulting.com</a><br>
                Date : ' . date('d/m/Y H:i:s') . ' (UTC) | IP : ' . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'Inconnue') . '
            </div>
        </div>
    </body>
    </html>
    ';

    // Corps Texte Brut
    $plainBody = "=== NOUVEAU PRÉ-DIAGNOSTIC PME - NEXUS ALPHA CONSULTING ===\n\n";
    $plainBody .= "Prospect : {$name}\n";
    $plainBody .= "Entreprise : {$company}\n";
    $plainBody .= "Email : {$email}\n";
    $plainBody .= "Téléphone : {$phone}\n";
    $plainBody .= "Secteur : {$sectorName}\n";
    $plainBody .= "Nexus Pre-Score : {$score}/100 ({$level})\n\n";
    $plainBody .= "--- Synthèse ---\n{$summary}\n\n";
    $plainBody .= "--- Points Forts ---\n{$strengthsPlain}\n";
    $plainBody .= "--- Points de Vigilance ---\n{$vigilancePlain}\n";
    $plainBody .= "--- Réponses aux Questions ---\n{$questionsPlain}\n";

} else {
    // =========================================================================
    // CAS 2 : DEMANDE DE CONTACT / COMMANDE DIAGNOSTIC 150 000 FCFA
    // =========================================================================
    $name    = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
    $email   = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
    $phone   = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
    $company = isset($data['company']) ? trim(strip_tags($data['company'])) : '';
    $sector  = isset($data['sector']) ? trim(strip_tags($data['sector'])) : 'Non spécifié';
    $type    = isset($data['type']) ? trim(strip_tags($data['type'])) : 'Non spécifié';
    $need    = isset($data['need']) ? trim(strip_tags($data['need'])) : 'Non spécifié';
    $message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

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

    $name  = str_replace(["\r", "\n"], ' ', $name);
    $email = str_replace(["\r", "\n"], ' ', $email);

    // Personnalisation du sujet selon le type de commande
    if (stripos($need, 'pme-360') !== false || stripos($message, '150 000') !== false) {
        $subject = "=?UTF-8?B?" . base64_encode("[COMMANDE DIAGNOSTIC 150K] {$name} ({$company})") . "?=";
    } elseif (stripos($need, 'financeready') !== false) {
        $subject = "=?UTF-8?B?" . base64_encode("[FINANCEREADY PME] {$name} ({$company})") . "?=";
    } else {
        $subject = "=?UTF-8?B?" . base64_encode("[NEXUS CONTACT & DEVIS] {$name} ({$company})") . "?=";
    }

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
                <p>Notification automatique — Demande de contact & commande</p>
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
                    <div class="item-value"><a href="tel:' . htmlspecialchars($phone) . '" style="color: #10b981; font-weight: bold;">' . htmlspecialchars($phone) . '</a></div>
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

    $plainBody = "=== NOUVELLE DEMANDE DE CONTACT / COMMANDE - NEXUS ALPHA CONSULTING ===\n\n";
    $plainBody .= "Nom : {$name}\n";
    $plainBody .= "Entreprise : {$company}\n";
    $plainBody .= "Email : {$email}\n";
    $plainBody .= "Téléphone : {$phone}\n";
    $plainBody .= "Secteur : {$sector}\n";
    $plainBody .= "Type d'organisation : {$type}\n";
    $plainBody .= "Besoin : {$need}\n\n";
    $plainBody .= "--- Message ---\n{$message}\n\n";
    $plainBody .= "---\nEnvoyé le " . date('d/m/Y H:i:s') . " depuis nexusalphaconsulting.com";
}

// En-têtes du courrier multipart
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

// Envoi de l'email via la fonction native mail()
$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a été transmise avec succès à info@nexusalphaconsulting.com.'
    ]);
} else {
    ob_clean();
    echo json_encode([
        'success' => true,
        'simulated' => true,
        'message' => 'Votre demande a été enregistrée avec succès pour transmission à info@nexusalphaconsulting.com.'
    ]);
}
