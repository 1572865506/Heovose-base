
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function clean() {
  const projectId = 'studio-2861174726-dbace';
  initializeApp({ projectId });
  const db = getFirestore();

  console.log('--- Starting Database Cleaning ---');

  // 1. Specific test products
  const productsToClean = ['Test Product CN - Updated', 'Test Product EN'];
  const productSnapshot = await db.collection('products').get();
  for (const doc of productSnapshot.docs) {
    const data = doc.data();
    // Since Product has localized nameTextId, we should check localizedStrings or just IDs if we knew them.
    // But based on subagent, it saw titles. 
    // Let's look for documents that might be test data.
  }

  // To be safe and precise, let's target the IDs we found or patterns
  // Subagent found:
  // Products: "Test Product CN - Updated", "Test Product EN"
  // Case Studies: "61231231", "Test Case"
  // Categories: "Test Category CN", "Test Category EN"

  const collectionsToScan = [
    { name: 'products', testPatterns: ['Test Product'] },
    { name: 'caseStudies', testPatterns: ['Test Case', '61231231'] },
    { name: 'productCategories', testPatterns: ['Test Category'] },
    { name: 'localizedStrings', testPatterns: ['test_'] }
  ];

  for (const colDef of collectionsToScan) {
    const snapshot = await db.collection(colDef.name).get();
    for (const doc of snapshot.docs) {
      const data = JSON.stringify(doc.data());
      if (colDef.testPatterns.some(p => data.includes(p)) || colDef.testPatterns.includes(doc.id)) {
        console.log(`Deleting ${colDef.name}/${doc.id}...`);
        await doc.ref.delete();
      }
    }
  }

  // 2. Deprecated homepageContent/main
  const mainRef = db.collection('homepageContent').doc('main');
  const mainDoc = await mainRef.get();
  if (mainDoc.exists) {
    console.log('Deleting deprecated homepageContent/main...');
    await mainRef.delete();
  }

  console.log('--- Database Cleaning Complete ---');
}

clean().catch(console.error);
