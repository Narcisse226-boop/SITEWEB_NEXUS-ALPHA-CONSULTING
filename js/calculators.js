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
   4. AUTODIAGNOSTIC NEXUS PME 360™ (NEXUS PME SCORE™)
   -------------------------------------------------------------------------- */
function initPMEQuiz() {
  const pmeForm = document.getElementById('pme-quiz-form');
  const pmeResultBox = document.getElementById('pme-quiz-result-box');
  const pmeScoreBar = document.getElementById('pme-score-bar');
  const pmeScoreText = document.getElementById('pme-score-text');
  const pmeBadge = document.getElementById('pme-maturity-badge');
  const pmeRecommendations = document.getElementById('pme-recommendations');

  if (!pmeForm) return;

  pmeForm.addEventListener('change', calculatePMEScore);

  function calculatePMEScore() {
    const questions = ['pme_q1', 'pme_q2', 'pme_q3', 'pme_q4', 'pme_q5', 'pme_q6', 'pme_q7', 'pme_q8', 'pme_q9'];
    let yesCount = 0;
    let answered = 0;

    questions.forEach(qName => {
      const selected = pmeForm.querySelector(`input[name="${qName}"]:checked`);
      if (selected) {
        answered++;
        if (selected.value === '1') {
          yesCount++;
        }
      }
    });

    if (answered < 9) {
      if (pmeScoreText) pmeScoreText.textContent = `${answered}/9 questions répondues...`;
      return;
    }

    // Score out of 100
    const pmeScore = Math.round((yesCount / 9) * 100);
    pmeScoreBar.style.width = pmeScore + '%';
    pmeScoreText.textContent = `${pmeScore} / 100 (${yesCount}/9 Oui)`;

    let pmeLevel = '';
    let badgeClass = '';
    let recoHTML = '';

    if (pmeScore <= 40) {
      pmeLevel = 'NEXUS PME SCORE : 🔴 VULNÉRABILITÉ FORTE';
      badgeClass = 'badge-rose';
      pmeScoreBar.style.background = '#f43f5e';
      recoHTML = `
        <div class="africa-specific-box" style="border-color: #f43f5e;">
          <h5><i class="fas fa-exclamation-circle" style="color: #f43f5e;"></i> Diagnostic d'Urgence Recommandé</h5>
          <p>Votre PME présente des angles morts critiques sur la trésorerie, la marge ou le contrôle des coûts. Vos décisions reposent trop sur l'intuition.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>NP-01 DIAGNOSTIC PME 360 (Dès 150 000 FCFA) :</strong> Cartographie complète et Roadmap 90 jours.</li>
            <li><strong>NP-02 CASHCONTROL PME :</strong> Mise en place immédiate du modèle de Cash-flow à 13 semaines pour éviter la rupture.</li>
            <li><strong>NP-04 NEXUS CFO LIGHT :</strong> Direction financière externalisée pour structurer le pilotage mensuel.</li>
          </ul>
        </div>
      `;
    } else if (pmeScore <= 70) {
      pmeLevel = 'NEXUS PME SCORE : 🟠 VIGILANCE & STRUCTURATION';
      badgeClass = 'badge-gold';
      pmeScoreBar.style.background = '#d5bb76';
      recoHTML = `
        <div class="africa-specific-box">
          <h5><i class="fas fa-chart-line" style="color: var(--color-gold-primary);"></i> Leviers de Croissance & Bancarisation</h5>
          <p>Votre entreprise a de bonnes bases mais manque d'outils automatisés pour convaincre les banquiers et sécuriser sa rentabilité.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>NP-03 FINANCEREADY PME :</strong> Montage de votre dossier d'investissement bancable (Investment Memorandum).</li>
            <li><strong>NP-05 DIGITAL PME 360 :</strong> Automatisation de vos tableaux de bord de gestion sous Power BI / Python.</li>
            <li><strong>NP-07 ENERGY COST & ROI :</strong> Optimisation de votre facture énergétique (solaire / hybride).</li>
          </ul>
        </div>
      `;
    } else {
      pmeLevel = 'NEXUS PME SCORE : 🟢 GOUVERNANCE MAÎTRISÉE';
      badgeClass = 'badge-emerald';
      pmeScoreBar.style.background = '#10b981';
      recoHTML = `
        <div class="africa-specific-box" style="border-color: #10b981;">
          <h5><i class="fas fa-check-circle" style="color: #10b981;"></i> Excellence Opérationnelle & Expansion</h5>
          <p>Excellente maîtrise financière ! Votre PME est prête pour l'accélération et les partenariats stratégiques d'envergure.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1;">
            <li><strong>NP-06 GROWTH & RISK PME :</strong> Maîtrise des risques d'expansion et d'ouverture de nouveaux marchés.</li>
            <li><strong>Abonnement NEXUS PME CONTROL (Business/Premium) :</strong> Accompagnement stratégique continu par un CFO dédié.</li>
          </ul>
        </div>
      `;
    }

    pmeBadge.textContent = pmeLevel;
    pmeBadge.className = `badge ${badgeClass}`;
    pmeRecommendations.innerHTML = recoHTML;
    pmeResultBox.style.display = 'block';
  }
}

/* Helper FCFA Formatter */
function formatFCFA(val) {
  if (isNaN(val)) return '0 FCFA';
  return Math.round(val).toLocaleString('fr-FR') + ' FCFA';
}
