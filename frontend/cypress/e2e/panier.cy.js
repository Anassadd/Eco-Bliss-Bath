describe(" Tests du panier - API Eco Bliss Bath", () => {

  const baseUrl = "http://localhost:8081";
  const username = "test2025@gmail.com";  
  const password = "Test2025?";        

  // Connexion avant chaque test
  
  beforeEach(() => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: { username, password }
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.wrap(response.body.token).as("token");
    });
  });

  // 1️ Ajout d’un produit disponible
  it("Ajoute un produit disponible au panier (status 200 attendu)", function () {
    cy.request({
      method: "PUT", 
      url: `${baseUrl}/orders/add`,
      headers: { Authorization: `Bearer ${this.token}` },
      body: { product: 3, quantity: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200); 
    });
  });

  
  // 2️ Produit en rupture de stock
    it("Retourne une erreur si le produit est en rupture de stock (409 attendu)", function () {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/orders/add`,
      headers: { Authorization: `Bearer ${this.token}` },
      body: { product: 3, quantity: 100 },
      failOnStatusCode: false
    }).then((response) => {
      //  anomalie connue : l’API renvoie 200 au lieu de 409
      if (response.status === 200) {
        cy.log(" Anomalie : l’API accepte l’ajout d’un produit en rupture de stock");
      }
      expect(response.status).to.eq(409);
    });
  });


    // 3️ Quantité négative
     it("Refuse une quantité négative (400/422 attendu)", function () {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/orders/add`,
      headers: { Authorization: `Bearer ${this.token}` },
      body: { product: 3, quantity: -2 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]); 
    });
  });

  
  // 4️ Quantité supérieure à 20
  it("Refuse une quantité supérieure à 20 (400/422 attendu)", function () {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/orders/add`,
      headers: { Authorization: `Bearer ${this.token}` },
      body: { product: 3, quantity: 21 },
      failOnStatusCode: false
    }).then((response) => {
      //  anomalie connue : renvoie parfois 200
      if (response.status === 200) {
        cy.log(" Anomalie : l’API n’impose pas de limite de quantité.");
      }
      expect(response.status).to.be.oneOf([400, 422]);
    });
  });

  
  // 5️ Vérification du contenu du panier
  it("Vérifie que le produit ajouté est bien présent dans le panier", function () {
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders`,
      headers: { Authorization: `Bearer ${this.token}` },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.orderLines).to.be.an("array").and.not.be.empty;
      expect(response.body.orderLines[0]).to.have.property("product");
      expect(response.body.orderLines[0]).to.have.property("quantity");
    });
  });
});