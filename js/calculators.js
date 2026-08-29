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
   -------------------------------------------------------------------------- */
function initPMEQuiz() {
  const pmeForm = document.getElementById('pme-quiz-form');
  const pmeResultBox = document.getElementById('pme-quiz-result-box');
  const pmeScoreBar = document.getElementById('pme-score-bar');
  const pmeScoreText = document.getElementById('pme-score-text');
  const pmeBadge = document.getElementById('pme-maturity-badge');
  const pmeRecommendations = document.getElementById('pme-recommendations');

  if (!pmeForm) return;

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
      vigilance: "Dossier financier non bancable (délais excessifs ou refus de financement)"
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
      strength: "Mesure de l'impact des coûts énergétiques et arbitrage solaire/hybride",
      vigilance: "Facture énergétique subie sans analyse de rentabilité des alternatives"
    }
  };

  pmeForm.addEventListener('change', calculatePMEScore);

  let hasStarted = false;

  function calculatePMEScore() {
    const questions = Object.keys(QUESTION_MAP);
    let yesCount = 0;
    let answered = 0;
    const strengths = [];
    const vigilances = [];

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

    if (answered === 1 && !hasStarted) {
      hasStarted = true;
      if (window.NexusAnalytics) {
        window.NexusAnalytics.trackEvent('demarrage_questionnaire_pme');
      }
    }

    if (answered < 9) {
      if (pmeScoreText) pmeScoreText.textContent = `${answered}/9 questions répondues...`;
      return;
    }

    // Score out of 100
    const pmeScore = Math.round((yesCount / 9) * 100);
    pmeScoreBar.style.width = pmeScore + '%';
    pmeScoreText.textContent = `${pmeScore} / 100 (${yesCount}/9 indicateurs maîtrisés)`;

    let pmeLevel = '';
    let badgeClass = '';
    let barColor = '';
    let summaryAction = '';

    if (pmeScore <= 44) {
      pmeLevel = '🔴 NIVEAU : VULNÉRABLE / ACTION URGENTE';
      badgeClass = 'badge-rose';
      barColor = '#f43f5e';
      summaryAction = "Votre entreprise présente des vulnérabilités critiques immédiates sur le cash et le pilotage. Une structuration d'urgence s'impose avant tout nouvel investissement.";
    } else if (pmeScore <= 77) {
      pmeLevel = '🟠 NIVEAU : À RENFORCER / EN STRUCTURATION';
      badgeClass = 'badge-gold';
      barColor = '#d5bb76';
      summaryAction = "Votre PME possède des atouts solides mais présente des angles morts clés (trésorerie, BFR ou dossier bancaire) qui freinent votre accès au financement.";
    } else {
      pmeLevel = '🟢 NIVEAU : ROBUSTE / PRÊT POUR L\'ACCÉLÉRATION';
      badgeClass = 'badge-emerald';
      barColor = '#10b981';
      summaryAction = "Excellente maturité ! Votre gouvernance financière est saine. Vous êtes en position favorable pour lever des fonds et accélérer votre croissance.";
    }

    pmeScoreBar.style.background = barColor;
    pmeBadge.textContent = pmeLevel;
    pmeBadge.className = `badge ${badgeClass}`;

    // Build dynamic points forts & points de vigilance HTML
    const strengthsHTML = strengths.length > 0
      ? strengths.map(s => `<li>${s}</li>`).join('')
      : `<li>Aucun point fort critique validé parmi les 9 critères.</li>`;

    const vigilanceHTML = vigilances.length > 0
      ? vigilances.map(v => `<li>${v}</li>`).join('')
      : `<li>Tous les 9 indicateurs fondamentaux sont validés.</li>`;

    const recoHTML = `
      <div class="pme-diag-results-pane animate-fade-up">
        <p style="font-size: 0.95rem; color: #ffffff; line-height: 1.6; margin-bottom: 1.25rem;">
          <strong>Synthèse de votre pré-évaluation :</strong> ${summaryAction}
        </p>

        <div class="pme-points-grid">
          <div class="pme-points-box strengths">
            <h6 style="color: #6ee7b7;"><i class="fas fa-check-circle"></i> Vos Points Forts Déclarés (${strengths.length})</h6>
            <ul class="pme-points-list">
              ${strengthsHTML}
            </ul>
          </div>

          <div class="pme-points-box vigilance">
            <h6 style="color: #fda4af;"><i class="fas fa-exclamation-triangle"></i> Vos Points de Vigilance Prioritaires (${vigilances.length})</h6>
            <ul class="pme-points-list">
              ${vigilanceHTML}
            </ul>
          </div>
        </div>

        <!-- Prudentiel Disclaimer -->
        <div class="pme-disclaimer-box">
          <i class="fas fa-shield-alt" style="font-size: 1.25rem; color: #f59e0b; flex-shrink: 0; margin-top: 0.1rem;"></i>
          <div>
            <strong>Avertissement méthodologique :</strong> Ce pré-score constitue un premier outil de diagnostic et de préparation. Il ne remplace pas l'analyse approfondie de vos états financiers réels (bilan, compte de résultat, balance générale), ne constitue pas une notation de crédit bancaire et ne garantit pas l'obtention d'un financement.
          </div>
        </div>

        <!-- High-Impact Conversion CTA -->
        <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: rgba(23, 49, 81, 0.6); border: 1px solid var(--border-gold); border-radius: var(--radius-md);">
          <h5 style="color: #ffffff; font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-heading);">
            Vous souhaitez connaître votre situation financière réelle et obtenir votre feuille de route chiffrée ?
          </h5>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.25rem; max-width: 650px; margin-left: auto; margin-right: auto;">
            Passez du pré-diagnostic déclaratif à l'audit financier complet sur la base de vos états financiers certifiés ou déclaratifs.
          </p>
          <a href="#contact" class="btn btn-gold btn-lg cta-order-diag-150k" id="btn-order-diag-150k" style="box-shadow: 0 6px 25px rgba(213, 187, 118, 0.35);">
            <i class="fas fa-file-invoice-dollar"></i> Demander le Diagnostic Complet — 150 000 FCFA
          </a>
        </div>
      </div>
    `;

    pmeRecommendations.innerHTML = recoHTML;
    pmeResultBox.style.display = 'block';

    // Attach click listener to dynamic CTA
    const orderBtn = document.getElementById('btn-order-diag-150k');
    if (orderBtn) {
      orderBtn.addEventListener('click', (e) => {
        if (window.NexusAnalytics) {
          window.NexusAnalytics.trackEvent('clic_diagnostic_150k', { score: pmeScore, strengthsCount: strengths.length, vigilanceCount: vigilances.length });
        }
        const selectNeed = document.getElementById('contact-pole-select');
        if (selectNeed) {
          selectNeed.value = 'pme-360';
        }
        const messageBox = document.getElementById('contact-message');
        if (messageBox && (!messageBox.value || messageBox.value.indexOf('Pre-Score') !== -1)) {
          messageBox.value = `Bonjour,\nSuite à la réalisation de mon pré-diagnostic PME 360 (Nexus Pre-Score: ${pmeScore}/100, ${vigilances.length} points de vigilance identifiés), je souhaite commander le Diagnostic Financier Complet PME 360 à 150 000 FCFA afin d'analyser nos états financiers et structurer notre plan d'action à 90 jours.`;
        }
      });
    }

    if (window.NexusAnalytics) {
      window.NexusAnalytics.trackEvent('questionnaire_pme_termine', { score: pmeScore, yesCount: yesCount });
    }
  }
}

/* Helper FCFA Formatter */
function formatFCFA(val) {
  if (isNaN(val)) return '0 FCFA';
  return Math.round(val).toLocaleString('fr-FR') + ' FCFA';
}

