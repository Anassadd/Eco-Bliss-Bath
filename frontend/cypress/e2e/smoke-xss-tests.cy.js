describe('Smoke & XSS — Eco Bliss Bath (Simple)', () => {
  const FRONT = 'http://localhost:4200';
  const API   = 'http://localhost:8081';
  const USER  = { username: 'test2025@gmail.com', password: 'Test2025?' };

  // ========= SMOKE TEST 1 =========
  it('Smoke: Accueil — la page se charge', () => {
    cy.visit(FRONT);
    cy.title().should('not.be.empty');
  });

  // ========= SMOKE TEST 2 =========
  it('Smoke: Login — la page se charge et les champs sont visibles', () => {
    cy.visit(`${FRONT}/#/login`);
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
  });

  // ========= SMOKE TEST 3 =========
  it("Smoke: Produits — la page se charge et attend l'API", () => {
    cy.intercept('GET', `${API}/products`).as('apiProducts');
    cy.visit(`${FRONT}/#/products`);
    cy.wait('@apiProducts').its('response.statusCode').should('eq', 200);
  });

  // ========= TEST XSS =========
describe('XSS — champ commentaire (simple)', () => {
  const payload = `<script>alert('XSS')</script>`;

  it('Publier un commentaire <script> ne doit pas exécuter de JS', () => {
    // 1) Spy anti-XSS : si une alert() s’exécute -> échec immédiat
    cy.on('window:alert', (txt) => {
      throw new Error(`XSS exécuté: ${txt}`);
    });

    // 2) Arrange
    cy.intercept('POST', `${API}/login`).as('apiLogin');
    cy.intercept('GET',  `${API}/reviews`).as('apiGetReviews');
    cy.intercept('POST', `${API}/reviews`).as('apiPostReview');

    // 3) Act: login
    cy.visit(`${FRONT}/#/login`);
    cy.get('#username').type(USER.username);
    cy.get('#password').type(USER.password);
    cy.contains('button', /Se connecter/i).click();
    cy.wait('@apiLogin');

    // 4) Act: nav vers Avis + attendre le GET
    cy.get('a[href="#/reviews"], a:contains("Avis")').first().click();
    cy.wait('@apiGetReviews');

    // 5) Act: remplir les champs requis pour activer "Publier"
    //    - Titre
    cy.get('[data-cy="review-input-title"]')
      .scrollIntoView()
      .should('exist')
      .type('Test XSS');

    //    - Étoiles (au moins 1) — clique la 5e pour être sûr
    cy.get('[data-cy="review-input-rating-images"] img')
      .eq(4)
      .click();

    //    - Commentaire (ton payload). On scrolle + force:true pour éviter l’erreur "not visible"
    cy.get('[data-cy="review-input-comment"]')
      .scrollIntoView()
      .should('exist')
      .type(payload, { force: true });

    // 6) Act: publier quand le bouton est actif
    cy.get('[data-cy="review-submit"]')
      .scrollIntoView()
      .should('exist')
      .and('not.be.disabled')
      .click();

    // 7) Assert réseau: le POST doit partir
    cy.wait('@apiPostReview').its('response.statusCode').should('be.oneOf', [200, 201]);

    // 8) Assert XSS: aucune exécution (déjà couverte par window:alert)
    //    Optionnel : on vérifie que la chaîne "<script" n’a pas été injectée telle quelle dans la zone des avis
    //    (le texte peut être encodé &lt;script&gt; -> c’est OK)
    cy.get('body').then($b => {
      const html = $b.html().toLowerCase();
      expect(html).not.to.include("<script>alert('xss')");
    });
  });
});
 });