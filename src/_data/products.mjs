import fetch from 'node-fetch';

export default async function() {
  try {
    const response = await fetch('http://localhost:8080/products.json');
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! statut : ${response.status}`);
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    return [];
  }
};