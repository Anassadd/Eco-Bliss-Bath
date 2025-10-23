describe('Tests API Eco Bliss Bath', () => {

  const baseUrl = 'http://localhost:8081';

  // --- Tests d'accès public et non authentifié ---

  it('GET /products → renvoie la liste des produits', () => {
    cy.request(`${baseUrl}/products`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array'); // On vérifie que c'est bien un tableau
      expect(response.body.length).to.be.greaterThan(0); // On vérifie qu'il n'est pas vide
    });
  });

  it('GET /orders sans authentification → doit renvoyer 401 (Non autorisé)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/orders`,
      failOnStatusCode: false // Important pour que Cypress n'arrête pas le test sur une erreur 4xx
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // --- Tests d'authentification ---

  it('POST /login avec utilisateur inconnu → doit renvoyer 401 (Non autorisé)', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      body: {
        // CORRIGÉ : Le serveur attend `username`, pas `email`.
        username: 'fakeuser@test.fr',
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('POST /login avec utilisateur connu → doit renvoyer 200 et un token', function() {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      body: {
        // CORRIGÉ : Le serveur attend `username`, pas `email`.
        username: 'test2025@gmail.com',
        password: 'Test2025?'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token'); // On vérifie que la réponse contient bien un token

      // On stocke le token pour l'utiliser dans le test suivant
      cy.wrap(response.body.token).as('authToken');
    });
  });

  // --- Test d'une route protégée AVEC authentification ---

  it('GET /orders (sans panier) AVEC authentification → doit renvoyer 404', function() {
  const token = this['authToken'];

  cy.request({
    method: 'GET',
    url: `${baseUrl}/orders`, // <-- URL CORRIGÉE (sans /api)
    headers: {
      'Authorization': `Bearer ${token}`
    },
    failOnStatusCode: false // On gère le code d'erreur nous-mêmes
  }).then((response) => {
    // On s'attend à un 404 car le panier est vide
    expect(response.status).to.eq(404);
  });
});

});