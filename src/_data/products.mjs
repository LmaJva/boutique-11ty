import fetch from 'node-fetch';

export default async function() {
  try {
    const response = await fetch('https://brutdethe.github.io/boutique-11ty_data/products.json');
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