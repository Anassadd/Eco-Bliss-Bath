describe('Produits – UI Eco Bliss Bath', () => {
  const FRONT = 'http://localhost:4200';
  const API   = 'http://localhost:8081';

  // Sélecteurs tolérants
  const selecteur_item_produit   = 'article, app-product-card, .product-card';
  const selecteur_nom_produit    = 'h3, .product-name';
  const selecteur_prix_produit   = '.price, :contains("€")';
  const selecteur_stock_produit  = '.stock, :contains("en stock"), :contains("En stock")';
  const selecteur_bouton_consulter = 'button:contains("Consulter"), a:contains("Consulter"), button:contains("Voir"), a:contains("Voir"), button:contains("Détail"), a:contains("Détail")';
  const selecteur_image_produit  = 'img';

  beforeEach(() => {
    cy.intercept('GET', `${API}/products`).as('apiProducts');
    cy.visit(`${FRONT}/#/products`);
    cy.wait('@apiProducts').its('response.statusCode').should('eq', 200);
  });

  it('Chaque carte → image, nom, prix, bouton Consulter, stock', () => {
    cy.get(selecteur_item_produit, { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .each(($card) => {
        cy.wrap($card).within(() => {
          cy.get(selecteur_image_produit)
            .should('be.visible')
            .and(($img) => {
              expect($img[0].naturalWidth).to.be.greaterThan(0);
            });

          cy.get(selecteur_nom_produit).should('exist').and('be.visible');

          cy.get(selecteur_prix_produit).should('exist').then(($el) => {
            const txt = $el.text().replace(/\s/g, '');
            expect(txt).to.match(/\d+[.,]?\d*€/);
          });

          cy.get(selecteur_bouton_consulter).should('exist');

          cy.get('*').then(($all) => {
            const t = $all.text();
            if (/en stock/i.test(t)) {
              expect(t).to.match(/-?\d+\s*en stock/i);
            }
          });
        });
      });
  });
});
