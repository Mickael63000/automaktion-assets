(function () {
  if (window.AMK_CATALOG_INITED) return;
  window.AMK_CATALOG_INITED = true;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sanitizeQuery(v) {
    return String(v || "").replace(/\u00A0/g, " ").trim().toLowerCase();
  }

  function normalizeEta(raw) {
    if (!raw) return "";
    return String(raw).trim()
      .replace(/mise en place\s*:\s*/i, "")
      .replace(/livraison\s*:\s*/i, "")
      .replace(/délai\s*:\s*/i, "")
      .trim();
  }

  function normKey(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function etaClass(tag) {
    var t = String(tag || "").toLowerCase();
    if (t.indexOf("sur-mesure") !== -1 || t.indexOf("nouveau") !== -1 || t.indexOf("data") !== -1) return "amk-eta amk-etaViolet";
    return "amk-eta";
  }

  var CLOCK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="13" r="8"></circle>' +
      '<path d="M12 13V9"></path>' +
      '<path d="M12 13l3 2"></path>' +
      '<path d="M9 2h6"></path>' +
    '</svg>';

  // ===== DATA =====
  var FICHE_DETAILS = {
    "mini catalogue de promotion": {
      segment: "Acquisition / Prospection",
      pitch: "Pour donner envie. Présentez d’une manière professionnelle les modèles que vous souhaitez déstocker. Un formulaire simple, intégrant une photo, une offre attrayante et hop ! Le lead est pris.",
      delais: ["1 semaine"],
      temporalite: "Épuisement du stock",
      temoignage: "Nous utilisons ce mini catalogue régulièrement, il permet de communiquer différemment qu’avec une traditionnelle pub… Les clients se positionnent sur leur souhait puis nous prenons RDV. Simple, efficace."
    },
    "prise de rdv operation commerciale": {
      segment: "Commerce",
      pitch: "Pour vendre plus. Une action qui remplit les agendas : les clients prennent eux-mêmes RDV avec vous (comme Doctolib).",
      delais: ["72h", "1 semaine"],
      cible: ["Crée des fichiers de relance pertinents"],
      canaux: ["Client / Prospect (plus “chaud” qu’un simple lead)"]
    },
    "invitation a l essai rdv atelier": {
      segment: "Fidélisation / Prospection",
      pitch: "Pour se rappeler qu’un client SAV fut et sera un client commerce. Profitez des flux atelier pour alimenter les agendas de vos vendeurs / product genius.",
      delais: ["3 semaines"],
      temporalite: "Perpétuelle",
      cible: ["Rencontrer de nouveaux clients", "Client / Prospect"],
      temoignage: "À chaque fois que nous nous rendons chez notre concessionnaire, on rentre et on ressort sans avoir eu la possibilité d’échanger avec quelqu’un concernant nos besoins."
    },
    "rdv en ligne pour livraison vn vo": {
      segment: "Experience Client",
      pitch: "Pour livrer plus vite : informez le client de la mise à disposition et proposez les prochaines plages de disponibilité du secrétariat livraison.",
      delais: ["2 semaines"],
      temporalite: "Perpétuelle",
      cible: ["Client en full autonomie", "Implique l’équipe de préparation", "Client / Prospect"],
      temoignage: "Cette campagne aide nos secrétaires qui doivent livrer et prendre des RDV en même temps. Les clients ne sont parfois pas disponibles en pleine journée."
    },
    "pop up sur site web": {
      segment: "Experience Client",
      pitch: "Le pop-up permet de tirer profit du trafic de vos pages web en faisant de l’acquisition de contacts… Gratuit et sans effort.",
      delais: ["24h"],
      temporalite: "Perpétuelle",
      cible: ["Possibilité de nurturing (gros volume)", "Client / Prospect"],
      chiffres: ["> 1000 leads"],
      temoignage: "Face au volume conséquent généré, une étape de nurturing intermédiaire augmente considérablement la qualification des leads envoyés aux commerciaux ainsi que leur motivation à les traiter."
    },
    "remerciement de commande": {
      segment: "Experience Client",
      pitch: "Remerciez chaque client qui achète : prouve votre reconnaissance et l’engage dans son parcours client.",
      delais: ["48h"],
      temporalite: "Perpétuelle",
      cible: ["100% automatique", "Client / Prospect"],
      temoignage: "Cette campagne permet d’acter la reconnaissance que nos clients attendent, de manière fiable et durable."
    },
    "remerciement apres essai routier": {
      segment: "Experience Client",
      pitch: "Remerciez votre prospect venu essayer un véhicule sans l’acheter… la concurrence ne le fait pas.",
      delais: ["48h"],
      temporalite: "Perpétuelle"
    },
    "test d electro compatibilite": {
      segment: "Acquisition / Prospection",
      pitch: "Un test qui aide l’automobiliste à savoir si son usage est compatible avec l’électrique. Une façon intelligente de générer des leads.",
      delais: ["48h"],
      temporalite: "Perpétuelle",
      cible: ["Ludique", "Client / Prospect"],
      temoignage: "Nous avons personnalisé les questions posées afin d’affiner les réponses rendues dans le but de générer des leads chauds."
    },
    "offre de reprise 30 mois apres livraison": {
      segment: "Experience Client",
      pitch: "Une relance systématique 30 mois après la livraison avec comme prétexte une offre de rachat du véhicule.",
      delais: ["1 semaine"],
      temporalite: "Perpétuelle",
      temoignage: "Cette action programmée dès la vente assure le maintien du contact, on ne s’occupe de rien, et on génère nos propres leads."
    }
  };

  var CAMPAIGN_IMG = {
    "3MT2": "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=60",
    "3MT8": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60",
    "3MT3": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=60",
    "3MT5": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=60",
    "3MT6": "https://images.unsplash.com/photo-1550041473-d296a3a8a18a?auto=format&fit=crop&w=1200&q=60",
    "3MP5": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=60",
    "3MP2": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=60",
    "3MP1": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60",
    "3MP9": "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=60",
    "3MP8": "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=60",
    "3ME6": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
    "3ME7": "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60",
    "3ME1": "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=1200&q=60",
    "3MT7": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=60"
  };

  var PRODUCTS = [
    { id:"AMK-PACK-START", rail:"recommended", title:"Pack Starter Leads",
      desc:"Capture + qualification automatique des leads, suivi simple et efficace.",
      price:"À partir de 490€ / mois", tag:"Top vente", eta:"Mise en place: 7 jours",
      badges:["CRM","Formulaire","Relances","Reporting"],
      img:"https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=60"
    },
    { id:"AMK-PACK-PRO", rail:"recommended", title:"Pack Pro Conversion",
      desc:"Nurturing + scoring + relances multi-canal pour maximiser le taux de closing.",
      price:"À partir de 990€ / mois", tag:"ROI", eta:"Mise en place: 14 jours",
      badges:["Email","SMS","Scoring","A/B tests"],
      img:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=60"
    },
    { id:"AMK-PACK-ENTERPRISE", rail:"recommended", title:"Pack Enterprise",
      desc:"Automatisation avancée + intégrations + dashboards sur mesure.",
      price:"Sur devis", tag:"Sur-mesure", eta:"Mise en place: 3–6 semaines",
      badges:["API","SSO","BI","Intégrations"],
      img:"https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=60"
    },

    { id:"AMK-SVC-ADS", rail:"services", title:"Acquisition (Ads)",
      desc:"Campagnes orientées leads et mesure du coût par opportunité.",
      price:"À partir de 600€ / mois", tag:"Performance", eta:"Démarrage: 72h",
      badges:["Meta","Google","Tracking","Landing pages"],
      img:"https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1400&q=60"
    },
    { id:"AMK-SVC-LP", rail:"services", title:"Landing Pages",
      desc:"Pages rapides, orientées conversion, adaptées mobile, formulaires optimisés.",
      price:"À partir de 390€", tag:"Conversion", eta:"Livraison: 3–5 jours",
      badges:["Mobile-first","A/B test","SEO","Formulaires"],
      img:"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60"
    },
    { id:"AMK-SVC-CRM", rail:"services", title:"Mise en place CRM",
      desc:"Pipeline, étiquettes, tâches, automatisations, tableaux de bord.",
      price:"À partir de 850€", tag:"Structuration", eta:"Livraison: 10 jours",
      badges:["Pipelines","Automations","Dashboards","Formation"],
      img:"https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=60"
    },

    { id:"AMK-NEW-01", rail:"new", title:"Relances WhatsApp",
      desc:"Relances conversationnelles avec scénarios et templates.",
      price:"Bêta", tag:"Nouveau", eta:"Activation: 48h",
      badges:["WhatsApp","Templates","Automations"],
      img:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=60"
    },
    { id:"AMK-NEW-02", rail:"new", title:"Dashboard ROI",
      desc:"Un tableau clair: leads → RDV → ventes, par source et par vendeur.",
      price:"À partir de 290€ / mois", tag:"Data", eta:"Mise en place: 5 jours",
      badges:["KPIs","Attribution","Exports","Alertes"],
      img:"https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=60"
    },

    { id:"3MT2", rail:"campaigns_tx", title:"Remerciement de commande",
      desc:"Remercyez chaque client après achat. Renforce l’expérience client.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 48h • Perpétuelle",
      badges:["Reconnaissance","Email","Expérience client","Automatique"], img:CAMPAIGN_IMG["3MT2"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Remerciement-commande"
    },
    { id:"3MT8", rail:"campaigns_tx", title:"RDV en ligne pour livraison VN/VO",
      desc:"Créneaux proposés automatiquement, client autonome 24/24.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 2 semaines • Perpétuelle",
      badges:["RDV livraison","24/24","Réduction délais","Autonomie client"], img:CAMPAIGN_IMG["3MT8"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=RDVlivraison"
    },
    { id:"3MT3", rail:"campaigns_tx", title:"RDV atelier – 11 mois après livraison",
      desc:"Invite le client à prendre RDV SAV. Réduit les appels entrants.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 48h • Perpétuelle",
      badges:["RDV SAV","Automatique","Fidélisation","Atelier"], img:CAMPAIGN_IMG["3MT3"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=SAV-11mois"
    },
    { id:"3MT5", rail:"campaigns_tx", title:"Remerciement après essai routier",
      desc:"Email haut de gamme après essai. Prospect en phase d’achat.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 48h • Perpétuelle",
      badges:["Essai","Email","Différenciant","RGPD"], img:CAMPAIGN_IMG["3MT5"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Remerciement-essai-routier"
    },
    { id:"3MT6", rail:"campaigns_tx", title:"Périphériques (upsell avant livraison)",
      desc:"Propose services/produits non souscrits avant livraison.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 48h • Perpétuelle",
      badges:["Upsell","Panier moyen","Relance","Avant livraison"], img:CAMPAIGN_IMG["3MT6"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=PERIPHERIQUE"
    },
    { id:"3MP5", rail:"campaigns_tx", title:"Offre de reprise +30 mois après livraison",
      desc:"Relance 30 mois après livraison. Identifie intentions d’achat.",
      price:"Investissement : (voir commande)", tag:"Transactionnelle", eta:"Délai: 1 semaine • Perpétuelle",
      badges:["Reprise","Renouvellement","Lead propriétaire","Automatique"], img:CAMPAIGN_IMG["3MP5"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=30MOIS"
    },

    { id:"3MP2", rail:"campaigns_pe", title:"Prise de RDV opération commerciale",
      desc:"Remplit les agendas : les clients prennent RDV eux-mêmes.",
      price:"Investissement : (voir commande)", tag:"Promotionnelle", eta:"Délai: 1 semaine",
      badges:["RDV en ligne","Trafic","Relance","Leads chauds"], img:CAMPAIGN_IMG["3MP2"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Prise-RDV-Operation-commerciale"
    },
    { id:"3MP1", rail:"campaigns_pe", title:"Mini catalogue de promotion",
      desc:"Présentez vos modèles à destocker avec une offre + formulaire.",
      price:"Investissement : (voir commande)", tag:"Promotionnelle", eta:"Délai: 1 semaine",
      badges:["Destockage","Formulaire","Leads","Personnalisable"], img:CAMPAIGN_IMG["3MP1"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Mini-Catalogue"
    },
    { id:"3MP9", rail:"campaigns_pe", title:"Pop-up sur site web",
      desc:"Capte des contacts depuis le trafic du site. Leadgen permanente.",
      price:"Investissement : (voir commande)", tag:"Promotionnelle", eta:"Délai: 24h • Perpétuelle",
      badges:["Site web","Leadgen","Nurturing","Volume"], img:CAMPAIGN_IMG["3MP9"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Pop-Up"
    },
    { id:"3MP8", rail:"campaigns_pe", title:"Test d’électro-compatibilité",
      desc:"Test ludique : questions personnalisables, multi-support.",
      price:"Investissement : (voir commande)", tag:"Événementielle", eta:"Délai: 48h • Perpétuelle",
      badges:["Quiz","Personnalisable","Leads","Multi-support"], img:CAMPAIGN_IMG["3MP8"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Test-Electro-Compatibilite"
    },
    { id:"3ME6", rail:"campaigns_pe", title:"Lancement + journées d’essais",
      desc:"Réservation en ligne des essais. Meilleure organisation.",
      price:"Investissement : (voir commande)", tag:"Événementielle", eta:"Délai: 1 semaine",
      badges:["Planning","Réservation","Trafic","Organisation"], img:CAMPAIGN_IMG["3ME6"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=ESSAI"
    },
    { id:"3ME7", rail:"campaigns_pe", title:"Petit déjeuner + contrôle gratuit",
      desc:"Contrôle + niveaux offerts. Inscription obligatoire + intentions.",
      price:"Investissement : (voir commande)", tag:"Événementielle", eta:"Délai: 1 semaine",
      badges:["Samedi","Contrôle offert","Trafic","Intentions"], img:CAMPAIGN_IMG["3ME7"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=PETITDEJ"
    },
    { id:"3ME1", rail:"campaigns_pe", title:"Invitation à l’essai – RDV atelier",
      desc:"Exploite le flux atelier pour alimenter les agendas.",
      price:"Investissement : (voir commande)", tag:"Événementielle", eta:"Délai: 3 semaines",
      badges:["Flux atelier","Essai","Accueil","Leads"], img:CAMPAIGN_IMG["3ME1"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=Essai-RDV-SAV"
    },
    { id:"3MT7", rail:"campaigns_pe", title:"Offre sur rappel constructeur (Takata)",
      desc:"Transforme un rappel en opportunité commerciale : RDV qualifiés.",
      price:"Investissement : (voir commande)", tag:"Promotionnelle", eta:"Délai: 72h • Perpétuelle",
      badges:["Rappel","RDV qualifiés","Opportunité","Nouveaux clients"], img:CAMPAIGN_IMG["3MT7"],
      link:"https://automaktion.typeform.com/to/aDwEGv3d?utm_source=CANVA#compte=xxxxx&product_id=SAV-11mois"
    }
  ];

  // ===== Build UI skeleton in #amk-app =====
  var root = document.getElementById("amk-app");
  if (!root) return;

  root.innerHTML =
    '' +
    '<div id="debugPanel" style="display:none;"></div>' +

    '<header class="amk-topbar">' +
      '<div class="amk-brand">' +
        '<span class="amk-brandLogoWrap"><img class="amk-brandLogo" alt="Logo Automaktion" src="https://lp.automaktion.com/media/images/LOGO.png"></span>' +
        '<span>AUTOMAKTION</span>' +
      '</div>' +
      '<nav class="amk-nav" aria-label="Navigation">' +
        '<a href="#catalogue">Catalogue</a>' +
        '<a href="#packs">Packs</a>' +
        '<a href="#services">Services</a>' +
        '<a href="#campagnes">Campagnes</a>' +
        '<a href="#contact">Contact</a>' +
      '</nav>' +
      '<div class="amk-actions">' +
        '<div class="amk-search" role="search"><span aria-hidden="true">🔎</span><input id="amk-q" type="search" placeholder="Rechercher un produit…" autocomplete="off"></div>' +
        '<button class="amk-pill" type="button">Compte</button>' +
        '<button class="amk-pill amk-cta" type="button">Demander une démo</button>' +
      '</div>' +
    '</header>' +

    '<main>' +
      '<section class="amk-hero" id="catalogue">' +
        '<div class="amk-heroInner">' +
          '<div class="amk-heroContent">' +
            '<div class="amk-kicker">AUTOMATISATION • PERFORMANCE</div>' +
            '<h1 class="amk-heroTitle">MARKETING ET PROCESSUS MÉTIER AUTOMATISÉS</h1>' +
            '<p class="amk-heroText">Catalogue premium : packs, services, campagnes (transactionnelles / promotionnelles & événementielles).</p>' +
            '<div class="amk-heroButtons">' +
              '<a class="amk-btn amk-btnPrimary" href="#packs">Découvrir</a>' +
              '<a class="amk-btn" href="#services">Services</a>' +
              '<a class="amk-btn" href="#campagnes">Campagnes</a>' +
              '<a class="amk-btn" href="#contact">Contact</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="amk-section" id="packs">' +
        '<div class="amk-rowHead"><h2>PACKS RECOMMANDÉS</h2><small></small></div>' +
        '<div class="amk-packsGrid">' +
          '<div class="amk-packsRail" data-rail="recommended"></div>' +
          '<aside class="amk-aside"><iframe loading="lazy" src="https://embed.liveavatar.com/v1/efb7eb99-9207-433c-8143-210beb2ace56" allow="microphone" title="LiveAvatar Embed"></iframe></aside>' +
        '</div>' +
      '</section>' +

      '<section class="amk-section" id="services">' +
        '<div class="amk-rowHead"><h2>SERVICES</h2><small>Glisse horizontalement →</small></div>' +
        '<div class="amk-rail" data-rail="services"></div>' +
      '</section>' +

      '<section class="amk-section" id="campagnes">' +
        '<div class="amk-rowHead"><h2>CAMPAGNES TRANSACTIONNELLES</h2><small>Glisse horizontalement →</small></div>' +
        '<div class="amk-rail" data-rail="campaigns_tx"></div>' +
        '<div class="amk-rowHead" style="padding-top:6px"><h2>CAMPAGNES PROMOTIONNELLES & ÉVÉNEMENTIELLES</h2><small>Glisse horizontalement →</small></div>' +
        '<div class="amk-rail" data-rail="campaigns_pe"></div>' +
      '</section>' +

      '<section class="amk-section">' +
        '<div class="amk-rowHead"><h2>NOUVEAUTÉS</h2><small>Glisse horizontalement →</small></div>' +
        '<div class="amk-rail" data-rail="new"></div>' +
      '</section>' +

      '<footer class="amk-footer" id="contact">' +
        '<div style="max-width:820px;padding:0 18px">' +
          '<div style="font-weight:700;color:rgba(249,248,255,.82);margin-bottom:6px;font-family:var(--font-title);text-transform:uppercase">CONTACT</div>' +
          '<div style="margin-bottom:12px">© <span id="amk-year"></span> AUTOMAKTION</div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
            '<button class="amk-pill amk-cta" type="button">Demander une démo</button>' +
            '<button class="amk-pill" type="button">Télécharger la brochure</button>' +
          '</div>' +
        '</div>' +
      '</footer>' +
    '</main>' +

    '<div class="amk-overlay" id="amk-overlay" aria-hidden="true">' +
      '<div class="amk-modal" role="dialog" aria-modal="true" aria-label="Détails produit">' +
        '<div class="amk-modalTop">' +
          '<div class="amk-modalMedia">' +
            '<button class="amk-close" id="amk-close" type="button" aria-label="Fermer">✕</button>' +
            '<img id="amk-mImg" alt="">' +
          '</div>' +
          '<div class="amk-modalInfo">' +
            '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
              '<div class="amk-eta" id="amk-mTag"></div>' +
              '<div id="amk-mSku" style="color:rgba(249,248,255,.60);font-size:12px;font-family:var(--font-title);text-transform:uppercase"></div>' +
            '</div>' +
            '<h3 id="amk-mTitle"></h3>' +
            '<p id="amk-mDesc"></p>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px">' +
              '<div id="amk-mPrice" style="font-weight:700;font-size:18px;font-family:var(--font-title);text-transform:uppercase"></div>' +
              '<div class="amk-eta" id="amk-mTime"></div>' +
            '</div>' +
            '<div class="amk-modalActions">' +
              '<button class="amk-btn amk-btnPrimary" id="amk-mPrimary" type="button">Commander</button>' +
              '<button class="amk-btn" id="amk-mShare" type="button">Partager</button>' +
              '<button class="amk-btn" type="button">Ajouter au devis</button>' +
              '<button class="amk-btn" type="button">Comparer</button>' +
            '</div>' +
            '<div class="amk-details" id="amk-mDetails"></div>' +
            '<div style="color:rgba(249,248,255,.60);font-size:12px;margin-top:auto">Le bouton “Commander” ouvre ton Typeform si un lien est défini.</div>' +
          '</div>' +
        '</div>' +
        '<div class="amk-modalBottom" id="amk-mBadges"></div>' +
      '</div>' +
    '</div>';

  // Debug panel handlers (dans le DOM #amk-app)
  var debugPanel = $("#debugPanel", root);
  function debugShow(msg) {
    if (!debugPanel) return;
    debugPanel.style.display = "block";
    debugPanel.style.position = "fixed";
    debugPanel.style.left = "12px";
    debugPanel.style.bottom = "12px";
    debugPanel.style.zIndex = "999999";
    debugPanel.style.maxWidth = "min(720px, calc(100vw - 24px))";
    debugPanel.style.maxHeight = "38vh";
    debugPanel.style.overflow = "auto";
    debugPanel.style.padding = "10px 12px";
    debugPanel.style.borderRadius = "14px";
    debugPanel.style.background = "rgba(0,0,0,.72)";
    debugPanel.style.border = "1px solid rgba(255,255,255,.18)";
    debugPanel.style.color = "#fff";
    debugPanel.style.font = "12px/1.35 ui-monospace, Menlo, Monaco, Consolas, monospace";
    var t = new Date().toLocaleTimeString();
    debugPanel.innerHTML = "<b>JS ERROR @ " + t + "</b><br><pre style='margin:6px 0 0;white-space:pre-wrap;'>" + String(msg).slice(0, 9000) + "</pre>";
  }

  window.addEventListener("error", function (e) {
    var m = (e && e.error && e.error.stack) ? e.error.stack : (e && e.message ? e.message : e);
    debugShow(m);
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason ? e.reason : e;
    var m2 = (r && r.stack) ? r.stack : r;
    debugShow(m2);
  });

  // ===== Render =====
  var rails = {
    recommended: $("[data-rail='recommended']", root),
    services: $("[data-rail='services']", root),
    campaigns_tx: $("[data-rail='campaigns_tx']", root),
    campaigns_pe: $("[data-rail='campaigns_pe']", root),
    new: $("[data-rail='new']", root)
  };

  function makeCard(p) {
    var el = document.createElement("div");
    el.className = "amk-card";
    el.tabIndex = 0;

    var etaText = normalizeEta(p.eta);
    var etaHtml = CLOCK_SVG + "<span>" + escapeHtml(etaText || "—") + "</span>";

    el.innerHTML =
      "<div class='amk-thumb'>" +
        "<img src='" + p.img + "' alt='" + escapeHtml(p.title) + "' loading='lazy'>" +
        "<div class='amk-badge'>" + escapeHtml(p.tag) + "</div>" +
      "</div>" +
      "<div class='amk-cardBody'>" +
        "<div class='amk-title'>" + escapeHtml(p.title) + "</div>" +
        "<p class='amk-desc'>" + escapeHtml(p.desc) + "</p>" +
        "<div class='amk-price'>" +
          "<span>" + escapeHtml(p.price) + "</span>" +
          "<span class='" + etaClass(p.tag) + "'>" + etaHtml + "</span>" +
        "</div>" +
      "</div>";

    el.addEventListener("click", function () { openModal(p); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") openModal(p); });
    return el;
  }

  var lastRendered = PRODUCTS.slice();

  function buildRailFragments(list) {
    var built = {
      recommended: document.createDocumentFragment(),
      services: document.createDocumentFragment(),
      campaigns_tx: document.createDocumentFragment(),
      campaigns_pe: document.createDocumentFragment(),
      new: document.createDocumentFragment()
    };

    list.filter(function (p) { return p.rail === "recommended"; }).slice(0, 3)
      .forEach(function (p) { built.recommended.appendChild(makeCard(p)); });

    list.filter(function (p) { return p.rail !== "recommended"; })
      .forEach(function (p) { if (built[p.rail]) built[p.rail].appendChild(makeCard(p)); });

    return built;
  }

  function safeRender(list) {
    if (!Array.isArray(list) || list.length === 0) return;
    try {
      var built = buildRailFragments(list);
      Object.keys(rails).forEach(function (k) {
        if (!rails[k]) return;
        rails[k].replaceChildren(built[k]);
      });
      lastRendered = list.slice();
    } catch (err) {
      debugShow(err && err.stack ? err.stack : err);
      // fallback : on restaure le dernier état valide
      try {
        var fb = buildRailFragments(lastRendered && lastRendered.length ? lastRendered : PRODUCTS);
        Object.keys(rails).forEach(function (k) {
          if (!rails[k]) return;
          rails[k].replaceChildren(fb[k]);
        });
      } catch (_) {}
    }
  }

  // ===== Modal =====
  var overlay = $("#amk-overlay", root);
  var closeBtn = $("#amk-close", root);
  var mImg = $("#amk-mImg", root);
  var mTitle = $("#amk-mTitle", root);
  var mDesc = $("#amk-mDesc", root);
  var mPrice = $("#amk-mPrice", root);
  var mTag = $("#amk-mTag", root);
  var mSku = $("#amk-mSku", root);
  var mTime = $("#amk-mTime", root);
  var mBadges = $("#amk-mBadges", root);
  var mPrimary = $("#amk-mPrimary", root);
  var mDetails = $("#amk-mDetails", root);
  var mShare = $("#amk-mShare", root);

  var currentProduct = null;

  function listItems(items) {
    if (!items || !items.length) return "";
    return "<ul class='amk-detailList'>" + items.map(function (x) {
      return "<li>" + escapeHtml(x) + "</li>";
    }).join("") + "</ul>";
  }

  function block(title, rightLabel, innerHtml) {
    var r = rightLabel ? "<div class='amk-detailSub'>" + escapeHtml(rightLabel) + "</div>" : "<div></div>";
    return "" +
      "<div class='amk-detailBlock'>" +
        "<div class='amk-detailTitle'>" +
          "<div>" + escapeHtml(title) + "</div>" +
          r +
        "</div>" +
        innerHtml +
      "</div>";
  }

  function buildModalUrl(productId) {
    var url = new URL(window.location.href);
    url.searchParams.set("open", productId);
    return url.toString();
  }

  function buildShareMailto(product) {
    var shareUrl = buildModalUrl(product.id);
    var subject = "Idée AUTOMAKTION : " + product.title;
    var body = [
      "L'expéditeur de cet email souhaite vous partager une idée a mettre en place dans votre entreprise, cliquez ici pour la découvrir",
      "",
      shareUrl
    ].join("\n");
    return "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function openModal(p) {
    currentProduct = p;

    mImg.src = p.img;
    mImg.alt = p.title;

    mTitle.textContent = p.title;
    mDesc.textContent = p.desc;
    mPrice.textContent = p.price;

    mTag.innerHTML = CLOCK_SVG + "<span>" + escapeHtml(String(p.tag || "").toUpperCase()) + "</span>";
    mSku.textContent = p.id;

    var etaText = normalizeEta(p.eta);
    mTime.className = etaClass(p.tag);
    mTime.innerHTML = CLOCK_SVG + "<span>" + escapeHtml(etaText || "—") + "</span>";

    mBadges.innerHTML = (p.badges || []).map(function (b) {
      return "<span>" + escapeHtml(b) + "</span>";
    }).join("");

    if (p.link) {
      mPrimary.textContent = "Commander";
      mPrimary.onclick = function () { window.open(p.link, "_blank", "noopener,noreferrer"); };
    } else {
      mPrimary.textContent = "Acheter";
      mPrimary.onclick = null;
    }

    mShare.onclick = function () {
      if (!currentProduct) return;
      window.location.href = buildShareMailto(currentProduct);
    };

    var fiche = FICHE_DETAILS[normKey(p.title)];
    var html = "";

    if (fiche) {
      html += block("Fiche produit", fiche.segment || null,
        "<div style='color:rgba(249,248,255,.76);font-size:12px;line-height:1.45'>" + escapeHtml(fiche.pitch || "") + "</div>"
      );

      var chips = [];
      if (fiche.delais && fiche.delais.length) chips = chips.concat(fiche.delais.map(function (d) { return "⏱ " + d; }));
      if (fiche.temporalite) chips.push("📌 " + fiche.temporalite);
      if (chips.length) html += block("Délais & temporalité", null, listItems(chips));

      if (fiche.cible && fiche.cible.length) html += block("Cible & qualification", null, listItems(fiche.cible));
      if (fiche.canaux && fiche.canaux.length) html += block("Canaux / formats", null, listItems(fiche.canaux));
      if (fiche.chiffres && fiche.chiffres.length) html += block("Chiffres", null, listItems(fiche.chiffres));
      if (fiche.temoignage && fiche.temoignage.length > 20) {
        html += block("Témoignage", null, "<div class='amk-quote'>" + escapeHtml(fiche.temoignage) + "</div>");
      }
    } else {
      html += block("Détails", null,
        "<div style='color:rgba(249,248,255,.70);font-size:12px;line-height:1.45'>Cette campagne n’a pas encore sa fiche détaillée intégrée.</div>"
      );
    }

    mDetails.innerHTML = html;

    var u = new URL(window.location.href);
    u.searchParams.set("open", p.id);
    history.replaceState({ open: p.id }, "", u.toString());

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    var u = new URL(window.location.href);
    u.searchParams.delete("open");
    history.replaceState({}, "", u.toString());

    currentProduct = null;
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  // ===== Search =====
  var q = $("#amk-q", root);
  q.addEventListener("input", function () {
    var s = sanitizeQuery(q.value);
    if (!s) { safeRender(PRODUCTS); return; }

    var filtered = PRODUCTS.filter(function (p) {
      var hay = [p.title, p.desc, p.tag, p.id].concat(p.badges || []).join(" ").toLowerCase();
      return hay.indexOf(s) !== -1;
    });

    if (filtered.length === 0) return; // ne vide jamais
    safeRender(filtered);
  });

  function openFromUrlIfNeeded() {
    var u = new URL(window.location.href);
    var id = u.searchParams.get("open");
    if (!id) return;
    var p = null;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) { p = PRODUCTS[i]; break; }
    }
    if (p) openModal(p);
  }

  // boot
  var year = $("#amk-year", root);
  if (year) year.textContent = String(new Date().getFullYear());

  safeRender(PRODUCTS);
  openFromUrlIfNeeded();
})();