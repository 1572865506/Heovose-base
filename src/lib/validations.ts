import { z } from 'zod';

// 1. User Creation/Update Schema (Standard frontend profile)
export const userSchema = z.object({
  email: z.string().email('Invalid email format').max(150, 'Email is too long'),
  displayName: z.string().max(100, 'Display name is too long').optional().nullable(),
  role: z.enum(['editor', 'superadmin']).default('editor'),
}).strict();

// 1.1 Admin User Management Create Schema
export const createAdminUserSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email format').max(150),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['editor', 'superadmin']).default('editor'),
  permissions: z.array(z.string().max(100)).optional(),
}).strict();

// 1.2 Admin User Management Update Schema
export const updateAdminUserSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email format').max(150).optional(),
  password: z.string().min(6).max(100).optional().nullable(),
  role: z.enum(['editor', 'superadmin']).optional(),
  permissions: z.array(z.string().max(100)).optional(),
}).strict();

// 2. Product Schema
export const productSchema = z.object({
  id: z.string().min(1).max(50),
  nameTextId: z.string().max(100).optional().nullable(),
  descriptionTextId: z.string().max(100).optional().nullable(),
  categoryId: z.string().max(50).optional().nullable(),
  mainImageUrl: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  galleryImageUrls: z.array(z.string().max(500)).optional(),
  status: z.enum(['published', 'draft']).default('published'),
  enabledLanguages: z.array(z.string().max(10)).optional(),
  specGroups: z.any().optional(), // JSON is complex, validated partially or allowed
  localizedDetails: z.record(z.string(), z.string()).optional(),
  advantageTextIds: z.array(z.string().max(100)).optional(),
  galleryImageBrightnesses: z.array(z.number()).optional(),
  mainImageBrightness: z.number().optional().nullable(),
  updatedAt: z.string().optional().nullable() // concurrency control timestamp
});

// 3. Map Location Schema
export const mapLocationSchema = z.object({
  type: z.string().max(50),
  titleZh: z.string().max(200),
  titleEn: z.string().max(200),
  addressZh: z.string().max(300),
  addressEn: z.string().max(300),
  descZh: z.string().max(500),
  descEn: z.string().max(500),
  imageUrl: z.string().max(500).optional().nullable(),
  countryCode: z.string().max(10).optional().nullable(),
  posTop: z.number().min(0).max(100),
  posLeft: z.number().min(0).max(100),
  order: z.number().int().default(0),
  titleTextId: z.string().max(100).optional().nullable(),
  addressTextId: z.string().max(100).optional().nullable(),
  descTextId: z.string().max(100).optional().nullable(),
});

// 4. Bento Item Schema
export const bentoItemSchema = z.object({
  titleZh: z.string().max(150),
  titleEn: z.string().max(150),
  tagZh: z.string().max(100),
  tagEn: z.string().max(100),
  imageUrl: z.string().max(500),
  linkUrl: z.string().max(500),
  gridSize: z.enum(['small', 'medium', 'large']).default('small'),
  order: z.number().int().default(0),
  linkType: z.enum(['category', 'custom']).default('custom'),
  categoryId: z.string().max(50).optional().nullable(),
}).strict();

// 5. Case Study Schema
export const caseStudySchema = z.object({
  titleZh: z.string().max(200),
  titleEn: z.string().max(200),
  tagZh: z.string().max(100),
  tagEn: z.string().max(100),
  descZh: z.string().max(500),
  descEn: z.string().max(500),
  imageUrl: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  linkUrl: z.string().max(500).optional().nullable(),
  order: z.number().int().default(0),
  tagTextId: z.string().max(100).optional().nullable(),
  titleTextId: z.string().max(100).optional().nullable(),
  descriptionTextId: z.string().max(100).optional().nullable(),
  published: z.boolean().default(true),
});

// 6. Spec Template Schema
export const specTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  specGroups: z.any(), // Array of groups
}).strict();

// 7. Production Step Schema
export const productionStepSchema = z.object({
  titleZh: z.string().max(150),
  titleEn: z.string().max(150),
  descZh: z.string().max(400),
  descEn: z.string().max(400),
  stepNumber: z.number().int(),
  titleTextId: z.string().max(100).optional().nullable(),
  descTextId: z.string().max(100).optional().nullable(),
});

// 8. Gallery Category Schema
export const galleryCategorySchema = z.object({
  nameZh: z.string().max(100),
  nameEn: z.string().max(100),
  order: z.number().int().default(0),
}).strict();

// 9. Gallery Asset Schema
export const galleryAssetSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().max(500),
  categoryId: z.string().max(50).optional().nullable(),
  fileName: z.string().max(300),
  fileSize: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  width: z.number().int().optional().nullable(),
  duration: z.number().optional().nullable(),
  thumbnailUrl: z.string().max(500).optional().nullable(),
  type: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  brightness: z.number().optional().nullable()
});
