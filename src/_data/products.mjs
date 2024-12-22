import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export default async function() {
  try {
    const response = await fetch(process.env.DATA_URL);
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