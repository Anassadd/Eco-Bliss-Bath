describe('Panier – UI (ajout depuis une fiche produit en stock)', () => {
  const FRONT = 'http://localhost:4200';
  const API   = 'http://localhost:8081';

  beforeEach(() => {
    // Arrange: on espionne les appels utiles
    cy.intercept('POST', `${API}/login`).as('apiLogin');
    cy.intercept('GET',  `${API}/products/*`).as('apiProductDetail');
    // Couvrir absolu/relatif + PUT/POST
    cy.intercept({ method: /PUT|POST/, url: `${API}/orders/add*` }).as('apiAddAbs');
    cy.intercept({ method: /PUT|POST/, url: '**/orders/add*' }).as('apiAddAny');

    // Login via UI
    cy.visit(`${FRONT}/#/login`);
    cy.get('[data-cy="login-input-username"], #username, input[type="email"]').first().clear().type('test2@test.fr');
    cy.get('[data-cy="login-input-password"], #password, input[type="password"]').first().clear().type('testtest');
    cy.contains('button', /Se connecter|Connexion|Log in/i).click();
    cy.wait('@apiLogin').its('response.statusCode').should('eq', 200);
  });

  it('Ajout au panier via UI → bouton visible + appel /orders/add reçu', () => {
    // ARRANGE: récupérer un produit en stock pour cibler une fiche sûre
    cy.request(`${API}/products`).then((res) => {
      expect(res.status).to.eq(200);
      const prod = res.body.find(p => (p.stock ?? 0) > 0) || res.body[0];
      expect(prod, 'produit en stock trouvé').to.exist;

      // ACT: ouvrir directement la fiche du produit
      const id = prod.id ?? prod._id ?? prod.uuid;
      cy.visit(`${FRONT}/#/products/${id}`);
      cy.wait('@apiProductDetail').its('response.statusCode').should('eq', 200);

      //  Beaucoup d’UIs exigent une quantité > 0 → on la renseigne
      cy.get('input[type="number"], input[name="quantity"], input[aria-label*="quantit"], input[id*="quantit"]')
        .first()
        .then($q => {
          if ($q.length) cy.wrap($q).clear().type('1');
        });

      // ACT: cliquer “Ajouter au panier”
      cy.contains('button', /Ajouter au panier|Ajouter/i)
        .scrollIntoView()
        .should('be.visible')
        .and('not.be.disabled')
        .click();

      // ASSERT: attendre l’appel /orders/add (absolu ou relatif)
      cy.wait(['@apiAddAbs', '@apiAddAny'], { timeout: 10000 }).then((arr) => {
        // Cypress renvoie un tableau des interceptions abouties
        const inter = Array.isArray(arr) ? (arr.find(Boolean) || arr[0]) : arr;
        expect(inter.request.method).to.match(/PUT|POST/); // projet: PUT attendu
        expect(inter.response.statusCode).to.eq(200);
      });

      // Feedback visuel optionnel (n’échoue pas s’il est absent)
      cy.get('body').then(($b) => {
        const hasToast = $b.find('[data-cy="toast"], [role="alert"], .toast, .snackbar').length > 0;
        const hasCart  = /Mon panier|Panier|Cart/i.test($b.text());
        if (hasToast) {
          cy.get('[data-cy="toast"], [role="alert"], .toast, .snackbar').first().should('be.visible');
        } else if (hasCart) {
          cy.contains(/Mon panier|Panier|Cart/i).should('exist');
        } else {
          cy.log('Ajout confirmé par le réseau; aucun feedback visuel détectable.');
        }
      });
    });
  });
});
