// @ts-nocheck
describe('Affichage des produits – Eco Bliss Bath', () => {

  const baseUrl = 'http://localhost:4200';

  beforeEach(() => {
    // On intercepte la requête API pour attendre le chargement réel des produits
    cy.intercept('GET', 'http://localhost:8081/products').as('getProducts');
    cy.visit(baseUrl + '/#/products');
    cy.wait('@getProducts'); // attend la réponse réelle de l’API
  });

  // 1️⃣ Vérifie que la page charge bien
  it('Charge correctement la page Produits', () => {
    cy.url().should('include', '/#/products');

    // ✅ Vérifie la présence d’un titre contenant “Produits” ou “Nos produits”
    cy.get('h1, h2, h3').invoke('text').then((texte) => {
      expect(texte).to.match(/produits|nos produits/i);
    });
  });

  // 2️⃣ Vérifie que les produits s’affichent bien
  it('Affiche la liste des produits', () => {
    // On attend que les produits apparaissent dans le DOM
    cy.get('article, app-product-card, .product-card', { timeout: 10000 })
      .should('exist')
      .and('have.length.greaterThan', 0);
  });

  // 3️⃣ Vérifie les infos principales de CHAQUE produit
  it('Chaque produit contient une image, un nom, un prix et un bouton', () => {
    cy.get('article, app-product-card, .product-card', { timeout: 10000 }).each(($produit) => {
      cy.wrap($produit).within(() => {
        cy.get('img').should('be.visible');
        cy.get('h3, .product-name').should('exist');
        cy.contains(/€|Prix/i).should('exist');
        cy.contains(/Consulter|Voir|Détail/i).should('exist');
      });
    });
  });

});


