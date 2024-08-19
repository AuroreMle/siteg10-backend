const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const connection = require('./database');

app.use(cors());
app.use(express.json());

// Route d'exemple
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Route pour l'inscription des utilisateurs
app.post('/signup/user', (req, res) => {
  const { username, email, password, role } = req.body;
  connection.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, password, role], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
    res.status(201).json({ message: 'Inscription réussie!' });
  });
});

// Route pour l'inscription des administrateurs
app.post('/signup/admin', (req, res) => {
  const { username, email, password, role } = req.body;
  connection.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, password, role], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de l\'inscription admin' });
    }
    res.status(201).json({ message: 'Inscription administrateur réussie!' });
  });
});

// Route pour la connexion des utilisateurs
app.post('/login/user', (req, res) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM users WHERE email = ? AND password = ? AND role = "user"', [email, password], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ message: 'Connexion utilisateur réussie!', user: results[0] });
    } else {
      res.status(401).json({ message: 'Identifiants utilisateur incorrects' });
    }
  });
});

// Route pour la connexion des administrateurs
app.post('/login/admin', (req, res) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM users WHERE email = ? AND password = ? AND role = "admin"', [email, password], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la connexion admin' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ message: 'Connexion administrateur réussie!', user: results[0] });
    } else {
      res.status(401).json({ message: 'Identifiants administrateur incorrects' });
    }
  });
});

// Route pour valider le code et enregistrer le gain
app.post('/validate-code', (req, res) => {
  const { userId, code } = req.body;
  connection.query('SELECT * FROM codes WHERE code = ?', [code], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la validation du code' });
    }

    if (results.length > 0) {
      const gain = results[0].gain;

      // Enregistrer l'entrée dans la table user_gains
      const validationDate = new Date();
      const expiryDate = new Date(validationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours après

      connection.query('INSERT INTO user_gains (user_id, code, gain, validation_date, expiry_date) VALUES (?, ?, ?, ?, ?)', 
        [userId, code, gain, validationDate, expiryDate], 
        (insertError) => {
          if (insertError) {
            return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du gain' });
          }
          res.status(200).json({ message: 'Code valide !', gain });
        });
    } else {
      res.status(404).json({ message: 'Code invalide' });
    }
  });
});

// Route pour récupérer l'historique des gains de l'utilisateur
app.get('/user-history/:userId', (req, res) => {
  const userId = req.params.userId;
  connection.query('SELECT * FROM user_gains WHERE user_id = ?', [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
    res.status(200).json(results);
  });
});

// Route pour récupérer l'historique des gains pour l'admin
app.get('/admin-history', (req, res) => {
  // Requête pour récupérer l'historique complet des gains
  connection.query('SELECT * FROM user_gains', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
    res.status(200).json(results);
  });
});



// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
