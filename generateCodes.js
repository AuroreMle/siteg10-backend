const mysql = require('mysql2');
const crypto = require('crypto');

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'gten',
  password: 'dipl0ma!',
  database: 'ttpjc_db'
});

// Connecter à la base de données
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données: ', err);
    return;
  }
  console.log('Connecté à la base de données.');
});

// Fonction pour générer un code aléatoire de 10 chiffres
const generateCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 caractères hexadécimaux
};

// Fonction pour insérer un code et son gain dans la base de données
const insertCode = (code, gain) => {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO codes (code, gain) VALUES (?, ?)', [code, gain], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // Code en double, on renvoie false pour réessayer
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
};

// Fonction pour générer et insérer les codes uniques
const insertCodes = async () => {
  const totalCodes = 500000;
  const codes = [];
  const gainTypes = [
    { type: 'Infuseur à thé', percentage: 60 },
    { type: 'Boîte de 100g de thé détox ou d’infusion', percentage: 20 },
    { type: 'Boîte de 100g de thé signature', percentage: 10 },
    { type: 'Coffret découverte 39€', percentage: 6 },
    { type: 'Coffret découverte 69€', percentage: 4 }
  ];

  // Calculer le nombre de codes pour chaque type de gain
  gainTypes.forEach(gain => {
    const count = Math.round(totalCodes * (gain.percentage / 100));
    for (let i = 0; i < count; i++) {
      codes.push(gain.type);
    }
  });

  // Mélanger les codes pour randomiser l'attribution des gains
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }

  // Insérer les codes dans la base de données
  const insertedCodes = new Set();
  for (const gain of codes) {
    let code;
    let inserted = false;

    while (!inserted) {
      code = generateCode();
      if (!insertedCodes.has(code)) {
        insertedCodes.add(code);
        inserted = await insertCode(code, gain);
      }
    }
  }

  console.log('Tous les codes ont été insérés avec succès.');
  connection.end();
};

// Démarrer l'insertion des codes
insertCodes();
