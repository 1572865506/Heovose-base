
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// This script migrates the oversized homepageContent/main document 
// into separate documents for hero, video, and map.

async function migrate() {
  // We'll use the service account if available, or just try to connect to the local emulator if running
  // But since we are in the agent environment, we should probably use the Firebase Admin SDK 
  // with the project ID and let it use the ambient credentials.
  
  const projectId = 'studio-2861174726-dbace';
  
  initializeApp({
    projectId: projectId
  });

  const db = getFirestore();
  const mainRef = db.collection('homepageContent').doc('main');
  const mainDoc = await mainRef.get();

  if (!mainDoc.exists) {
    console.log('homepageContent/main does not exist. Nothing to migrate.');
    return;
  }

  const data = mainDoc.data() || {};
  console.log('Original document size (approx):', JSON.stringify(data).length, 'bytes');

  // 1. Hero Section
  const heroData = {
    heroSlides: data.heroSlides || [],
    heroHeadlineZh: data.heroHeadlineZh || '',
    heroHeadlineEn: data.heroHeadlineEn || '',
    heroSubheadlineZh: data.heroSubheadlineZh || '',
    heroSubheadlineEn: data.heroSubheadlineEn || '',
    heroWholesaleButtonZh: data.heroWholesaleButtonZh || '',
    heroWholesaleButtonEn: data.heroWholesaleButtonEn || '',
    heroProjectButtonZh: data.heroProjectButtonZh || '',
    heroProjectButtonEn: data.heroProjectButtonEn || '',
    heroWholesaleCategoryId: data.heroWholesaleCategoryId || '',
    heroProjectCategoryId: data.heroProjectCategoryId || '',
    updatedAt: new Date()
  };
  await db.collection('homepageContent').doc('hero').set(heroData);
  console.log('Migrated Hero data to homepageContent/hero');

  // 2. Video Section
  const videoData = {
    isVideoEnabled: data.isVideoEnabled ?? true,
    videoTitleZh: data.videoTitleZh || '',
    videoTitleEn: data.videoTitleEn || '',
    videoSubtitleZh: data.videoSubtitleZh || '',
    videoSubtitleEn: data.videoSubtitleEn || '',
    updatedAt: new Date()
  };
  await db.collection('homepageContent').doc('video').set(videoData);
  console.log('Migrated Video data to homepageContent/video');

  // 3. Map Section
  const mapData = {
    locations: data.locations || [],
    mapTitleZh: data.mapTitleZh || '',
    mapTitleEn: data.mapTitleEn || '',
    mapSubtitleZh: data.mapSubtitleZh || '',
    mapSubtitleEn: data.mapSubtitleEn || '',
    updatedAt: new Date()
  };
  await db.collection('homepageContent').doc('map').set(mapData);
  console.log('Migrated Map data to homepageContent/map');

  console.log('Migration complete!');
}

migrate().catch(console.error);
