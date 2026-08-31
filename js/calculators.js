/**
 * NEXUS ALPHA CONSULTING - QUANTITATIVE LAB CALCULATORS & DIAGNOSTIC
 * Interactive tools for IFRS 9 ECL, Market VaR/ES & Risk Maturity Diagnostic
 */

document.addEventListener('DOMContentLoaded', () => {
  initIFRS9Calculator();
  initVaRCalculator();
  initMaturityQuiz();
  initPMEQuiz();
});

/* --------------------------------------------------------------------------
   1. IFRS 9 ECL (EXPECTED CREDIT LOSS) SIMULATOR
   -------------------------------------------------------------------------- */
function initIFRS9Calculator() {
  const eadInput = document.getElementById('calc-ead');
  const pdInput = document.getElementById('calc-pd');
  const pdVal = document.getElementById('calc-pd-val');
  const lgdInput = document.getElementById('calc-lgd');
  const lgdVal = document.getElementById('calc-lgd-val');
  const macroSelect = document.getElementById('calc-macro');
  const stageBtns = document.querySelectorAll('.stage-btn');
  
  // Results DOM
  const resultECL = document.getElementById('result-ecl-val');
  const resultRate = document.getElementById('result-ecl-rate');
  const resultStagingDesc = document.getElementById('result-staging-desc');
  const resultMacroAdj = document.getElementById('result-macro-adj');
  const resultNetExp = document.getElementById('result-net-exp');

  if (!eadInput || !resultECL) return;

  let currentStage = 1;

  function updateECL() {
    const ead = parseFloat(eadInput.value) || 0;
    const pdBase = parseFloat(pdInput.value) || 0;
    const lgd = parseFloat(lgdInput.value) || 0;
    const macroFactor = parseFloat(macroSelect.value) || 1.0;

    // Display slider values
    pdVal.textContent = pdBase.toFixed(1) + '%';
    lgdVal.textContent = lgd.toFixed(1) + '%';

    let effectivePD = (pdBase / 100) * macroFactor;
    let stageMultiplier = 1.0;

    if (currentStage === 1) {
      // Stage 1: 12-month ECL
      stageMultiplier = 1.0;
      resultStagingDesc.textContent = "Stage 1 (Horizon 12 mois — Sans dégradation)";
    } else if (currentStage === 2) {
      // Stage 2: Lifetime ECL (estimated 3.2x cumulative lifetime duration)
      stageMultiplier = 3.2;
      effectivePD = Math.min(0.95, effectivePD * stageMultiplier);
      resultStagingDesc.textContent = "Stage 2 (Durée de vie — SICR / Dégradation significative)";
    } else if (currentStage === 3) {
      // Stage 3: Defaulted (PD = 100%)
      effectivePD = 1.0;
      resultStagingDesc.textContent = "Stage 3 (Défaut avéré — Provision sur valeur nette)";
    }

    const effectiveLGD = lgd / 100;
    const totalECL = ead * effectivePD * effectiveLGD;
    const eclRate = ead > 0 ? (totalECL / ead) * 100 : 0;
    const netExposure = Math.max(0, ead - totalECL);

    // Update UI
    resultECL.textContent = formatFCFA(totalECL);
    resultRate.textContent = eclRate.toFixed(2) + '% de l\'EAD';
    resultMacroAdj.textContent = macroFactor === 1.0 ? 'Neutre (1.0x)' : (macroFactor > 1.0 ? `Défavorable (+${Math.round((macroFactor-1)*100)}%)` : `Favorable (-${Math.round((1-macroFactor)*100)}%)`);
    resultNetExp.textContent = formatFCFA(netExposure);
  }

  // Event Listeners
  eadInput.addEventListener('input', updateECL);
  pdInput.addEventListener('input', updateECL);
  lgdInput.addEventListener('input', updateECL);
  macroSelect.addEventListener('change', updateECL);

  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStage = parseInt(btn.dataset.stage, 10);
      updateECL();
    });
  });

  updateECL();
}

/* --------------------------------------------------------------------------
   2. MARKET RISK VaR & EXPECTED SHORTFALL CALCULATOR
   -------------------------------------------------------------------------- */
function initVaRCalculator() {
  const nominalInput = document.getElementById('var-nominal');
  const volInput = document.getElementById('var-vol');
  const volVal = document.getElementById('var-vol-val');
  const confSelect = document.getElementById('var-conf');
  const horizonSelect = document.getElementById('var-horizon');

  const resultVaR = document.getElementById('result-var-val');
  const resultES = document.getElementById('result-es-val');
  const resultVaRPct = document.getElementById('result-var-pct');
  const resultFRTBImpact = document.getElementById('result-frtb-impact');

  if (!nominalInput || !resultVaR) return;

  function updateVaR() {
    const nominal = parseFloat(nominalInput.value) || 0;
    const annualVol = (parseFloat(volInput.value) || 0) / 100;
    volVal.textContent = (annualVol * 100).toFixed(1) + '%';

    const conf = parseFloat(confSelect.value) || 0.99;
    const days = parseInt(horizonSelect.value, 10) || 10;

    // Daily vol approx from annual (252 trading days)
    const dailyVol = annualVol / Math.sqrt(252);
    const horizonVol = dailyVol * Math.sqrt(days);

    // Z-scores for standard normal distribution
    let zScore = 2.326; // 99%
    let esMultiplier = 2.665; // ES for normal 99%

    if (conf === 0.95) {
      zScore = 1.645;
      esMultiplier = 2.063;
    } else if (conf === 0.975) {
      zScore = 1.960;
      esMultiplier = 2.338;
    } else if (conf === 0.99) {
      zScore = 2.326;
      esMultiplier = 2.665;
    }

    const varAmount = nominal * zScore * horizonVol;
    const esAmount = nominal * esMultiplier * horizonVol;
    const varPct = nominal > 0 ? (varAmount / nominal) * 100 : 0;
    const frtbGap = esAmount - varAmount;

    resultVaR.textContent = formatFCFA(varAmount);
    resultES.textContent = formatFCFA(esAmount);
    resultVaRPct.textContent = varPct.toFixed(2) + '% de l\'exposition';
    resultFRTBImpact.textContent = '+' + formatFCFA(frtbGap) + ' (+ ' + ((esAmount/varAmount - 1)*100).toFixed(1) + '%)';
  }

  nominalInput.addEventListener('input', updateVaR);
  volInput.addEventListener('input', updateVaR);
  confSelect.addEventListener('change', updateVaR);
  horizonSelect.addEventListener('change', updateVaR);

  updateVaR();
}

/* --------------------------------------------------------------------------
   3. RISK MATURITY DIAGNOSTIC (5-QUESTION SELF-AUDIT)
   -------------------------------------------------------------------------- */
function initMaturityQuiz() {
  const quizForm = document.getElementById('maturity-quiz-form');
  const quizResultBox = document.getElementById('quiz-result-box');
  const quizScoreBar = document.getElementById('quiz-score-bar');
  const quizScoreText = document.getElementById('quiz-score-text');
  const quizBadge = document.getElementById('quiz-maturity-badge');
  const quizRecommendations = document.getElementById('quiz-recommendations');

  if (!quizForm) return;

  quizForm.addEventListener('change', calculateMaturity);

  function calculateMaturity() {
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5'];
    let totalScore = 0;
    let answered = 0;

    questions.forEach(qName => {
      const selected = quizForm.querySelector(`input[name="${qName}"]:checked`);
      if (selected) {
        totalScore += parseInt(selected.value, 10);
        answered++;
      }
    });

    if (answered < 5) {
      quizScoreText.textContent = `${answered}/5 questions répondues...`;
      return;
    }

    // Score out of 100 (each question 0-20 pts)
    const finalScore = totalScore;
    quizScoreBar.style.width = finalScore + '%';
    quizScoreText.textContent = `${finalScore} / 100`;

    let maturityLevel = '';
    let badgeClass = '';
    let recoHTML = '';

    if (finalScore < 40) {
      maturityLevel = 'Maturité Initiale / Risque Élevé';
      badgeClass = 'badge-rose';
      quizScoreBar.style.background = '#f43f5e';
      recoHTML = `
        <div class="africa-specific-box" style="border-color: #f43f5e;">
          <h5><i class="fas fa-exclamation-triangle" style="color: #f43f5e;"></i> Priorités d'urgence identifiées</h5>
          <p>Votre dispositif présente d'importantes lacunes face aux exigences prudentielles de la BCEAO / COBAC et aux normes IFRS 9 / Bâle IV.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>Pôle 6 :</strong> Audit d'urgence & structuration de la gouvernance des risques (3 lignes de défense).</li>
            <li><strong>Pôle 2 :</strong> Révision complète des modèles ECL IFRS 9 et des scorecards d'octroi.</li>
            <li><strong>Pôle 4 :</strong> Établissement d'un inventaire exhaustif des modèles et plan de remédiation.</li>
          </ul>
        </div>
      `;
    } else if (finalScore < 70) {
      maturityLevel = 'Maturité Intermédiaire / En Structuration';
      badgeClass = 'badge-gold';
      quizScoreBar.style.background = '#d5bb76';
      recoHTML = `
        <div class="africa-specific-box">
          <h5><i class="fas fa-chart-line" style="color: var(--color-gold-primary);"></i> Axes d'optimisation recommandés</h5>
          <p>Votre établissement dispose de bases saines mais doit accélérer l'automatisation quantitative et la conformité aux stress tests.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>Pôle 4 (MRM) :</strong> Mise en place d'un monitoring continu et validation indépendante des modèles.</li>
            <li><strong>Pôle 1 :</strong> Automatisation des ratios de liquidité LCR/NSFR et stress tests IRRBB Bâle IV.</li>
            <li><strong>Pôle 5 :</strong> Connexion des flux de données core banking (T24/Amplitude) et dashboards de direction.</li>
          </ul>
        </div>
      `;
    } else {
      maturityLevel = 'Maturité Avancée / Leader Régional';
      badgeClass = 'badge-emerald';
      quizScoreBar.style.background = '#10b981';
      recoHTML = `
        <div class="africa-specific-box" style="border-color: #10b981;">
          <h5><i class="fas fa-check-circle" style="color: #10b981;"></i> Excellence & Innovation Quantitative</h5>
          <p>Félicitations. Votre institution possède un dispositif robuste. Pour maintenir votre leadership, focalisez-vous sur l'IA et l'ESG.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>Pôle 5 :</strong> Déploiement du Machine Learning (XGBoost/XAI) et exploitation des données alternatives (Mobile Money).</li>
            <li><strong>Pôle 3 :</strong> Intégration des stress tests climatiques physiques/transition et conformité TCFD.</li>
            <li><strong>Pôle 6 :</strong> Formations de pointe pour vos équipes (Préparation FRM, Python avancé).</li>
          </ul>
        </div>
      `;
    }

    quizBadge.textContent = maturityLevel;
    quizBadge.className = `badge ${badgeClass}`;
    quizRecommendations.innerHTML = recoHTML;
    quizResultBox.style.display = 'block';
  }
}

/* --------------------------------------------------------------------------
   4. AUTODIAGNOSTIC NEXUS PME 360™ (NEXUS PRE-SCORE™ & MINI-DIAGNOSTIC)
/* --------------------------------------------------------------------------
   4. AUTODIAGNOSTIC NEXUS PME 360™ (NEXUS PRE-SCORE™ & MINI-DIAGNOSTIC SECTORISÉ)
   -------------------------------------------------------------------------- */
function initPMEQuiz() {
  const pmeForm = document.getElementById('pme-quiz-form');
  const pmeResultBox = document.getElementById('pme-quiz-result-box');
  const pmeScoreBar = document.getElementById('pme-score-bar');
  const pmeScoreText = document.getElementById('pme-score-text');
  const pmeBadge = document.getElementById('pme-maturity-badge');
  const pmeRecommendations = document.getElementById('pme-recommendations');
  const sectorCards = document.querySelectorAll('.sector-picker-card');

  if (!pmeForm) return;

  // Sector Data Definition
  const SECTOR_INFO = {
    'agro-industrie': {
      name: '🌾 Agro-industrie & Transformation',
      challenges: 'BFR de campagne, stocks agricoles saisonniers, approvisionnement matières, facture énergétique usine et financement de collecte.',
      priorities: 'Structurer un plan de trésorerie sur la saison d\'achat, maîtriser les coûts de détention des stocks périssables et calibrer un dossier de crédit de campagne bancable.'
    },
    'industrie': {
      name: '🏭 Industrie & PMI',
      challenges: 'Coûts de production réels, marges unitaires, capacité productive, investissements machines, énergie et trésorerie d\'exploitation.',
      priorities: 'Mettre en place un calcul de rentabilité analytique par ligne de produit, auditer la facture énergétique (solution solaire/hybride) et optimiser la rotation des matières premières.'
    },
    'btp': {
      name: '🏗️ BTP & Construction',
      challenges: 'BFR par chantier, créances clients et délais de paiement, gestion des avances de démarrage, suivi des marchés et rentabilité des contrats.',
      priorities: 'Piloter la trésorerie affaire par affaire, accélérer le recouvrement des décomptes certifiés et structurer les demandes de cautions et avances bancaires.'
    },
    'commerce': {
      name: '📦 Commerce & Distribution',
      challenges: 'Rotation des stocks, marges réelles par rayon, délais de règlement fournisseurs, créances clients et trésorerie d\'exploitation.',
      priorities: 'Optimiser le cycle de rotation des stocks, renégocier les délais fournisseurs pour alléger le BFR et éliminer les références de produits destructrices de marge.'
    },
    'services': {
      name: '💼 Services & Conseil',
      challenges: 'Structure de charges fixes, rentabilité par mission, productivité des équipes, trésorerie et récurrence du chiffre d\'affaires.',
      priorities: 'Développer des offres en abonnement récurrent pour stabiliser les flux, surveiller le taux de marge nette par client et automatiser le reporting de gestion.'
    },
    'autre': {
      name: '🏢 Autre secteur d\'activité',
      challenges: 'Maîtrise de la trésorerie à 13 semaines, fiabilisation des indicateurs de gestion et structuration financière.',
      priorities: 'Conduire un diagnostic 360 complet pour identifier les vulnérabilités propres à votre modèle d\'affaires et préparer vos dossiers bancaires.'
    }
  };

  const QUESTION_MAP = {
    pme_q1: {
      topic: "Trésorerie prévisionnelle",
      strength: "Visibilité claire sur la trésorerie à 13 semaines",
      vigilance: "Absence de prévisionnel de trésorerie à 13 semaines (risque d'impasse de liquidité)"
    },
    pme_q2: {
      topic: "Besoin en Fonds de Roulement (BFR)",
      strength: "Maîtrise et suivi actif du BFR et des créances clients",
      vigilance: "BFR non modélisé (risque d'asphyxie par la croissance ou les retards de paiement)"
    },
    pme_q3: {
      topic: "Marges & Rentabilité analytique",
      strength: "Connaissance précise de la marge nette par produit et activité",
      vigilance: "Marges nettes réelles mal identifiées (risque de subventionner des activités déficitaires)"
    },
    pme_q4: {
      topic: "Hiérarchisation des risques financiers",
      strength: "Capacité d'identification et d'anticipation des risques financiers majeurs",
      vigilance: "Risques financiers non hiérarchisés (vulnérabilité face aux chocs imprévus)"
    },
    pme_q5: {
      topic: "Données de gestion & Automatisation",
      strength: "Données de gestion fiables, centralisées et automatisées",
      vigilance: "Données dispersées sous Excel et ressaisies manuelles chronophages"
    },
    pme_q6: {
      topic: "Bancarisation & Dossier de financement",
      strength: "Dossier financier structuré et prêt pour solliciter des financements",
      vigilance: "Dossier financier non bancable (délais excessifs ou refus de financement bancaire)"
    },
    pme_q7: {
      topic: "Création de valeur clients/marchés",
      strength: "Cartographie claire des segments et clients les plus rentables",
      vigilance: "Manque de visibilité sur les segments de clients destructeurs de valeur"
    },
    pme_q8: {
      topic: "Financement équilibré de la croissance",
      strength: "Croissance autofinancée et équilibrée sans mettre sous tension le cash",
      vigilance: "Croissance consommatrice de trésorerie non anticipée"
    },
    pme_q9: {
      topic: "Coûts énergétiques & Rentabilité",
      strength: "Mesure de l'impact des coûts énergétiques et arbitrage des investissements",
      vigilance: "Facture énergétique subie sans analyse de rentabilité des alternatives"
    }
  };

  // Handle Sector Picker Selection
  sectorCards.forEach(card => {
    card.addEventListener('click', () => {
      sectorCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const selectedSector = radio.value;
        if (window.NexusAnalytics) {
          window.NexusAnalytics.trackEvent('sector_selected', { sector: selectedSector });
        }
      }
    });
  });

  // Global helper to select sector programmatically from external CTAs
  window.selectPMESector = function(sectorKey) {
    const card = document.querySelector(`.sector-picker-card input[value="${sectorKey}"]`);
    if (card) {
      const parent = card.closest('.sector-picker-card');
      if (parent) {
        sectorCards.forEach(c => c.classList.remove('selected'));
        parent.classList.add('selected');
        card.checked = true;
      }
    }
  };

  pmeForm.addEventListener('change', (e) => {
    // When any radio changes in questions
    if (e.target.name && e.target.name.startsWith('pme_q')) {
      checkAndComputePMEScore(false);
    }
  });

  pmeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkAndComputePMEScore(true);
  });

  let hasStarted = false;

  function checkAndComputePMEScore(isSubmit = false) {
    const questions = Object.keys(QUESTION_MAP);
    let yesCount = 0;
    let answered = 0;
    const strengths = [];
    const vigilances = [];

    // Check selected sector
    const sectorRadio = pmeForm.querySelector('input[name="pme_sector"]:checked');
    const selectedSectorKey = sectorRadio ? sectorRadio.value : 'agro-industrie';
    const sectorData = SECTOR_INFO[selectedSectorKey] || SECTOR_INFO['agro-industrie'];

    questions.forEach(qName => {
      const selected = pmeForm.querySelector(`input[name="${qName}"]:checked`);
      if (selected) {
        answered++;
        if (selected.value === '1') {
          yesCount++;
          strengths.push(QUESTION_MAP[qName].strength);
        } else {
          vigilances.push(QUESTION_MAP[qName].vigilance);
        }
      }
    });

    if (answered >= 1 && !hasStarted) {
      hasStarted = true;
      if (window.NexusAnalytics) {
        window.NexusAnalytics.trackEvent('prediagnostic_start', { sector: selectedSectorKey });
      }
    }

    if (answered < 9) {
      if (pmeScoreText) pmeScoreText.textContent = `${answered}/9 questions répondues...`;
      if (isSubmit) {
        alert('Veuillez répondre aux 9 questions du pré-diagnostic pour générer votre score.');
      }
      return;
    }

    // Lead data collection
    const leadName = document.getElementById('pme_lead_name')?.value || '';
    const leadCompany = document.getElementById('pme_lead_company')?.value || '';
    const leadPhone = document.getElementById('pme_lead_phone')?.value || '';
    const leadEmail = document.getElementById('pme_lead_email')?.value || '';

    // Score out of 100
    const pmeScore = Math.round((yesCount / 9) * 100);

    // Official Scale Grille
    // 80–100 : 🟢 Solide
    // 70–79 : 🟡 À renforcer
    // 50–69 : 🟠 Structuration nécessaire
    // <50 : 🔴 Mise à niveau prioritaire
    let pmeLevel = '';
    let badgeClass = '';
    let barColor = '';
    let summaryAction = '';

    if (pmeScore >= 80) {
      pmeLevel = '🟢 Solide';
      badgeClass = 'badge-emerald';
      barColor = '#10b981';
      summaryAction = "Excellente maturité globale ! Votre gestion et votre gouvernance financière sont saines. Vous disposez d'atouts solides pour solliciter des financements de croissance et optimiser vos marges.";
    } else if (pmeScore >= 70) {
      pmeLevel = '🟡 À renforcer';
      badgeClass = 'badge-gold';
      barColor = '#f59e0b';
      summaryAction = "Bases financières saines mais certains piliers (visibilité de trésorerie, BFR ou dossier bancaire) nécessitent un renforcement pour sécuriser votre développement sans tension.";
    } else if (pmeScore >= 50) {
      pmeLevel = '🟠 Structuration nécessaire';
      badgeClass = 'badge-gold';
      barColor = '#f97316';
      summaryAction = "Votre PME présente des fragilités notables de structuration. Un audit financier approfondi est indispensable pour corriger vos points de fuite de cash avant d'envisager une nouvelle phase d'expansion.";
    } else {
      pmeLevel = '🔴 Mise à niveau prioritaire';
      badgeClass = 'badge-rose';
      barColor = '#f43f5e';
      summaryAction = "Vulnérabilités critiques immédiates identifiées sur le pilotage du cash, le BFR et la rentabilité. Une mise à niveau financière d'urgence s'impose pour éviter tout risque d'impasse.";
    }

    if (pmeScoreBar) {
      pmeScoreBar.style.width = pmeScore + '%';
      pmeScoreBar.style.background = barColor;
    }
    if (pmeScoreText) {
      pmeScoreText.textContent = `${pmeScore} / 100`;
    }
    if (pmeBadge) {
      pmeBadge.textContent = `${pmeLevel} (${pmeScore}/100)`;
      pmeBadge.className = `badge ${badgeClass}`;
    }

    // Extract detailed questions and answers for email transmission
    const questionsDetailed = [];
    questions.forEach((qName, idx) => {
      const selected = pmeForm.querySelector(`input[name="${qName}"]:checked`);
      const qBox = pmeForm.querySelector(`input[name="${qName}"]`)?.closest('.quiz-question-box');
      const qTitle = qBox?.querySelector('.quiz-question-title')?.textContent?.trim() || `Question ${idx + 1}`;
      const ansText = (selected && selected.value === '1') ? 'Oui' : 'Non';
      questionsDetailed.push({
        question: qTitle,
        answer: ansText
      });
    });

    // Save lead & score to storage / session for commercial follow-up
    const qualificationLead = {
      name: leadName,
      company: leadCompany,
      phone: leadPhone,
      email: leadEmail,
      sector: selectedSectorKey,
      sectorName: sectorData.name,
      score: pmeScore,
      level: pmeLevel,
      date: new Date().toISOString(),
      strengths: strengths,
      vigilances: vigilances,
      questions: questionsDetailed
    };

    try {
      localStorage.setItem('nexus_last_pme_prescore', JSON.stringify(qualificationLead));
    } catch(e) {}

    // Transmettre immédiatement le pré-diagnostic à info@nexusalphaconsulting.com
    fetch('send_mail.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        form_type: 'prediagnostic',
        name: leadName,
        company: leadCompany,
        phone: leadPhone,
        email: leadEmail,
        sector: selectedSectorKey,
        sectorName: sectorData.name,
        score: pmeScore,
        level: pmeLevel,
        summary: summaryAction,
        strengths: strengths,
        vigilances: vigilances,
        questions: questionsDetailed
      })
    }).then(res => res.json()).then(data => {
      console.log('Notification pré-diagnostic transmise avec succès à info@nexusalphaconsulting.com:', data);
    }).catch(err => {
      console.warn('Transmission réseau pré-diagnostic:', err);
    });

    // Track analytics events
    if (window.NexusAnalytics) {
      window.NexusAnalytics.trackEvent('prediagnostic_complete', {
        sector: selectedSectorKey,
        score: pmeScore,
        level: pmeLevel
      });
      window.NexusAnalytics.trackEvent('prescore_view', {
        score: pmeScore,
        strengthsCount: strengths.length,
        vigilanceCount: vigilances.length
      });
    }

    // Build dynamic points forts & points de vigilance HTML
    const strengthsHTML = strengths.length > 0
      ? strengths.map(s => `<li>${s}</li>`).join('')
      : `<li>Aucun point fort critique déclaré parmi les 9 indicateurs clés.</li>`;

    const vigilanceHTML = vigilances.length > 0
      ? vigilances.map(v => `<li>${v}</li>`).join('')
      : `<li>Félicitations, l'ensemble des 9 critères fondamentaux ont été validés positivement.</li>`;

    const recoHTML = `
      <div class="pme-diag-results-pane animate-fade-up visible" style="opacity: 1 !important; transform: none !important;">
        
        <div class="pme-diag-score-header">
          <div>
            <span style="font-size: 0.82rem; text-transform: uppercase; color: var(--color-gold-light); font-weight: 700; letter-spacing: 0.05em;">
              Votre Nexus Pre-Score
            </span>
            <h4 style="font-family: var(--font-heading); font-size: 1.65rem; color: #ffffff; margin-top: 0.25rem;">
              ${pmeScore} / 100 &nbsp;·&nbsp; <span style="font-size: 1.15rem; color: ${barColor}; font-weight: 700;">${pmeLevel}</span>
            </h4>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-gold" style="font-size: 0.85rem;">Secteur : ${sectorData.name}</span>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin: 0.85rem 0 1.25rem 0;">
          <div style="width: ${pmeScore}%; height: 100%; background: ${barColor}; border-radius: 4px; transition: width 0.6s ease;"></div>
        </div>

        <p style="font-size: 0.95rem; color: #ffffff; line-height: 1.6; margin-bottom: 1.25rem;">
          <strong>Synthèse exécutive :</strong> ${summaryAction}
        </p>

        <!-- Sector Insights Box -->
        <div class="sector-insight-box">
          <h6><i class="fas fa-bullseye" style="color: var(--color-gold-primary);"></i> Éclairage Spécifique : ${sectorData.name}</h6>
          <p><strong>Enjeux majeurs de votre secteur :</strong> ${sectorData.challenges}</p>
          <p style="margin-top: 0.35rem;"><strong>Priorité stratégique Nexus :</strong> ${sectorData.priorities}</p>
        </div>

        <div class="pme-points-grid">
          <div class="pme-points-box strengths">
            <h6 style="color: #6ee7b7;"><i class="fas fa-check-circle"></i> Vos points forts (${strengths.length})</h6>
            <ul class="pme-points-list">
              ${strengthsHTML}
            </ul>
          </div>

          <div class="pme-points-box vigilance">
            <h6 style="color: #fda4af;"><i class="fas fa-exclamation-triangle"></i> Vos points de vigilance (${vigilances.length})</h6>
            <ul class="pme-points-list">
              ${vigilanceHTML}
            </ul>
          </div>
        </div>

        <!-- Distinction Explanation Grid -->
        <div class="pme-distinction-grid">
          <div class="pme-distinction-col">
            <h6 style="color: var(--text-secondary);"><i class="fas fa-tasks"></i> Pré-diagnostic (Gratuit)</h6>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.45;">
              Accessible sans bilan ni compte de résultat. Première prise de conscience rapide pour identifier vos vulnérabilités.
            </p>
          </div>
          <div class="pme-distinction-col highlight-col">
            <h6 style="color: var(--color-gold-light);"><i class="fas fa-file-invoice-dollar"></i> Diagnostic Complet Nexus PME 360</h6>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
              Analyse financière approfondie sur vos états financiers réels (bilan, compte de résultat, trésorerie, dettes, créances, stocks). Livrables : Score certifié, cartographie 7 dimensions et plan d'action 90 jours.
            </p>
          </div>
        </div>

        <!-- Systematic Prudence Disclaimer -->
        <div class="pme-disclaimer-box">
          <i class="fas fa-shield-alt" style="font-size: 1.3rem; color: #f59e0b; flex-shrink: 0; margin-top: 0.1rem;"></i>
          <div>
            <strong>Avertissement méthodologique :</strong> Ce pré-score constitue une première évaluation de votre entreprise. Il ne remplace pas l'analyse de vos états financiers et ne constitue pas une notation de crédit bancaire, une décision de crédit, une garantie de financement ni une promesse d'obtention de crédit.
          </div>
        </div>

        <!-- High Conversion CTA to Diagnostic 150k -->
        <div style="text-align: center; margin-top: 2rem; padding: 1.75rem; background: radial-gradient(circle at 50% 50%, rgba(23, 49, 81, 0.9) 0%, rgba(10, 20, 36, 0.95) 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
          <h4 style="color: #ffffff; font-size: 1.35rem; margin-bottom: 0.5rem; font-family: var(--font-heading);">
            Vous souhaitez connaître votre situation financière réelle ?
          </h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; max-width: 680px; margin-left: auto; margin-right: auto; line-height: 1.6;">
            Le diagnostic <strong>Nexus PME 360</strong> analyse vos données financières et opérationnelles afin d'identifier vos forces, vos fragilités, vos principaux risques et vos priorités d'action.
          </p>
          <div style="margin-bottom: 1.25rem;">
            <span style="font-size: 0.9rem; color: #ffffff; font-weight: 700; display: block; letter-spacing: 0.05em;">NEXUS PME 360</span>
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: var(--color-gold-light);">150 000 FCFA</span>
          </div>
          <a href="#contact" class="btn btn-gold btn-lg cta-order-diag-150k" id="btn-order-diag-150k" style="box-shadow: 0 6px 25px rgba(213, 187, 118, 0.35);">
            <i class="fas fa-file-invoice-dollar"></i> Demander mon diagnostic
          </a>
        </div>

      </div>
    `;

    if (pmeRecommendations) {
      pmeRecommendations.innerHTML = recoHTML;
    }
    if (pmeResultBox) {
      pmeResultBox.style.display = 'block';
      pmeResultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Attach click listener to dynamic CTA
    const orderBtn = document.getElementById('btn-order-diag-150k');
    if (orderBtn) {
      orderBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (window.NexusAnalytics) {
          window.NexusAnalytics.trackEvent('diagnostic_click', {
            score: pmeScore,
            sector: selectedSectorKey,
            company: leadCompany
          });
        }
        const selectNeed = document.getElementById('contact-pole-select');
        if (selectNeed) {
          selectNeed.value = 'pme-360';
          selectNeed.dispatchEvent(new Event('change'));
        }
        const contactSector = document.getElementById('contact-sector');
        if (contactSector && selectedSectorKey) {
          contactSector.value = selectedSectorKey === 'btp' ? 'btp-industrie' : (selectedSectorKey === 'commerce' ? 'commerce-distrib' : selectedSectorKey);
        }
        const contactNameInput = document.getElementById('contact-name');
        if (contactNameInput && leadName) {
          contactNameInput.value = leadName;
        }
        const contactCompanyInput = document.getElementById('contact-inst');
        if (contactCompanyInput && leadCompany) {
          contactCompanyInput.value = leadCompany;
        }
        const contactPhoneInput = document.getElementById('contact-phone');
        if (contactPhoneInput && leadPhone) {
          contactPhoneInput.value = leadPhone;
        }
        const contactEmailInput = document.getElementById('contact-email');
        if (contactEmailInput && leadEmail) {
          contactEmailInput.value = leadEmail;
        }
        const messageBox = document.getElementById('contact-message');
        if (messageBox) {
          messageBox.value = `Bonjour,\nSuite à la réalisation de notre pré-diagnostic en ligne dans le secteur ${sectorData.name} (Nexus Pre-Score : ${pmeScore}/100, niveau : ${pmeLevel}), nous souhaitons commander le Diagnostic Complet Nexus PME 360 à 150 000 FCFA sur la base de nos états financiers afin d'obtenir notre cartographie des risques et notre plan d'action à 90 jours.`;
        }

        // Smooth scroll to contact section
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          const headerOffset = 80;
          const elemPosition = contactSec.getBoundingClientRect().top;
          const offsetPosition = elemPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Highlight the form card
          const formPane = document.querySelector('.contact-form-pane');
          if (formPane) {
            formPane.classList.remove('form-highlight-pulse');
            void formPane.offsetWidth;
            formPane.classList.add('form-highlight-pulse');
          }
        }
      });
    }
  }
}

/* Helper FCFA Formatter */
function formatFCFA(val) {
  if (isNaN(val)) return '0 FCFA';
  return Math.round(val).toLocaleString('fr-FR') + ' FCFA';
}


