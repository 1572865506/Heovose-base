
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function inspect() {
  const projectId = 'studio-2861174726-dbace';
  initializeApp({ projectId });
  const db = getFirestore();

  const collections = ['homepageContent', 'products', 'caseStudies', 'productCategories', 'productionSteps', 'localizedStrings'];
  
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    console.log(`Collection: ${col} - ${snapshot.size} documents`);
    snapshot.docs.slice(0, 3).forEach(doc => {
      console.log(`  ID: ${doc.id}`);
    });
  }
}

inspect().catch(console.error);
