describe('Smoke Tests – Eco Bliss Bath', () => {

  const frontUrl = 'http://localhost:4200';

  // --- Test 1 : Vérifie le chargement de la page d'accueil ---
  it('Vérifie que la page d’accueil se charge', () => {
    cy.visit(frontUrl);
    cy.title().should('not.be.empty');
  });

  // --- Test 2 : Vérifie la présence du bouton de connexion ---
  it('Vérifie la présence du bouton de connexion', () => {
    cy.visit(frontUrl);
    cy.contains('Connexion').should('be.visible');
  });

  // --- Test 3 : Vérifie que le formulaire de connexion s’affiche ---
  it('Vérifie que le formulaire de connexion s’affiche après clic', () => {
    cy.visit(frontUrl);
    cy.contains('Connexion').click();

    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button').contains('Se connecter').should('be.visible');
  });

  // --- Test 4 : Vérifie la disponibilité du bouton “Ajouter au panier” ---
  it('Vérifie que le bouton “Ajouter au panier” devient visible après avoir cliqué sur un produit', () => {

    // 1️⃣ On intercepte les requêtes pour suivre le chargement
    cy.intercept('GET', 'http://localhost:8081/products').as('getAllProducts');
    cy.intercept('GET', 'http://localhost:8081/products/*').as('getProductDetails');

    // 2️⃣ On visite la page de login
    cy.visit(frontUrl + '/#/login');

    // 3️⃣ On se connecte avec les identifiants valides
    cy.get('#username').type('test2025@gmail.com');
    cy.get('#password').type('Test2025?');
    cy.get('button').contains('Se connecter').click();

    // 4️⃣ On s’assure d’être redirigé vers la page d’accueil
    cy.url().should('eq', frontUrl + '/#/');

    // 5️⃣ On visite la page produits
    cy.visit(frontUrl + '/#/products');

    // 6️⃣ On attend le chargement complet des produits
    cy.wait('@getAllProducts');

 // Cliquer sur un produit
    cy.get('[data-cy="product-link"]').first().click({ force: true });

    // 8️⃣ On attend que la fiche produit soit chargée
    cy.wait('@getProductDetails');

    // 9️⃣ On vérifie que le bouton "Ajouter au panier" est bien visible
    cy.contains('Ajouter au panier').should('be.visible');
  });

});
