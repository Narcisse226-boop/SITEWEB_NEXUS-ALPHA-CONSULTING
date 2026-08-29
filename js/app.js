/**
 * NEXUS ALPHA CONSULTING - MAIN APPLICATION SCRIPT
 * Manages navigation, exhaustive pole modals, training filters, and interactive UI
 */

// Comprehensive Pole Content Database directly extracted from nexus_alpha_poles_detail.docx
const POLES_DATA = {
  1: {
    id: 1,
    number: "PÔLE 1",
    title: "Risque de marché",
    tagline: "Mesure · Quantification · Conformité réglementaire",
    icon: "fas fa-chart-line",
    accent: "#38bdf8",
    overview: "Le risque de marché désigne le risque de perte résultant des fluctuations des prix de marché : taux d'intérêt, taux de change, prix des actions, prix des matières premières. Ce pôle constitue le cœur technique de Nexus Alpha et s'adresse principalement aux banques commerciales, aux institutions financières et aux fonds d'investissement opérant en Afrique francophone (UEMOA / CEMAC). Dans le contexte réglementaire actuel (Bâle IV, FRTB, IRRBB), la maîtrise du risque de marché est devenue une obligation légale et un enjeu stratégique majeur.",
    sections: [
      {
        title: "1.1 — Mesure & quantification du risque de marché",
        items: [
          {
            subtitle: "Value at Risk (VaR)",
            desc: "Nexus Alpha déploie trois approches complémentaires : VaR paramétrique (variance-covariance rapide), VaR historique (sans hypothèse de distribution pour capturer les événements extrêmes), et VaR Monte Carlo (pour les produits non linéaires et structurés)."
          },
          {
            subtitle: "Expected Shortfall (CVaR - Bâle IV / FRTB)",
            desc: "Mesure de la perte moyenne au-delà du seuil de la VaR. C'est la métrique désormais exigée par le cadre FRTB (Fundamental Review of the Trading Book). Nous accompagnons les banques dans la transition vers l'ES pour leur trading book."
          },
          {
            subtitle: "Stress Testing & Scénarios adverses",
            desc: "Évaluation de la résistance à des chocs historiques (crise 2008, COVID-19, chocs pétroliers) et hypothétiques (dévaluation FCFA, remontée brutale des taux directeurs BCEAO, crise de dette souveraine)."
          }
        ],
        deliverables: [
          "Rapport VaR quotidien / hebdomadaire automatisé",
          "Modèle de calcul ES calibré sur données de marché locales",
          "Rapport de stress test avec cartographie des pertes par scénario",
          "Back-testing de la VaR (test de Kupiec, test de Christoffersen)",
          "Documentation technique réglementaire conforme Bâle IV / FRTB"
        ]
      },
      {
        title: "1.2 — Risque de liquidité (LCR & NSFR)",
        items: [
          {
            subtitle: "Ratios réglementaires LCR & NSFR",
            desc: "Calcul, suivi et optimisation du Liquidity Coverage Ratio (à 30 jours, seuil min 100%) et du Net Stable Funding Ratio (à 1 an) pour sécuriser la structure de financement."
          },
          {
            subtitle: "Gap de liquidité & Modélisation des flux",
            desc: "Construction des profils d'échéances contractuelles et comportementales, écoulement statistique des dépôts à vue sur données locales, et Plan de contingence liquidité (CFP)."
          }
        ],
        deliverables: [
          "Modèle de calcul LCR / NSFR automatisé sous Excel / Python",
          "Rapport de gap de liquidité mensuel avec courbes d'échéances",
          "Plan de contingence liquidité documenté",
          "Tableau de bord de suivi des indicateurs d'alerte précoce"
        ]
      },
      {
        title: "1.3 — Gestion Actif-Passif (ALM) & Risque de taux (IRRBB)",
        items: [
          {
            subtitle: "Sensibilité aux taux & Métriques clés",
            desc: "Duration, Duration modifiée, Convexité, DV01 (Dollar Value of 1 bp) et BPV pour la gestion des positions obligataires."
          },
          {
            subtitle: "Cadre IRRBB (Bâle IV)",
            desc: "Modélisation de l'EVE (Economic Value of Equity) et du NII (Net Interest Income) sur les 6 scénarios de choc réglementaires (parallèle, pentification, aplatissement, court terme, long terme)."
          },
          {
            subtitle: "Stratégies d'immunisation & Couverture",
            desc: "Alignement de la duration actif/passif et couverture par dérivés de taux (swaps de taux, FRA, caps et floors)."
          }
        ],
        deliverables: [
          "Modèle ALM complet (bilan, duration, gaps de taux)",
          "Rapport IRRBB conforme Bâle IV (EVE + NII, 6 scénarios)",
          "Stratégie de couverture documentée avec scénarios comparatifs",
          "Tableau de bord ALM mensuel pour le Comité des Risques"
        ]
      },
      {
        title: "1.4 — Risque de change (FX) & Matières premières",
        items: [
          {
            subtitle: "Quantification FX & Couverture",
            desc: "Position de change nette par devise, VaR de change, Forwards, swaps et options de change pour entreprises et banques exposées aux devises africaines, Euro et Dollar."
          },
          {
            subtitle: "Commodités clés d'Afrique",
            desc: "Modélisation des cours du cacao, café, or, pétrole et coton. Corrélations matières premières / devises africaines et couverture pour importateurs/exportateurs."
          }
        ],
        deliverables: [
          "Rapport de position de change nette consolidée",
          "Modèle VaR de change automatisé",
          "Stratégie de couverture FX avec backtesting de performance",
          "Analyse de sensibilité prix matières premières / impact P&L"
        ]
      }
    ],
    regulations: "Bâle IV / FRTB, IRRBB (Bâle), Normes Prudentielles BCEAO / COBAC, IFRS 7",
    clientTargets: "Banques commerciales, Banques d'affaires, Fonds d'investissement, Trésoreries de grands groupes corporates"
  },

  2: {
    id: 2,
    number: "PÔLE 2",
    title: "Risque de crédit",
    tagline: "Modélisation · Scoring · Conformité IFRS 9 & Bâle",
    icon: "fas fa-shield-alt",
    accent: "#d5bb76",
    overview: "Le risque de crédit est historiquement le premier risque pour les institutions financières africaines face à des taux de créances douteuses (NPL) élevés et une asymétrie d'information sur les emprunteurs. Nexus Alpha apporte une approche quantitative rigoureuse, calibrée sur les réalités des marchés locaux, pour aider les banques, institutions de microfinance (IMF) et assureurs-crédits à prévoir, tarifer et provisionner ce risque.",
    sections: [
      {
        title: "2.1 — Modèles PD / LGD / EAD (Composantes du risque de crédit)",
        items: [
          {
            subtitle: "PD (Probabilité de Défaut)",
            desc: "Modèles de régression logistique, modèles de survie (Cox, Kaplan-Meier), matrices de transition (AAA à D) calibrées sur données locales UEMOA/CEMAC, validées par Gini, AUC-ROC, KS et PSI."
          },
          {
            subtitle: "LGD (Perte en Cas de Défaut)",
            desc: "Estimation basée sur les flux réels de recouvrement historiques, segmentation par garanties (hypothèques, nantissements, cautions) et Downturn LGD pour l'approche IRB avancée."
          },
          {
            subtitle: "EAD (Exposition au Moment du Défaut)",
            desc: "Facteurs de conversion de crédit (CCF) pour les engagements hors-bilan, modélisation des tirages additionnels et SA-CCR pour les dérivés."
          }
        ],
        deliverables: [
          "Modèles statistiques documentés et validés (Python / R)",
          "Rapport de performance des modèles (Gini, AUC, KS, PSI)",
          "Matrices de transition et courbes de survie par segment",
          "Documentation IRB conforme Bâle IV pour soumission au régulateur",
          "Plan de recalibration annuelle des paramètres"
        ]
      },
      {
        title: "2.2 — Systèmes de scoring & Notation interne",
        items: [
          {
            subtitle: "Scoring d'octroi (Application Scoring)",
            desc: "Scorecards sur mesure pour décider de l'octroi de crédit (décision binaire + score) combinant ratios financiers, historique KYC et algorithmes Machine Learning (XGBoost)."
          },
          {
            subtitle: "Scoring comportemental & Recouvrement",
            desc: "Signaux d'alerte précoce (early warning indicators) pour les clients existants et segmentation prédictive des dossiers en recouvrement selon la probabilité de récupération."
          },
          {
            subtitle: "Notation interne Corporate",
            desc: "Grille de notation de AAA à D combinant analyse quantitative bilantielle et critères qualitatifs sectoriels/managériaux."
          }
        ],
        deliverables: [
          "Grilles de score d'octroi et comportemental paramétrées",
          "Documentation méthodologique et seuils de coupure (cut-off)",
          "Manuel de notation pour analystes crédit et chargés d'affaires"
        ]
      },
      {
        title: "2.3 — Provisionnement IFRS 9 & ECL (Expected Credit Loss)",
        items: [
          {
            subtitle: "Les 3 étapes IFRS 9",
            desc: "Stage 1 (ECL à 12 mois), Stage 2 (ECL durée de vie pour dégradation significative du risque - SICR), Stage 3 (Défaut avéré avec provision sur valeur nette)."
          },
          {
            subtitle: "Approche Forward-Looking & Macroéconomie",
            desc: "Modélisation prospective intégrant PIB, inflation et taux directeurs BCEAO selon 3 scénarios (optimiste, central, pessimiste) pour un calcul dynamique des provisions."
          }
        ],
        deliverables: [
          "Modèle de calcul ECL complet (Excel / Python) par portefeuille",
          "Rapport de staging avec justification des transferts entre étapes",
          "Intégration des scénarios macro-économiques et tests de sensibilité",
          "Dossier de documentation pour commissaires aux comptes et régulateurs"
        ]
      },
      {
        title: "2.4 — Risque de contrepartie (CCR) & XVA",
        items: [
          {
            subtitle: "Mesures d'exposition & XVA",
            desc: "MtM, PFE (percentile 95%), EPE, CVA (Credit Valuation Adjustment), DVA, FVA, MVA, accords de netting ISDA et collatéral CSA sous cadre Bâle IV SA-CCR."
          }
        ],
        deliverables: [
          "Modèle de calcul d'exposition CCR et ajustements XVA",
          "Calcul du capital réglementaire SA-CCR"
        ]
      }
    ],
    regulations: "Bâle IV (IRB, Standard), IFRS 9 (ECL), Directives prudentielles BCEAO / COBAC",
    clientTargets: "Banques de détail, Banques Corporate, Institutions de Microfinance (IMF), Assurances-crédit"
  },

  3: {
    id: 3,
    number: "PÔLE 3",
    title: "Risque opérationnel & ESG",
    tagline: "Cartographie · Quantification · Durabilité",
    icon: "fas fa-leaf",
    accent: "#10b981",
    overview: "Le risque opérationnel (fraude, pannes informatiques, non-conformité, cyber-risques) et les risques ESG/climatiques représentent le nouveau front de la résilience bancaire en Afrique. Sous la pression des régulateurs régionaux (BCEAO, COBAC) et des bailleurs internationaux (BAD, IFC, Banque Mondiale), les institutions doivent quantifier ces risques et aligner leurs portefeuilles sur les standards TCFD et CSRD.",
    sections: [
      {
        title: "3.1 — Cartographie & gestion du risque opérationnel",
        items: [
          {
            subtitle: "Cartographie & Heatmap des risques",
            desc: "Ateliers de collecte par processus métier, taxonomie Bâle IV (7 catégories), évaluation fréquence × sévérité et matrice risques-contrôles."
          },
          {
            subtitle: "Base d'incidents & Quantification (SA-OR / LDA)",
            desc: "Collecte des pertes et quasi-pertes, Root Cause Analysis, approche standard Bâle IV SA-OR (Business Indicator) et simulations Monte Carlo (Loss Distribution Approach)."
          }
        ],
        deliverables: [
          "Cartographie complète des risques opérationnels (heatmap + registre)",
          "Base de données des incidents opérationnels et rapport d'analyse",
          "Calcul du capital réglementaire SA-OR (Bâle IV)",
          "Plan d'action de réduction des risques prioritaires"
        ]
      },
      {
        title: "3.2 — Plan de continuité d'activité (PCA / BCP)",
        items: [
          {
            subtitle: "Résilience & Continuité Opérationnelle",
            desc: "Business Impact Analysis (BIA), définition des délais critiques RTO/RPO, scénarios de crise (pannes IT, cyber-attaques, inondations, crises sociales) et tests de simulation."
          }
        ],
        deliverables: [
          "Dossier complet PCA conforme aux exigences BCEAO/COBAC",
          "Fiches réflexes de gestion de crise et planning de tests annuels"
        ]
      },
      {
        title: "3.3 — Risque ESG & Transition climatique",
        items: [
          {
            subtitle: "Risques climatiques physiques & de transition",
            desc: "Cartographie de l'exposition géographique aux aléas (sécheresse, inondations), stress tests climatiques (scénarios GIEC / NGFS) et analyse des secteurs exposés à la transition (mines, pétrole, agro-industrie)."
          },
          {
            subtitle: "Scoring ESG & Reporting TCFD / CSRD",
            desc: "Construction d'une scorecard ESG multicritère pour les contreparties corporate, calcul du Green Asset Ratio (GAR) et alignement sur la TCFD."
          }
        ],
        deliverables: [
          "Rapport d'exposition du portefeuille aux risques climatiques",
          "Stress tests climatiques documentés (scénarios GIEC / NGFS)",
          "Scorecard ESG pour les contreparties corporate",
          "Rapport de conformité TCFD et feuille de route d'intégration"
        ]
      }
    ],
    regulations: "Bâle IV (SA-OR), Cadre TCFD, Réglementations CSRD, Directives RSE / Climat BCEAO",
    clientTargets: "Toutes banques commerciales, Établissements de crédit, Assurances, Bailleurs de fonds"
  },

  4: {
    id: 4,
    number: "PÔLE 4",
    title: "Validation de modèles (MRM)",
    tagline: "Audit · Back-testing · Gouvernance des modèles",
    icon: "fas fa-check-double",
    accent: "#a855f7",
    overview: "Le Model Risk Management (MRM) est devenu vital en Afrique francophone : de nombreuses institutions utilisent des modèles importés de maisons mères européennes, non calibrés sur les comportements et cycles économiques locaux. Nexus Alpha assure la revue indépendante, le back-testing rigoureux et la gouvernance complète de vos modèles conformément aux standards internationaux SR 11-7 (Fed) et guides BCE.",
    sections: [
      {
        title: "4.1 — Inventaire & classification des modèles",
        items: [
          {
            subtitle: "Recensement exhaustif & Cartographie",
            desc: "Fiche d'identité de chaque modèle (crédit, marché, ALM, pricing, IFRS 9, capital), matrice de criticité (impact × complexité) et calendrier priorisé de validation."
          }
        ],
        deliverables: [
          "Inventaire centralisé des modèles (Model Inventory)",
          "Matrice de criticité et politique de gouvernance MRM"
        ]
      },
      {
        title: "4.2 — Processus de validation indépendante (5 Étapes)",
        items: [
          {
            subtitle: "1. Revue conceptuelle & 2. Revue des données",
            desc: "Vérification des hypothèses théoriques, pertinence mathématique, complétude des données, traitement des outliers et calcul du Population Stability Index (PSI)."
          },
          {
            subtitle: "3. Tests de performance & 4. Back-testing",
            desc: "Pouvoir discriminant (AUC-ROC, Gini, KS), calibration (Hosmer-Lemeshow), tests de Kupiec et Christoffersen pour la VaR, analyse des écarts prédictions vs réalisations."
          },
          {
            subtitle: "5. Rapport d'audit & Avis formel",
            desc: "Avis formel d'expert indépendant : approuvé sans réserve / sous conditions / à recalibrer / à retirer."
          }
        ],
        deliverables: [
          "Rapport de validation complet (50–100 pages par modèle)",
          "Synthèse exécutive pour le Conseil d'Administration et Comité des Risques",
          "Base de suivi des recommandations et plan de remédiation",
          "Avis de validation formel signé pour régulateurs et auditeurs"
        ]
      },
      {
        title: "4.3 — Monitoring continu & Retainer MRM",
        items: [
          {
            subtitle: "Surveillance continue en retainer mensuel",
            desc: "Suivi mensuel des KPI (dérive PSI, baisse d'AUC), alertes automatiques en cas de dégradation et rapport trimestriel pour le Comité des Risques."
          }
        ],
        deliverables: [
          "Tableau de bord de monitoring continu des modèles",
          "Rapport trimestriel d'alerte et de performance"
        ]
      }
    ],
    regulations: "Standard SR 11-7 (Federal Reserve), Guides de validation BCE, Normes d'audit BCEAO/COBAC",
    clientTargets: "Banques filiales de groupes internationaux, Banques régionales, Compagnies d'assurance"
  },

  5: {
    id: 5,
    number: "PÔLE 5",
    title: "Data science appliquée",
    tagline: "Machine Learning · Modélisation · Intelligence décisionnelle",
    icon: "fas fa-brain",
    accent: "#06b6d4",
    overview: "En Afrique francophone, face à la rareté relative des historiques de crédit formels, les données alternatives (Mobile Money, télécoms, e-commerce, imagerie satellite) constituent une opportunité unique. Nexus Alpha déploie des algorithmes d'intelligence artificielle de pointe (XGBoost, LightGBM, Deep Learning) avec une exigence absolue d'explicabilité (XAI - SHAP/LIME) et d'intégration dans les systèmes core banking.",
    sections: [
      {
        title: "5.1 — Modèles de Machine Learning pour le risque",
        items: [
          {
            subtitle: "Algorithmes déployés",
            desc: "Régression logistique régularisée, Random Forests, Gradient Boosting (XGBoost, LightGBM), Deep Learning et séries temporelles (ARIMA, Prophet, LSTM)."
          },
          {
            subtitle: "Applications concrètes",
            desc: "Scoring crédit alternatif Mobile Money (Orange Money, MTN MoMo, Wave), détection de fraude en temps réel, prévision d'attrition (churn) et anticipation des NPL à 3–6 mois."
          },
          {
            subtitle: "Explicabilité des modèles (XAI)",
            desc: "Conformité avec les exigences d'auditabilité : valeurs SHAP (contribution de chaque variable), LIME et graphiques de dépendance partielle (PDP)."
          }
        ],
        deliverables: [
          "Modèle ML documenté, testé, validé et mis en production",
          "Module d'explicabilité XAI (SHAP/LIME) pour les comités de crédit",
          "Scorecard alternative Mobile Money & Télécoms"
        ]
      },
      {
        title: "5.2 — Data engineering & Architecture des données",
        items: [
          {
            subtitle: "Audit de qualité & Pipelines ETL",
            desc: "Diagnostic de complétude et fraîcheur, standardisation des référentiels, automatisation des flux ETL connectés aux core banking (T24, Amplitude, Flexcube) et datawarehouses."
          }
        ],
        deliverables: [
          "Pipeline de données automatisé et auditable",
          "Dossier d'architecture data et dictionnaire des variables"
        ]
      },
      {
        title: "5.3 — Tableaux de bord & Reporting décisionnel",
        items: [
          {
            subtitle: "Dashboards Direction & Opérationnel",
            desc: "Tableaux de bord interactifs Power BI / Tableau / Streamlit (suivi NPL, coût du risque, CAR, alerte franchissement Stage 2) et automatisation des reportings BCEAO/BEAC/COREP."
          }
        ],
        deliverables: [
          "Dashboard interactif Power BI / Streamlit",
          "Générateur automatisé des états réglementaires BCEAO / BEAC",
          "Manuel utilisateur et formation des équipes internes"
        ]
      }
    ],
    regulations: "Standards d'éthique et gouvernance IA, Normes de reporting prudentiel BCEAO / BEAC",
    clientTargets: "Banques digitales, Fintechs, Opérateurs Mobile Money, Banques universelles, Microfinance"
  },

  6: {
    id: 6,
    number: "PÔLE 6",
    title: "Conseil stratégique, Formations & Solutions PME",
    tagline: "Gouvernance · Stratégie · Transfert · Pilotage PME/PMI",
    icon: "fas fa-graduation-cap",
    accent: "#f59e0b",
    overview: "Nexus Alpha comble le déficit structurel de compétences quantitatives en Afrique francophone en combinant conseil stratégique de haut niveau auprès des Conseils d'Administration, programmes de formation d'excellence et la gamme de solutions dédiées NEXUS PME 2026. Notre mission est d'assurer l'autonomie, la rentabilité et la souveraineté technique de vos institutions et entreprises.",
    sections: [
      {
        title: "6.1 — Conseil en stratégie de gestion des risques (Grandes Institutions)",
        items: [
          {
            subtitle: "Diagnostic de maturité (Maturity Assessment)",
            desc: "Évaluation complète du dispositif de risque, benchmark avec les meilleures pratiques régionales et internationales, et feuille de route priorisée."
          },
          {
            subtitle: "Définition formelle de l'appétit au risque (Risk Appetite)",
            desc: "Accompagnement du Conseil d'Administration dans la formalisation des métriques (VaR limite, NPL cible, CAR minimum) et cascade des limites opérationnelles."
          },
          {
            subtitle: "Gouvernance & 3 Lignes de défense",
            desc: "Structuration organisationnelle de la Direction des Risques, politiques internes, charte du Comité des Risques et accompagnement lors des inspections BCEAO/COBAC/CRCA."
          }
        ],
        deliverables: [
          "Rapport de diagnostic du dispositif de risque (Maturity Assessment)",
          "Charte d'appétit au risque avec métriques et limites opérationnelles",
          "Politique générale de gestion des risques (crédit, marché, op, liquidité)",
          "Dossier de préparation aux missions d'inspection des régulateurs"
        ]
      },
      {
        title: "6.2 — Solutions NEXUS PME 2026 (Pilotage & Transformation PME/PMI)",
        items: [
          {
            subtitle: "NP-01 : DIAGNOSTIC PME 360 (Dès 150 000 FCFA | 3-5j)",
            desc: "Score NEXUS PME SCORE™ /100, cartographie des vulnérabilités (Finance, Cash, Risques, Data, Croissance, Énergie) et Roadmap 90 jours."
          },
          {
            subtitle: "NP-02 : CASHCONTROL PME (350k à 750k FCFA)",
            desc: "Reprendre le contrôle de la trésorerie, modèle prévisionnel Cash-Flow 13 semaines, optimisation du BFR et plan de recouvrement."
          },
          {
            subtitle: "NP-03 : FINANCEREADY PME (750k à 1,5M FCFA)",
            desc: "Préparation d'un dossier bancable et attractif : projections financières 3-5 ans, modélisation de la CAF, Investment & Financing Memorandum."
          },
          {
            subtitle: "NP-04 : NEXUS CFO LIGHT (500k à 1M FCFA/mois)",
            desc: "Direction Financière externalisée sur mesure : tableau de bord mensuel, suivi des marges/BFR et comités de pilotage stratégique."
          },
          {
            subtitle: "NP-05 : DIGITAL PME 360 (750k à 2,5M FCFA)",
            desc: "Automatisation du pilotage : transition d'Excel dispersé vers Power BI / Python / SQL avec dashboards décisionnels automatisés."
          },
          {
            subtitle: "NP-06 : GROWTH & RISK PME (1M à 2,5M FCFA)",
            desc: "Sécurisation de la croissance, évaluation des 4 risques majeurs (financiers, commerciaux, opérationnels, stratégiques), NEXUS PME RISK SCORE™."
          },
          {
            subtitle: "NP-07 : ENERGY COST & ROI (750k à 1,5M FCFA)",
            desc: "Audit de la facture énergétique et rentabilité financière (Réseau vs Groupe vs Solaire vs Hybride, VAN, TRI, ROI), Energy Investment Business Case."
          },
          {
            subtitle: "Pack Clé en Main : PERFORMANCE 360 (2,5M à 4,5M FCFA)",
            desc: "Offre intégrée complète combinant Diagnostic 360 + CashControl 13 sem. + FinanceReady + Risk Assessment + Dashboard + 3 mois de suivi personnalisé."
          }
        ],
        deliverables: [
          "Rapport de diagnostic NEXUS PME SCORE™ /100 et Roadmap 90 jours",
          "Tableau de bord prévisionnel de Cash-Flow 13 semaines",
          "Investment & Financing Memorandum pour banques et investisseurs",
          "Dashboard Power BI / Python connecté à vos sources de données",
          "Energy Investment Business Case pour investissements solaires/hybrides"
        ]
      },
      {
        title: "6.3 — Catalogue des Formations Certifiantes & Tarifs",
        items: [
          {
            subtitle: "Les 7 Programmes d'Excellence (Tarifs indicatifs)",
            desc: "• Fondamentaux du risque bancaire (2j) : 3M–5M FCFA/groupe<br>• Bâle IV & IFRS 9 en pratique (3j) : 5M–8M FCFA/groupe<br>• Scoring crédit & Machine Learning (3j) : 5M–9M FCFA/groupe<br>• Python appliqué à la finance (4j) : 6M–10M FCFA/groupe<br>• Préparation FRM (Financial Risk Manager) (8 sem) : 1M–2M FCFA/pers.<br>• Gestion ALM & risque de taux (2j) : 3M–6M FCFA/groupe<br>• ESG & risque climatique (1j) : 2M–4M FCFA/groupe"
          },
          {
            subtitle: "Modalités pédagogiques",
            desc: "Présentiel intra-entreprise (sur mesure sur site client), Présentiel inter-entreprises, Distanciel synchrone, E-learning asynchrone et Coaching individuel de directeurs des risques / candidats FRM."
          }
        ],
        deliverables: [
          "Supports de cours détaillés, codes sources et études de cas africaines",
          "Attestations de réussite et certificats de formation Nexus Alpha",
          "Rapport d'évaluation des compétences acquises"
        ]
      }
    ],
    regulations: "Directives de gouvernance BCEAO / COBAC, Standards GARP (FRM), Normes OHADA & PME",
    clientTargets: "Directions Générales, Conseils d'Administration, PME/PMI (Agro-industrie, BTP, Commerce, Industrie, Services), Quants"
  }
};

/* --------------------------------------------------------------------------
   ANALYTICS & CRO TRACKING MODULE
   -------------------------------------------------------------------------- */
window.NexusAnalytics = {
  trackEvent: function(eventName, eventParams = {}) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      event: eventName,
      timestamp: timestamp,
      ...eventParams
    };

    // 1. Console Log in development/audit mode
    console.log(`%c[NEXUS ANALYTICS]%c ${eventName}`, 'background: #d5bb76; color: #070d18; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: #38bdf8; font-weight: bold;', eventPayload);

    // 2. Dispatch custom DOM event
    window.dispatchEvent(new CustomEvent('nexus_track', { detail: eventPayload }));

    // 3. Google Analytics / DataLayer Bridge if present
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventPayload);
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  }
};

/* --------------------------------------------------------------------------
   INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initScrollAnimations();
  initPoleModals();
  initPoleFilters();
  initTrainingFilters();
  initQuantTabNav();
  initContactForm();
  initBackToTop();
  initStickyMobileCTA();
  initNeedSelectCTAs();
  initAnalyticsTracking();
  
  // Track landing view
  window.NexusAnalytics.trackEvent('visite_page_accueil', {
    url: window.location.href,
    referrer: document.referrer
  });
});

function initAnalyticsTracking() {
  document.querySelectorAll('[data-analytics-event]').forEach(el => {
    el.addEventListener('click', () => {
      const eventName = el.dataset.analyticsEvent;
      if (eventName && window.NexusAnalytics) {
        window.NexusAnalytics.trackEvent(eventName, {
          href: el.getAttribute('href') || '',
          text: el.innerText.trim().substring(0, 50)
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   NAVBAR & SCROLL EFFECTS
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active link update
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   MOBILE MENU DRAWER
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links .nav-link');

  if (!openBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* --------------------------------------------------------------------------
   SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-fade-up');
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animatedElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   POLE MODAL DRAWER SYSTEM (EXHAUSTIVE DETAILS)
   -------------------------------------------------------------------------- */
function initPoleModals() {
  const modalOverlay = document.getElementById('pole-modal-overlay');
  const modalTitle = document.getElementById('modal-pole-title');
  const modalTagline = document.getElementById('modal-pole-tagline');
  const modalIcon = document.getElementById('modal-pole-icon');
  const modalBody = document.getElementById('modal-pole-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCtaBtn = document.getElementById('modal-cta-btn');

  if (!modalOverlay) return;

  // Open modal trigger
  document.querySelectorAll('.open-pole-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const poleId = btn.dataset.poleId;
      openPoleModal(poleId);
    });
  });

  function openPoleModal(poleId) {
    const data = POLES_DATA[poleId];
    if (!data) return;

    modalTitle.textContent = `${data.number} — ${data.title}`;
    modalTagline.textContent = data.tagline;
    modalIcon.innerHTML = `<i class="${data.icon}"></i>`;
    modalIcon.style.color = data.accent;

    if (modalCtaBtn) {
      modalCtaBtn.setAttribute('href', `#contact`);
      modalCtaBtn.onclick = () => {
        if (window.NexusAnalytics) {
          window.NexusAnalytics.trackEvent('clic_pole_modal_cta', { poleId: data.id, poleTitle: data.title });
        }
        closePoleModal();
        const poleSelect = document.getElementById('contact-pole-select');
        if (poleSelect) poleSelect.value = data.id;
        const msgElem = document.getElementById('contact-message');
        if (msgElem && (!msgElem.value || msgElem.value.indexOf('Pôle') !== -1)) {
          msgElem.value = `Bonjour, suite à la consultation de la fiche détaillée ${data.number} (${data.title}), je souhaite échanger avec un expert associé de Nexus Alpha Consulting sur les modalités d'une mission d'accompagnement.`;
        }
      };
    }

    // Build modal body HTML
    let html = `
      <div class="modal-section-block">
        <p class="modal-text" style="font-size: 1.05rem; color: #ffffff; line-height: 1.75;">
          ${data.overview}
        </p>
      </div>
    `;

    // Add sub-sections
    data.sections.forEach(sec => {
      html += `
        <div class="modal-section-block">
          <h4 class="modal-section-title"><i class="fas fa-layer-group" style="color: ${data.accent};"></i> ${sec.title}</h4>
          <div class="modal-subgrid">
      `;
      sec.items.forEach(item => {
        html += `
          <div class="modal-subcard">
            <h5><i class="fas fa-angle-right" style="color: ${data.accent};"></i> ${item.subtitle}</h5>
            <p>${item.desc}</p>
          </div>
        `;
      });
      html += `</div>`;

      if (sec.deliverables && sec.deliverables.length > 0) {
        html += `
          <div class="deliverables-box">
            <h5><i class="fas fa-clipboard-check"></i> Livrables & Démarche Technique Associés</h5>
            <ul class="deliverables-list">
              ${sec.deliverables.map(del => `<li><i class="fas fa-check-circle"></i> <span>${del}</span></li>`).join('')}
            </ul>
          </div>
        `;
      }

      html += `</div>`;
    });

    // Regulatory & Targets footer info
    html += `
      <div class="africa-specific-box">
        <h5><i class="fas fa-landmark"></i> Cadre Réglementaire & Cibles de Mission</h5>
        <p><strong>Normes & Superviseurs :</strong> ${data.regulations}</p>
        <p style="margin-top: 0.35rem;"><strong>Clients Prioritaires :</strong> ${data.clientTargets}</p>
      </div>
    `;

    modalBody.innerHTML = html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePoleModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closePoleModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closePoleModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closePoleModal();
    }
  });
}

/* --------------------------------------------------------------------------
   POLE CARDS FILTER
   -------------------------------------------------------------------------- */
function initPoleFilters() {
  const filterBtns = document.querySelectorAll('.pole-filter-btn');
  const poleCards = document.querySelectorAll('.pole-card-wrapper');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      poleCards.forEach(wrapper => {
        if (filter === 'all' || wrapper.dataset.category.includes(filter)) {
          wrapper.style.display = 'block';
        } else {
          wrapper.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   TRAINING CATALOGUE FILTER
   -------------------------------------------------------------------------- */
function initTrainingFilters() {
  const filterBtns = document.querySelectorAll('.training-filter-btn');
  const trainingCards = document.querySelectorAll('.training-card-wrapper');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;

      trainingCards.forEach(card => {
        if (target === 'all' || card.dataset.targetGroup.includes(target)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   QUANT LAB TAB SWITCHER
   -------------------------------------------------------------------------- */
function initQuantTabNav() {
  const tabBtns = document.querySelectorAll('.quant-tab-btn');
  const tabPanels = document.querySelectorAll('.quant-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tabTarget);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   CONTACT FORM SUBMISSION & QUALIFICATION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('consulting-contact-form');
  const toast = document.getElementById('form-toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    const contactData = {
      name: document.getElementById('contact-name')?.value || '',
      email: document.getElementById('contact-email')?.value || '',
      phone: document.getElementById('contact-phone')?.value || '',
      company: document.getElementById('contact-inst')?.value || '',
      type: document.getElementById('contact-type')?.value || '',
      need: document.getElementById('contact-pole-select')?.value || '',
      sector: document.getElementById('contact-sector')?.value || '',
      messageLength: document.getElementById('contact-message')?.value?.length || 0
    };

    if (window.NexusAnalytics) {
      window.NexusAnalytics.trackEvent('formulaire_contact_envoye', contactData);
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Transmission en cours...`;

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-check"></i> Demande transmise avec succès !`;
      btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      btn.style.color = '#ffffff';

      // Show toast
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
      }

      form.reset();

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 4000);
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   NEED-SELECT CTAS (PRE-SELECT FORM DROPDOWN & CONTEXT)
   -------------------------------------------------------------------------- */
function initNeedSelectCTAs() {
  document.querySelectorAll('[data-select-need]').forEach(btn => {
    btn.addEventListener('click', () => {
      const needValue = btn.dataset.selectNeed;
      const needContext = btn.dataset.needContext || '';
      const eventName = btn.dataset.analyticsEvent || 'clic_cta_commercial';

      if (window.NexusAnalytics) {
        window.NexusAnalytics.trackEvent(eventName, { need: needValue, context: needContext });
      }

      const selectElem = document.getElementById('contact-pole-select');
      if (selectElem && needValue) {
        selectElem.value = needValue;
      }

      if (needContext) {
        const msgElem = document.getElementById('contact-message');
        if (msgElem && (!msgElem.value || msgElem.value.length < 20)) {
          msgElem.value = needContext;
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   STICKY MOBILE CTA BAR
   -------------------------------------------------------------------------- */
function initStickyMobileCTA() {
  const stickyBar = document.getElementById('mobile-sticky-cta');
  if (!stickyBar) return;

  window.addEventListener('scroll', () => {
    // Show sticky CTA after scrolling past hero (350px) and hide near contact section
    const contactSec = document.getElementById('contact');
    const contactTop = contactSec ? contactSec.offsetTop - 500 : 999999;
    
    if (window.scrollY > 350 && window.scrollY < contactTop) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  });

  const stickyBtn = stickyBar.querySelector('a');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', () => {
      if (window.NexusAnalytics) {
        window.NexusAnalytics.trackEvent('clic_sticky_mobile_cta');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

