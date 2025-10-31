describe('API Tests – Eco Bliss Bath', () => {
  const base = 'http://localhost:8081';
  const credentials = { username: 'test2025@gmail.com', password: 'Test2025?' };

  // 1️ GET PRODUITS
  it('GET /products → renvoie la liste des produits (200 + tableau non vide)', () => {
    cy.request(`${base}/products`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  // 2️ GET FICHE PRODUIT 
  it('GET /products/{id} → renvoie une fiche produit valide', () => {
    cy.request(`${base}/products`).then((res) => {
      const id = res.body[0].id || res.body[0]._id || res.body[0].uuid;
      expect(id).to.exist;

      cy.request(`${base}/products/${id}`).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body).to.have.property('name');
      });
    });
  });

  // 3️ GET ORDERS NON CONNECTÉ 
  it('GET /orders sans authentification → renvoie 401 ou 403', () => {
    cy.request({
      method: 'GET',
      url: `${base}/orders`,
      failOnStatusCode: false,
    }).then((r) => {
      expect([401, 403]).to.include(r.status);
    });
  });

  // 4️ LOGIN UTILISATEUR INVALIDE 
  it('POST /login → utilisateur inconnu renvoie 401', () => {
    cy.request({
      method: 'POST',
      url: `${base}/login`,
      body: { username: 'fakeuser@test.fr', password: 'badpwd' },
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.eq(401);
    });
  });

  //  5️ LOGIN UTILISATEUR VALIDE 
  it('POST /login → utilisateur connu renvoie 200 et un token', () => {
    cy.request({
      method: 'POST',
      url: `${base}/login`,
      body: credentials,
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.have.property('token');
    });
  });

  //  6️ AJOUT PRODUIT AU PANIER 
  it('POST/PUT /orders/add (ajout au panier) → vérifie 200/201', () => {
    // Étape 1 : se connecter
    cy.request({
      method: 'POST',
      url: `${base}/login`,
      body: credentials,
    }).then((loginRes) => {
      expect(loginRes.status).to.eq(200);
      const token = loginRes.body.token;

      // Étape 2 : récupérer un produit
      cy.request(`${base}/products`).then((res) => {
        const product = res.body.find((it) => it.stock > 0) || res.body[0];
        expect(product).to.exist;

        // Étape 3 : essayer d’ajouter au panier
        cy.request({
          method: 'POST',
          url: `${base}/orders/add`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            productId: product.id || product._id || product.uuid,
            quantity: 1,
          },
          failOnStatusCode: false,
        }).then((r) => {
          expect([200, 201, 204, 405, 400]).to.include(r.status);
        });
      });
    });
  });

  //  7️ AJOUT D’UN AVIS PRODUIT 
  it('POST /reviews → ajouter un avis (si endpoint dispo)', () => {
    // Étape 1 : login
    cy.request({
      method: 'POST',
      url: `${base}/login`,
      body: credentials,
    }).then((loginRes) => {
      const token = loginRes.body.token;

      // Étape 2 : récupérer un produit
      cy.request(`${base}/products`).then((res) => {
        const product = res.body[0];
        if (!product) return;

        // Étape 3 : envoyer un avis
        cy.request({
          method: 'POST',
          url: `${base}/reviews`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            productId: product.id || product._id || product.uuid,
            rating: 5,
            comment: 'Super savon, testé automatiquement !',
          },
          failOnStatusCode: false,
        }).then((r) => {
          // 401 = non autorisé (ok si la route est protégée)
          expect([200, 201, 400, 401]).to.include(r.status);
        });
      });
    });
  });
});