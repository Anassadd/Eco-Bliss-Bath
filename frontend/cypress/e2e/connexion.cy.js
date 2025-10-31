describe('Connexion – Tests utilisateur Eco Bliss Bath', () => {

  const baseUrl = 'http://localhost:4200';
  const user = {
    username: 'test2025@gmail.com',
    password: 'Test2025?'
  };

  beforeEach(() => {
    cy.visit(baseUrl + '/#/login');
    cy.wait(500);
  });

  it('Affiche le formulaire après avoir cliqué sur le bouton Connexion', () => {
    cy.visit(baseUrl + '/');
    cy.contains('Connexion').click();
    cy.get('form').should('exist').and('be.visible');
  });

  it('Affiche bien le formulaire de connexion', () => {
    cy.get('form').should('exist').and('be.visible');
  });

  it('Permet de saisir un email et un mot de passe', () => {
    cy.get('[data-cy="login-input-username"]').clear().type(user.username);
    cy.get('[data-cy="login-input-password"]').clear().type(user.password);
  });

  it('Permet de se connecter et affiche le lien “Mon panier”', () => {
    cy.visit(baseUrl + '/');
    cy.contains('Connexion').click();
    cy.get('form').should('exist');

    cy.get('[data-cy="login-input-username"]').type(user.username);
    cy.get('[data-cy="login-input-password"]').type(user.password);
    cy.get('form').contains('Se connecter').click();

    cy.url({ timeout: 10000 }).should('include', '/#/');
    cy.contains('Mon panier', { timeout: 8000 }).should('exist');
  });

});