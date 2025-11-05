describe('Connexion – Eco Bliss Bath (UI)', () => {
  const FRONT = 'http://localhost:4200';

  
  const sel = {
    btnConnexion: () => cy.contains(/Connexion|Se connecter|Login/i),
    form: () => cy.get('form'),
    username: () =>
      cy.get('[data-cy="login-input-username"], #username, input[name="username"], input[type="email"]').first(),
    password: () =>
      cy.get('[data-cy="login-input-password"], #password, input[name="password"], input[type="password"]').first(),
    submit: () => cy.contains('button', /Se connecter|Connexion|Log in/i),
    panierLink: () => cy.contains(/Mon panier|Panier|Cart/i),
  };

  beforeEach(() => {
    // Arrange (commun) : on va sur la page login
    cy.visit(`${FRONT}/#/login`);
    // Stabilise le réseau côté API login pour les tests qui cliquent "Se connecter"
    cy.intercept('POST', 'http://localhost:8081/login').as('apiLogin');
  });

  it('Affiche le formulaire après clic sur “Connexion” depuis l’accueil', () => {
    // Arrange
    cy.visit(FRONT);

    // Act
    sel.btnConnexion().should('be.visible').click();

    // Assert
    sel.form().should('exist').and('be.visible');
    sel.username().should('be.visible');
    sel.password().should('be.visible');
  });

  it('Affiche bien le formulaire de connexion (accès direct)', () => {
    // Arrange : fait dans beforeEach (déjà sur /#/login)

    // Act : rien à faire

    // Assert
    sel.form().should('exist').and('be.visible');
    sel.username().should('be.visible');
    sel.password().should('be.visible');
  });

  it('Permet de saisir un email et un mot de passe', () => {
    // Arrange : on est sur /#/login

    // Act
    sel.username().clear().type('test2025@gmail.com');
    sel.password().clear().type('Test2025?');

    // Assert (champs remplis)
    sel.username().should('have.value', 'test2025@gmail.com');
    sel.password().invoke('val').should('not.be.empty'); // on évite d’asserter la valeur d’un champ password en clair
  });

  it('Connexion réussie → redirection + lien “Mon panier” visible', () => {
    // Arrange
    sel.username().clear().type('test2025@gmail.com');
    sel.password().clear().type('Test2025?');

    // Act
    sel.submit().should('not.be.disabled').click();
    cy.wait('@apiLogin').its('response.statusCode').should('eq', 200);

    // Assert
    cy.url({ timeout: 10000 }).should((url) => {
      expect(url).to.satisfy((u) => u.includes('/#/') || u.endsWith('/'));
    });
    sel.panierLink({ timeout: 10000 }).should('exist');
  });

  it('Connexion refusée (mauvais identifiants) → message d’erreur visible', () => {
    // Arrange
    sel.username().clear().type('wrong@example.com');
    sel.password().clear().type('nottherightpassword');

    // Act
    sel.submit().click();
    cy.wait('@apiLogin').its('response.statusCode').should('eq', 401);

    // Assert (message d’erreur – adapter au texte exact si besoin)
    cy.contains(/identifiants invalides|erreur|non autorisé|incorrect/i).should('exist');
  });
});