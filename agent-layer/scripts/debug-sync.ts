import { CalgarywellnessConnector } from '../src/connectors/index.js';
import path from 'path';

const dataDir = path.join(process.env.HOME || '', 'Desktop/Code/Calgarywellness/calgarywellness/data');
const conn = new CalgarywellnessConnector(dataDir);

async function main() {
  try {
    const places = await conn.fetchAll();
    console.log('Fetched:', places.length, 'places');
    if (places.length > 0) {
      console.log('First place:', places[0].name);
      console.log('Province:', places[0].province);
      console.log('City:', places[0].city);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
