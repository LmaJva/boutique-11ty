import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export default async function() {
  try {
    const response = await fetch(`${process.env.DATA_URL}settings.json`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! statut : ${response.status}`);
    }
    const data = await response.json();
    data.DATA_URL = process.env.DATA_URL;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des settings :', error);
    return [];
  }
};