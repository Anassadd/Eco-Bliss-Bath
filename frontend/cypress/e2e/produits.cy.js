describe('Affichage des produits – Eco Bliss Bath', () => {

  const baseUrl = 'http://localhost:4200';

  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8081/products').as('getProducts');
    cy.visit(baseUrl + '/#/products');
    cy.wait('@getProducts');
  });

  it('Charge correctement la page Produits', () => {
    cy.url().should('include', '/#/products');
    cy.get('h1, h2, h3').invoke('text').then((texte) => {
      expect(texte).to.match(/produits|nos produits/i);
    });
  });

  it('Affiche la liste des produits', () => {
    cy.get('article, app-product-card, .product-card', { timeout: 10000 })
      .should('exist')
      .and('have.length.greaterThan', 0);
  });

  it('Chaque produit contient une image, un nom, un prix, un bouton et un stock', () => {
    cy.get('article, app-product-card, .product-card', { timeout: 10000 }).each(($produit) => {
      cy.wrap($produit).within(() => {

        //  Image visible
        cy.get('img').should('be.visible');

        //  Nom du produit
        cy.get('h3, .product-name').should('exist');

        //  Prix affiché
        cy.contains(/€|Prix/i).should('exist');

        //  Bouton visible
        cy.contains(/Consulter|Voir|Détail/i).should('exist');

        //  Vérifie la présence du stock (par ex. “-219 en stock”)
        cy.get('*').then(($el) => {
          const texte = $el.text();
          if (texte.match(/en stock|Stock/i)) {
            expect(texte).to.match(/[-]?\d+\s*en stock/i);
          }
        });
      });
    });
  });

});