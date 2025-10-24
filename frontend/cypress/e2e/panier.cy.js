describe('Panier – Eco Bliss Bath', () => {
  const frontUrl = 'http://localhost:4200';

  beforeEach(() => {
    cy.visit(frontUrl + '/#/login');

    cy.get('#username').should('be.visible').type('test2025@gmail.com');
    cy.get('#password').should('be.visible').type('Test2025?');

    cy.get('button').contains(/Se connecter/i)
      .should('not.be.disabled')
      .click();

    cy.url().should('include', '/#/');
    cy.contains(/Mon panier|Panier/i).should('exist');
  });

  it('Ajoute un produit au panier et vérifie son affichage', () => {
    // Interceptions des appels API
    cy.intercept('GET', 'http://localhost:8081/products*').as('getAllProducts');
    cy.intercept('GET', 'http://localhost:8081/products/*').as('getProductDetails');
    cy.intercept({ method: /POST|PUT/, url: '**/orders/**' }).as('addToCart');

    // 1️⃣ Aller à la page des produits
    cy.visit(frontUrl + '/#/products');
    cy.wait('@getAllProducts', { timeout: 15000 });

    // 2️⃣ Attendre que les produits soient visibles avant de cliquer
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="product-home-link"]').length) {
        cy.get('[data-cy="product-home-link"]', { timeout: 10000 })
          .first()
          .click();
      } else if ($body.find('button:contains("Consulter")').length) {
        cy.contains('button', /Consulter|Voir/i, { timeout: 10000 }).first().click();
      } else {
        // Si aucun produit n’apparaît, on recharge la page une fois
        cy.reload();
        cy.get('[data-cy="product-home-link"]', { timeout: 10000 })
          .first()
          .click();
      }
    });

    // 3️⃣ Attendre que la page détail soit chargée
    cy.wait('@getProductDetails', { timeout: 15000 });

    // 4️⃣ Cliquer sur “Ajouter au panier”
    cy.contains(/Ajouter au panier/i, { timeout: 10000 })
      .should('be.visible')
      .click();

    // 5️⃣ Vérifier que la requête POST/PUT a bien réussi
    cy.wait('@addToCart', { timeout: 15000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    // 6️⃣ Aller dans le panier
    cy.contains(/Mon panier|Panier/i).click();
    cy.url().should('include', '/#/cart');
    cy.contains(/Votre panier|Panier/i).should('be.visible');

    // 7️⃣ Vérifie qu’un produit est bien présent dans le panier
    const selecteur_item_panier = '[data-cy="cart-line-image"]';
    cy.get(selecteur_item_panier, { timeout: 10000 })
      .should('exist')
      .and('have.length.greaterThan', 0);

    // 8️⃣ Vérifie que le champ quantité ne prend pas de valeurs invalides
    const selecteur_champ_quantite = 'input[type="number"]';
    cy.get(selecteur_champ_quantite).first().should('be.visible').then(($input) => {
      cy.wrap($input).clear().type('-1');
      cy.wrap($input).invoke('val').should('not.equal', '-1');

      cy.wrap($input).clear().type('21');
      cy.wrap($input).invoke('val').should('not.equal', '21');
    });
  });
});


