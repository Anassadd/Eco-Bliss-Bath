// @ts-nocheck
describe('Affichage des produits – Eco Bliss Bath', () => {

  const frontUrl = 'http://localhost:4200';

  beforeEach(() => {
    // On visite la page produits avant chaque test
    cy.visit(frontUrl + '/#/products');
  });

  it('Vérifie que la page des produits se charge correctement', () => {
    cy.intercept('GET', 'http://localhost:8081/products').as('getProducts');
    cy.visit(frontUrl + '/#/products');
    cy.wait('@getProducts', { timeout: 10000 });
    cy.title().should('not.be.empty');
    cy.get('[data-cy="product-home"]').should('exist').and('have.length.greaterThan', 0);
  });

  it('Vérifie que chaque produit affiche image, nom, prix et bouton', () => {
    cy.get('[data-cy="product-home"]').each(($el) => {
      cy.wrap($el).within(() => {
        cy.get('[data-cy="product-home-img"]').should('be.visible');
        cy.get('[data-cy="product-home-name"]').should('not.be.empty');
        cy.get('[data-cy="product-home-price"]').should('not.be.empty');
        cy.get('[data-cy="product-home-link"]').should('be.visible');
      });
    });
  });

  it('Vérifie que le bouton “Consulter” ouvre la page du produit', () => {
    cy.get('[data-cy="product-home-link"]').first().click();
    cy.url().should('include', '/#/products/');
    cy.contains(/Ajouter au panier/i).should('be.visible');
  });
});
