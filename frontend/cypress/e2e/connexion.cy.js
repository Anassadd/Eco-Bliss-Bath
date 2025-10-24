// cypress/e2e/connexion.cy.ts
describe('Connexion - Eco Bliss Bath', () => {
  const frontUrl = 'http://localhost:4200';

  it('Permet à un utilisateur valide de se connecter', () => {
    // 1) Aller sur la page de login
    cy.visit(frontUrl + '/#/login');

    // 2) Vérifier que les champs sont visibles
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');

    // 3) Saisir les identifiants valides
    cy.get('#username').clear().type('test2025@gmail.com');
    cy.get('#password').clear().type('Test2025?');

    // 4) Cliquer sur le bouton de connexion
    cy.get('button').contains('Se connecter').click();

    // 5) Vérifier la redirection vers l'accueil (ou présence du bouton Panier)
    cy.url().should('eq', frontUrl + '/#/');
    cy.contains('Mon panier').should('be.visible');
  });
});
