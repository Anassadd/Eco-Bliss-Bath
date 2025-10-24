describe('Test de Sécurité - Faille XSS (Simple)', () => {

  const frontUrl = 'http://localhost:4200';
  const email_de_test = 'test2025@gmail.com';
  const mot_de_passe = 'Test2025?'; // Assure-toi que ce mot de passe est bon !
  const script_malveillant = "<script>alert('FAILLE XSS')</script>";

  it("Doit poster un commentaire malveillant sans qu'il ne s'exécute", () => {
    
    // 1. L'ESPION : Si une alerte s'ouvre, le test échoue.
    cy.on('window:alert', (texte) => {
      throw new Error(`Le script s'est exécuté ! Faille XSS détectée : ${texte}`);
    });

    // 2. CONNEXION : On se connecte.
    cy.visit(frontUrl + '/#/login');
    cy.get('#username').type(email_de_test);
    cy.get('#password').should('not.be.disabled').type(mot_de_passe);
    cy.get('button').contains('Se connecter').should('not.be.disabled').click();
    cy.url().should('eq', frontUrl + '/#/'); // On attend d'être sur l'accueil

    // --- C'EST ICI QUE TU DOIS TRAVAILLER ---

    // 3. NAVIGATION
    
    // On espionne les requêtes pour attendre que les pages chargent
    cy.intercept('GET', 'http://localhost:8081/products').as('getAllProducts');
    cy.intercept('GET', 'http://localhost:8081/products/*').as('getOneProduct');

    cy.visit(frontUrl + '/#/products');
    cy.wait('@getAllProducts'); // On attend que la liste des produits soit chargée

    // 🎯 ACTION 1 : Trouve le vrai sélecteur pour ce lien
    const selecteur_consulter_produit = 'colle-le-sélecteur-copié-avec-la-cible-ici';
    
    cy.get(selecteur_consulter_produit).first().click();

    // 4. L'ATTAQUE
    cy.wait('@getOneProduct'); // On attend que la page du produit soit chargée

    // 🎯 ACTION 2 : Trouve le vrai sélecteur pour la zone de texte
    const selecteur_textarea = 'textarea[name="comment"]'; // <-- À REMPLACER
    
    // 🎯 ACTION 3 : Trouve le vrai sélecteur pour le bouton
    const selecteur_bouton = 'button[type="submit"]'; // <-- À REMPLACER

    // On attend que la zone de texte soit VISIBLE PUIS on écrit
    cy.get(selecteur_textarea).should('be.visible').type(script_malveillant);
    cy.get(selecteur_bouton).should('be.visible').click();

    // 5. VÉRIFICATION
    // On vérifie que notre script s'affiche bien (comme du texte)
    cy.contains(script_malveillant).should('be.visible');

    // Si on arrive ici sans erreur, le test est un SUCCÈS !
  });
});