--
-- PostgreSQL database dump
--

\restrict zvokvdoTfLbZ2mNb6mFip2g4dhvR97ibZMxEjU0deDEmNJ0WrRRmv0PI3Yegcr0

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: heovose
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO heovose;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: heovose
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."Account" (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Account" OWNER TO heovose;

--
-- Name: CaseStudy; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."CaseStudy" (
    id text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "tagZh" text NOT NULL,
    "tagEn" text NOT NULL,
    "titleZh" text NOT NULL,
    "titleEn" text NOT NULL,
    "descZh" text NOT NULL,
    "descEn" text NOT NULL,
    "imageUrl" text NOT NULL
);


ALTER TABLE public."CaseStudy" OWNER TO heovose;

--
-- Name: GalleryAsset; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."GalleryAsset" (
    id text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    "categoryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer,
    height integer,
    width integer,
    duration double precision,
    "thumbnailUrl" text,
    type text DEFAULT 'IMAGE'::text NOT NULL
);


ALTER TABLE public."GalleryAsset" OWNER TO heovose;

--
-- Name: GalleryCategory; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."GalleryCategory" (
    id text NOT NULL,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "parentId" text
);


ALTER TABLE public."GalleryCategory" OWNER TO heovose;

--
-- Name: HomepageBentoItem; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."HomepageBentoItem" (
    id text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "titleZh" text NOT NULL,
    "titleEn" text NOT NULL,
    "tagZh" text,
    "tagEn" text,
    "imageUrl" text NOT NULL,
    "linkUrl" text,
    "gridSize" text DEFAULT 'small'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageBentoItem" OWNER TO heovose;

--
-- Name: HomepageContent; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."HomepageContent" (
    id text DEFAULT 'hero'::text NOT NULL,
    "heroHeadlineEn" text,
    "heroHeadlineZh" text,
    "heroSubheadlineEn" text,
    "heroSubheadlineZh" text,
    "heroWholesaleButtonEn" text,
    "heroWholesaleButtonZh" text,
    "heroProjectButtonEn" text,
    "heroProjectButtonZh" text,
    "heroWholesaleCategoryId" text,
    "heroProjectCategoryId" text,
    "isVideoEnabled" boolean DEFAULT true NOT NULL,
    "videoTitleEn" text,
    "videoTitleZh" text,
    "videoSubtitleEn" text,
    "videoSubtitleZh" text,
    "mapTitleEn" text,
    "mapTitleZh" text,
    "mapSubtitleEn" text,
    "mapSubtitleZh" text,
    "heroProjectDescriptionEn" text,
    "heroProjectDescriptionZh" text,
    "heroSlides" jsonb,
    "heroWholesaleDescriptionEn" text,
    "heroWholesaleDescriptionZh" text,
    "videoUrl" text,
    "heroProjectBg" text,
    "heroWholesaleBg" text,
    "bentoSubtitleEn" text,
    "bentoSubtitleZh" text,
    "bentoTitleEn" text,
    "bentoTitleZh" text,
    "processSubtitleEn" text,
    "processSubtitleZh" text,
    "processTitleEn" text,
    "processTitleZh" text,
    "gallerySubtitleEn" text,
    "gallerySubtitleZh" text,
    "galleryTitleEn" text,
    "galleryTitleZh" text
);


ALTER TABLE public."HomepageContent" OWNER TO heovose;

--
-- Name: LocalizedString; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."LocalizedString" (
    id text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LocalizedString" OWNER TO heovose;

--
-- Name: MapLocation; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."MapLocation" (
    id text NOT NULL,
    type text NOT NULL,
    "titleZh" text NOT NULL,
    "titleEn" text NOT NULL,
    "addressZh" text NOT NULL,
    "addressEn" text NOT NULL,
    "descZh" text NOT NULL,
    "descEn" text NOT NULL,
    "imageUrl" text,
    "posTop" text NOT NULL,
    "posLeft" text NOT NULL,
    "homepageId" text NOT NULL
);


ALTER TABLE public."MapLocation" OWNER TO heovose;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "nameTextId" text NOT NULL,
    "categoryId" text,
    "advantageTextIds" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "descriptionTextId" text,
    "enabledLanguages" text[],
    "galleryImageUrls" text[],
    "localizedDetails" jsonb,
    "mainImageUrl" text,
    "specGroups" jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO heovose;

--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    slug text NOT NULL,
    "thumbnailImageUrl" text,
    "parentId" text,
    "nameTextId" text NOT NULL,
    "descriptionTextId" text,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ProductCategory" OWNER TO heovose;

--
-- Name: ProductionStep; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."ProductionStep" (
    id text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "titleZh" text NOT NULL,
    "titleEn" text NOT NULL,
    "descZh" text NOT NULL,
    "descEn" text NOT NULL,
    "imageUrls" text[]
);


ALTER TABLE public."ProductionStep" OWNER TO heovose;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."Session" (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO heovose;

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."Setting" (
    id text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public."Setting" OWNER TO heovose;

--
-- Name: SpecTemplate; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."SpecTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    "specGroups" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SpecTemplate" OWNER TO heovose;

--
-- Name: User; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role text DEFAULT 'editor'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO heovose;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO heovose;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO heovose;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Account" ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CaseStudy; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."CaseStudy" (id, "order", "tagZh", "tagEn", "titleZh", "titleEn", "descZh", "descEn", "imageUrl") FROM stdin;
cmoibfi3k000buknut5a5e8tx	1	智慧零售	RETAIL	智能 POS 集成方案	Smart POS Integration	优化 500 多家门店的结账体验。	Optimizing checkout experiences across 500+ stores.	https://placehold.co/800x600?text=Retail+Case
\.


--
-- Data for Name: GalleryAsset; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."GalleryAsset" (id, title, url, "categoryId", "createdAt", "fileName", "fileSize", height, width, duration, "thumbnailUrl", type) FROM stdin;
asset_1777367981154_0	这是一个一体机电脑产品，帮我生成一张使用场景的场景图_202604151453	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	cat_1777363045711	2026-04-28 09:19:21.635	uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	626021	\N	\N	\N	\N	IMAGE
asset_1777433984930_0	里面的笔记本电脑就换成图1，图2这个笔记本_2K_202604160904	http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	cat_1777363045711	2026-04-29 03:39:24.956	uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	409429	\N	\N	\N	\N	IMAGE
asset_1777433985864_1	Project Product-1	http://localhost:9000/heovose-assets/uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	cat_1777363045711	2026-04-29 03:39:25.769	uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	148092	\N	\N	\N	\N	IMAGE
asset_1777433986677_2	Project Product-2	http://localhost:9000/heovose-assets/uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	cat_1777363045711	2026-04-29 03:39:26.697	uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	149750	\N	\N	\N	\N	IMAGE
asset_1777433987620_3	Wholesale Product	http://localhost:9000/heovose-assets/uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	cat_1777363045711	2026-04-29 03:39:47.95	uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	120752	\N	\N	\N	\N	IMAGE
asset_1777439484026_6	7	http://localhost:9000/heovose-assets/uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	cat_1777439509227	2026-04-29 05:11:03.825	uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	186134	\N	\N	\N	\N	IMAGE
asset_1777439480942_3	4	http://localhost:9000/heovose-assets/uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	cat_1777439509227	2026-04-29 05:11:21.274	uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	174062	\N	\N	\N	\N	IMAGE
asset_1777439479065_1	2	http://localhost:9000/heovose-assets/uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	cat_1777439509227	2026-04-29 05:11:19.407	uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	175650	\N	\N	\N	\N	IMAGE
asset_1777439481828_4	5	http://localhost:9000/heovose-assets/uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	cat_1777439509227	2026-04-29 05:11:22.408	uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	230501	\N	\N	\N	\N	IMAGE
asset_1777439483111_5	6	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	cat_1777439509227	2026-04-29 05:11:02.812	uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	409595	\N	\N	\N	\N	IMAGE
asset_1777439479940_2	3	http://localhost:9000/heovose-assets/uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	cat_1777439509227	2026-04-29 05:11:20.387	uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	240459	\N	\N	\N	\N	IMAGE
asset_1777439478092_0	1	http://localhost:9000/heovose-assets/uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	cat_1777439509227	2026-04-29 05:11:18.522	uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	190446	\N	\N	\N	\N	IMAGE
asset_1777439485065_7	8	http://localhost:9000/heovose-assets/uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	cat_1777439509227	2026-04-29 05:11:04.767	uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	182281	\N	\N	\N	\N	IMAGE
asset_1777439647319_0	2	http://localhost:9000/heovose-assets/uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	cat_1777439615716	2026-04-29 05:13:47.12	uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	160258	\N	\N	\N	\N	IMAGE
asset_1777439648403_1	3	http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	cat_1777439615716	2026-04-29 05:13:48.107	uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	162211	\N	\N	\N	\N	IMAGE
asset_1777439649230_2	4+	http://localhost:9000/heovose-assets/uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	cat_1777439615716	2026-04-29 05:13:49.021	uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	55232	\N	\N	\N	\N	IMAGE
asset_1777439650261_3	5	http://localhost:9000/heovose-assets/uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	cat_1777439615716	2026-04-29 05:13:49.944	uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	56115	\N	\N	\N	\N	IMAGE
asset_1777439651171_4	6	http://localhost:9000/heovose-assets/uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	cat_1777439615716	2026-04-29 05:13:50.95	uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	141463	\N	\N	\N	\N	IMAGE
asset_1777439652265_5	7	http://localhost:9000/heovose-assets/uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	cat_1777439615716	2026-04-29 05:14:12.599	uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	95362	\N	\N	\N	\N	IMAGE
asset_1777439653179_6	8	http://localhost:9000/heovose-assets/uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	cat_1777439615716	2026-04-29 05:14:13.624	uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	141021	\N	\N	\N	\N	IMAGE
asset_1777439654287_7	9	http://localhost:9000/heovose-assets/uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	cat_1777439615716	2026-04-29 05:14:14.609	uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	74627	\N	\N	\N	\N	IMAGE
asset_1777439655277_8	10	http://localhost:9000/heovose-assets/uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	cat_1777439615716	2026-04-29 05:13:56.376	uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	302898	\N	\N	\N	\N	IMAGE
asset_1777439656696_9	12	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	cat_1777439615716	2026-04-29 05:13:57.39	uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	214659	\N	\N	\N	\N	IMAGE
asset_1777448722825_ywqq1_0	MINI-PC-P-1	http://localhost:9000/heovose-assets/uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	cat_1777433109728	2026-04-29 07:45:24.644	uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	108510	900	1100	\N	\N	IMAGE
asset_1777448725091_e2jyo_1	MINI-PC-P-2	http://localhost:9000/heovose-assets/uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	cat_1777433109728	2026-04-29 07:45:25.551	uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	138300	900	1100	\N	\N	IMAGE
asset_1777448725958_dibm2_2	MINI-PC-P-3	http://localhost:9000/heovose-assets/uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	cat_1777433109728	2026-04-29 07:45:26.293	uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	135571	900	1100	\N	\N	IMAGE
asset_1777448726694_4lxgr_3	MINI-PC-P-4	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	cat_1777433109728	2026-04-29 07:45:27.115	uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	123066	900	1100	\N	\N	IMAGE
asset_1777448727513_ptx4a_4	MINI-PC-P-5	http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	cat_1777433109728	2026-04-29 07:45:27.837	uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	131588	900	1100	\N	\N	IMAGE
asset_1777448728217_q9vv7_5	MINI-PC-P-6	http://localhost:9000/heovose-assets/uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	cat_1777433109728	2026-04-29 07:45:28.628	uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	112783	900	1100	\N	\N	IMAGE
asset_1777448729015_xnnhf_6	MINI-PC-P-7	http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	cat_1777433109728	2026-04-29 07:45:29.336	uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	114772	900	1100	\N	\N	IMAGE
asset_1777864944226_q9ko0_0	alibaba2023_x264	http://localhost:9000/heovose-assets/uploads/0af8547d-8b02-4615-ba22-59b3af72e7b3.mp4	cat_1777363045711	2026-05-04 03:22:01.499	uploads/0af8547d-8b02-4615-ba22-59b3af72e7b3.mp4	5294946	1080	1920	13.546667	\N	VIDEO
asset_1777865670277_vhy6j_0	1-1	http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg	cat_1777856782910	2026-05-04 03:34:06.167	uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg	352788	1792	2400	\N	\N	IMAGE
asset_1777865671144_h08ot_1	2-2	http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	cat_1777856782910	2026-05-04 03:34:06.911	uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	310293	1792	2400	\N	\N	IMAGE
asset_1777865671890_gl0an_2	3-1	http://localhost:9000/heovose-assets/uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg	cat_1777856782910	2026-05-04 03:34:07.731	uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg	555093	1792	2400	\N	\N	IMAGE
asset_1777865672716_qxpao_3	4-1	http://localhost:9000/heovose-assets/uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	cat_1777856782910	2026-05-04 03:34:08.474	uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	586300	1792	2400	\N	\N	IMAGE
asset_1777865673431_fk2gc_4	4-2	http://localhost:9000/heovose-assets/uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg	cat_1777856782910	2026-05-04 03:34:09.289	uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg	318675	627	901	\N	\N	IMAGE
asset_1777865674262_u8v16_5	5-1	http://localhost:9000/heovose-assets/uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg	cat_1777856782910	2026-05-04 03:34:10.008	uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg	299834	1125	1500	\N	\N	IMAGE
asset_1777865674969_e60nw_6	5-2	http://localhost:9000/heovose-assets/uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg	cat_1777856782910	2026-05-04 03:34:10.787	uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg	343537	801	1200	\N	\N	IMAGE
asset_1777865675740_6m9gw_7	6-1	http://localhost:9000/heovose-assets/uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg	cat_1777856782910	2026-05-04 03:34:11.48	uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg	243513	1200	900	\N	\N	IMAGE
asset_1777865733016_wzmi7_0	2-1	http://localhost:9000/heovose-assets/uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	cat_1777856782910	2026-05-04 03:35:08.707	uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	267782	1080	1620	\N	\N	IMAGE
asset_1777439296324_0	2-1	http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	cat_1777856782910	2026-04-29 05:08:16.776	uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	267782	\N	\N	\N	\N	IMAGE
asset_1777967239460_sk87r_0	一体机宣传海报	http://localhost:9000/heovose-assets/uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg	cat_1777363045711	2026-05-05 07:46:55.987	uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg	279781	1536	2752	\N	\N	IMAGE
asset_1777968533975_xlq7y_0	Image 3	http://localhost:9000/heovose-assets/uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg	cat_1777363045711	2026-05-05 08:08:29.02	uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg	648935	2143	3840	\N	\N	IMAGE
\.


--
-- Data for Name: GalleryCategory; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."GalleryCategory" (id, name, "order", "parentId") FROM stdin;
cmoibfi3u000duknufk1cj48i	Product Photos	1	\N
cat_1777363045711	首页素材	2	\N
cat_1777433109728	小主机	4	cmoibfi3u000duknufk1cj48i
cat_1777432848923	一体机电脑	2	cmoibfi3u000duknufk1cj48i
cat_1777432859919	笔记本电脑	3	cmoibfi3u000duknufk1cj48i
cat_1777439509227	新K2款	1	cat_1777432848923
cat_1777439615716	156宏碁款	1	cat_1777432859919
cat_1777856782910	生产流程	1	cat_1777363045711
\.


--
-- Data for Name: HomepageBentoItem; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."HomepageBentoItem" (id, "order", "titleZh", "titleEn", "tagZh", "tagEn", "imageUrl", "linkUrl", "gridSize", "createdAt", "updatedAt") FROM stdin;
cmotm03ar0001ukpw6epm8ifq	1	一体机电脑	All-In-One PC			http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	products?category=aio	large	2026-05-06 05:21:01.106	2026-05-06 07:12:06.821
cmotlyork0000ukpwy7tydtim	2	小主机	Mini PC			http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	products?category=minipc	wide	2026-05-06 05:19:55.615	2026-05-06 07:12:06.821
cmotmqkwq0002ukpwqqnjph4a	3	笔记本电脑	Notebook			http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	products?category=notebook	small	2026-05-06 05:41:36.986	2026-05-06 07:12:06.821
cmotn71fa0005ukpwe6rnf8cc	4	工业一体机				http://localhost:9000/heovose-assets/uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	products?category=industrial	large	2026-05-06 05:54:24.885	2026-05-06 07:12:06.821
cmotn04vj0004ukpwxydympu1	5	会议平板	Whiteboard			http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	products?category=whiteboard	wide	2026-05-06 05:49:02.766	2026-05-06 07:12:06.821
cmotnd8br0006ukpwxydqkv9o	6	核心配件	Core Components	批发业务	Wholesale	http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	products?category=core	tall	2026-05-06 05:59:13.746	2026-05-06 07:12:06.821
cmotmy04s0003ukpwrv11j33q	7	显示器	Monitor			http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	products?category=monitor	tall	2026-05-06 05:47:23.307	2026-05-06 07:12:06.821
\.


--
-- Data for Name: HomepageContent; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."HomepageContent" (id, "heroHeadlineEn", "heroHeadlineZh", "heroSubheadlineEn", "heroSubheadlineZh", "heroWholesaleButtonEn", "heroWholesaleButtonZh", "heroProjectButtonEn", "heroProjectButtonZh", "heroWholesaleCategoryId", "heroProjectCategoryId", "isVideoEnabled", "videoTitleEn", "videoTitleZh", "videoSubtitleEn", "videoSubtitleZh", "mapTitleEn", "mapTitleZh", "mapSubtitleEn", "mapSubtitleZh", "heroProjectDescriptionEn", "heroProjectDescriptionZh", "heroSlides", "heroWholesaleDescriptionEn", "heroWholesaleDescriptionZh", "videoUrl", "heroProjectBg", "heroWholesaleBg", "bentoSubtitleEn", "bentoSubtitleZh", "bentoTitleEn", "bentoTitleZh", "processSubtitleEn", "processSubtitleZh", "processTitleEn", "processTitleZh", "gallerySubtitleEn", "gallerySubtitleZh", "galleryTitleEn", "galleryTitleZh") FROM stdin;
video	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	http://localhost:9000/heovose-assets/uploads/0af8547d-8b02-4615-ba22-59b3af72e7b3.mp4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
bento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Explore our diverse product range	探索我们的多元化产品系列	\N	\N	\N	\N	\N	\N	\N	\N
hero	Elevate Your Digital Horizon	提升您的数字视野	Next-Generation Hardware Solutions for Global Enterprises	面向全球企业的下一代硬件解决方案	Wholesale Products	批发产品	Project Products	项目产品	WHOLESALE	PROJECT	t	Our Craftsmanship	我们的工艺	\N	\N	Global Footprint	全球足迹	\N	\N	\N	\N	[{"id": "legacy-default", "bgImage": "http://localhost:9000/heovose-assets/uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg", "priority": 0, "headlineEn": "Elevate Your Digital Horizon", "headlineZh": "提升您的数字视野", "subheadlineEn": "Next-generation hardware solutions for global enterprises", "subheadlineZh": "面向全球企业的下一代硬件解决方案"}, {"id": "slide_1777967445203", "bgImage": "http://localhost:9000/heovose-assets/uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg", "priority": 1, "headlineEn": "F9-S Series All-in-one PC", "headlineZh": "F9-S系列 一体机电脑", "subheadlineEn": "Base supports lifting, lowering, and rotation, with brightness adjustment and a pop-up camera.", "subheadlineZh": "底座支撑升降旋转，支持亮度调节，弹出式摄像头"}]	\N	\N	\N	http://localhost:9000/heovose-assets/uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	http://localhost:9000/heovose-assets/uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
gallery	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	New Product	最新产品
\.


--
-- Data for Name: LocalizedString; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."LocalizedString" (id, content, "createdAt", "updatedAt") FROM stdin;
cat_desc_PROJECT	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_1_0	{"en": "Product Dimensions", "id": "", "zh": "产品尺寸"}	2026-05-05 02:11:57.117	2026-05-05 03:17:00.967
prod_desc_cmoibfi320007uknu4dcvlfch	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_AIO_0504_987C_2	{"en": "Expansion Parameters", "id": "Parameter Ekspansi", "zh": "扩展参数"}	2026-05-05 02:11:57.117	2026-05-05 03:26:45.71
psg_PROD_AIO_0504_987C_1	{"en": "Physical Parameters", "id": "Parameter Fisik", "zh": "物理参数"}	2026-05-05 02:11:57.117	2026-05-05 03:22:34.501
cmoibfi2o0001uknuisfb5oa2	{"en": "High-Performance Mini PC", "zh": "高性能迷你主机"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_1_1	{"en": "Material", "id": "TEST_ID_VALUE", "zh": "材质"}	2026-05-05 02:11:57.117	2026-05-05 03:24:30.107
psl_PROD_AIO_0504_987C_1_2	{"en": "Color", "zh": "颜色"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_KIOSK_0505_E0XK_1	{"en": "", "zh": "物理参数"}	2026-05-05 05:09:49.855	2026-05-05 05:09:49.855
psv_PROD_AIO_0504_987C_0_9	{"en": "HD Audio Codec; Stereo Speakers", "zh": "高清音频编解码器; 立体声扬声器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cmoibfi2r0002uknurlgkgzym	{"en": "Curved Gaming Monitor", "zh": "曲面电竞显示器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_WHOLESALE	{"en": "Wholesale Products", "zh": "批发产品"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_WHOLESALE	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_AWE	{"en": "1fwqwe", "zh": "噶而且我"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_AWE	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_NOTEBOOK	{"en": "", "zh": ""}	2026-05-05 02:11:57.117	2026-05-06 05:02:31.081
cat_name_MINIPC	{"en": "MINI PC", "zh": "小主机"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_MINIPC	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
core_advantages	{"en": "Core Advantages", "zh": "核心优势"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_WHITEBOARD	{"en": "WhiteBoard", "zh": "会议平板"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_WHITEBOARD	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_AIO	{"en": "AIO & Semi-finished", "zh": "电脑一体机及半成品"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_AIO	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_CORE	{"en": "Core Components", "zh": "核心配件"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_CORE	{"en": "Motherboard, Memory, CPU, Hard Drive, Graphics Card", "zh": "主板、内存、CPU、硬盘、显卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_MONITOR	{"en": "Monitor", "zh": "显示器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_MONITOR	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_ESSENTIALS	{"en": "PC Components", "zh": "装机配件"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_ESSENTIALS	{"en": "Chassis, Power Supply, Heatsink", "zh": "机箱、电源、散热器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_desc_PROD_AIO_0504_0LBT	{"zh": "23.8 英寸可选电容触摸屏；\\n可选安装摄像头（位于屏幕下方）；"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_KIOSK	{"en": "KIOSK / Self-service", "zh": "自助设备"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_KIOSK	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_INDUSTRIAL	{"en": "Industrial All-in-One PC", "zh": "工业一体机"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_INDUSTRIAL	{"en": "Industrial All-in-One PC, Industrial Touch Display", "zh": "工业一体机、工业触摸显示器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_LED	{"en": "LED Projects", "zh": "LED工程"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_LED	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_SHOWROOM	{"en": "Showroom Projects", "zh": "展厅商显工程"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_desc_SHOWROOM	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
cat_name_PROJECT	{"en": "Project Products", "zh": "项目产品"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_AIO_0504_987C_3	{"en": "Connectivity Parameters", "zh": "连接参数"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_AIO_0504_987C_4	{"en": "Packaging (1 Unit)", "zh": "包装（1台）"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_noSubCategories	{"en": "No sub-categories defined", "zh": "未定义子分类"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_5	{"en": "4GB / 8GB / 16GB / 32GB", "zh": "4GB / 8GB / 16GB / 32GB"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_10	{"en": "Compatible with Win7/Win10/Win11", "zh": "兼容Win7/Win10/Win11"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_1_0	{"en": "19-inch: 433(W)× 286(S)× 355(H) mm\\n21.5-inch: 491(W)× 294(S)× 363(H) mm\\n23.8-inch: 540(W)× 321(S)× 410(H) mm\\n27-inch: -", "zh": "19英寸：433(W)× 286(S)× 355(H) mm\\n21.5英寸：491(W)× 294(S)× 363(H) mm\\n23.8英寸：540(W)× 321(S)× 410(H) mm\\n27英寸：-"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_AIO_0504_987C_0	{"en": "General Parameters", "id": "Parameter Umum", "zh": "常规参数"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psg_PROD_KIOSK_0505_E0XK_2	{"en": "", "zh": "扩展参数"}	2026-05-05 05:09:49.864	2026-05-05 05:09:49.864
psg_PROD_KIOSK_0505_E0XK_4	{"en": "", "zh": "包装（1台）"}	2026-05-05 05:09:49.868	2026-05-05 05:09:49.868
psl_PROD_KIOSK_0505_E0XK_0_0	{"en": "", "zh": "型号"}	2026-05-05 05:09:50.664	2026-05-05 05:09:50.664
psl_PROD_KIOSK_0505_E0XK_0_4	{"en": "", "zh": "CPU"}	2026-05-05 05:09:50.667	2026-05-05 05:09:50.667
psl_PROD_KIOSK_0505_E0XK_0_3	{"en": "", "zh": "分辨率"}	2026-05-05 05:09:50.668	2026-05-05 05:09:50.668
psl_PROD_KIOSK_0505_E0XK_0_6	{"en": "", "zh": "固态硬盘"}	2026-05-05 05:09:51.337	2026-05-05 05:09:51.337
psl_PROD_KIOSK_0505_E0XK_0_8	{"en": "", "zh": "显卡"}	2026-05-05 05:09:51.351	2026-05-05 05:09:51.351
psl_PROD_KIOSK_0505_E0XK_0_9	{"en": "", "zh": "多媒体"}	2026-05-05 05:09:51.352	2026-05-05 05:09:51.352
psl_PROD_KIOSK_0505_E0XK_2_0	{"en": "", "zh": "摄像头"}	2026-05-05 05:09:52.221	2026-05-05 05:09:52.221
psl_PROD_KIOSK_0505_E0XK_3_1	{"en": "", "zh": "WIFI"}	2026-05-05 05:09:52.222	2026-05-05 05:09:52.222
psl_PROD_KIOSK_0505_E0XK_3_2	{"en": "", "zh": "蓝牙"}	2026-05-05 05:09:53.058	2026-05-05 05:09:53.058
psl_PROD_KIOSK_0505_E0XK_3_3	{"en": "", "zh": "底部接口"}	2026-05-05 05:09:53.073	2026-05-05 05:09:53.073
psl_PROD_KIOSK_0505_E0XK_4_0	{"en": "", "zh": "附件清单"}	2026-05-05 05:09:53.076	2026-05-05 05:09:53.076
psl_PROD_KIOSK_0505_E0XK_4_1	{"en": "", "zh": "包装尺寸"}	2026-05-05 05:09:53.077	2026-05-05 05:09:53.077
psl_PROD_KIOSK_0505_E0XK_4_2	{"en": "", "zh": "重量"}	2026-05-05 05:09:53.077	2026-05-05 05:09:53.077
psv_PROD_KIOSK_0505_E0XK_0_0	{"en": "", "zh": "K2"}	2026-05-05 05:09:53.121	2026-05-05 05:09:53.121
psv_PROD_KIOSK_0505_E0XK_0_2	{"en": "", "zh": "23.8英寸可选电容触摸屏"}	2026-05-05 05:09:54.105	2026-05-05 05:09:54.105
psv_PROD_KIOSK_0505_E0XK_0_4	{"en": "", "zh": "英特尔 酷睿 i3、i5、i7\\n英特尔 赛扬\\n英特尔 奔腾"}	2026-05-05 05:09:54.108	2026-05-05 05:09:54.108
psv_PROD_KIOSK_0505_E0XK_0_1	{"en": "", "zh": "19英寸、21.5英寸、23.8英寸、27英寸"}	2026-05-05 05:09:54.109	2026-05-05 05:09:54.109
psv_PROD_KIOSK_0505_E0XK_0_3	{"en": "", "zh": "19英寸：1440×900（16:10）\\n19/23.8/27英寸：1920×1080（16:9）"}	2026-05-05 05:09:54.11	2026-05-05 05:09:54.11
psv_PROD_KIOSK_0505_E0XK_0_5	{"en": "", "zh": "4GB / 8GB / 16GB / 32GB"}	2026-05-05 05:09:54.11	2026-05-05 05:09:54.11
psv_PROD_KIOSK_0505_E0XK_0_6	{"en": "", "zh": "64GB / 128GB / 256GB / 512GB / 1TB"}	2026-05-05 05:09:54.115	2026-05-05 05:09:54.115
psv_PROD_KIOSK_0505_E0XK_0_7	{"en": "", "zh": "500GB / 1TB / 2TB"}	2026-05-05 05:09:54.765	2026-05-05 05:09:54.765
psl_PROD_AIO_0504_987C_0_0	{"en": "Model", "zh": "型号"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_4_0	{"en": "Accessory List", "zh": "附件清单"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_4_2	{"en": "Weight", "zh": "重量"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_0	{"en": "K2", "zh": "K2"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_1	{"en": "19-inch, 21.5-inch, 23.8-inch, 27-inch", "zh": "19英寸、21.5英寸、23.8英寸、27英寸"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_4	{"en": "Intel Core i3, i5, i7\\nIntel Celeron\\nIntel Pentium", "zh": "英特尔 酷睿 i3、i5、i7\\n英特尔 赛扬\\n英特尔 奔腾"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_3	{"en": "19-inch: 1440×900 (16:10)\\n19/23.8/27-inch: 1920×1080 (16:9)", "zh": "19英寸：1440×900（16:10）\\n19/23.8/27英寸：1920×1080（16:9）"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_6	{"en": "64GB / 128GB / 256GB / 512GB / 1TB", "zh": "64GB / 128GB / 256GB / 512GB / 1TB"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_1_2	{"en": "Black / White", "zh": "黑色 / 白色"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_2_0	{"en": "3MP/5MP/8MP HD (with microphone) Camera", "zh": "300万/500万/800万像素高清(带麦克风)摄像头"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_3_2	{"en": "Default BT4.2/Optional BT5.0", "zh": "默认BT4.2/可选BT5.0"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_3_0	{"en": "100/1000Mbps Adaptive Wired Network Card", "zh": "100/1000Mbps自适应有线网卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_3_3	{"en": "1 × Power Port\\n1 × HDMI\\n1 × VGA(COM)\\n1 × LAN\\n4 × USB\\n1 × Audio Out\\n1 × Microphone In", "zh": "1 × 电源端口\\n1 × 高清多媒体接口\\n1 × VGA(COM)\\n1 × LAN\\n4 × USB\\n1 × 音频输出\\n1 × 麦克风输入"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_KIOSK_0505_E0XK_0_8	{"en": "", "zh": "集成核心显卡"}	2026-05-05 05:09:54.77	2026-05-05 05:09:54.77
prod_desc_PROD_AIO_0504_987C	{"en": "23.8-inch\\n optional \\ncapacitive touchscreen; \\noptional \\ninstallable camera\\n (located below the screen);\\nSupport brightness adjustment function、Type-C interface、Headphone jack、SD card reader；", "id": "layar sentuh kapasitif 23,8 inci opsional;\\nkamera opsional yang dapat dipasang\\n(terletak di bawah layar);\\nMendukung fungsi penyesuaian kecerahan, antarmuka Tipe-C, jack headphone, pembaca kartu SD;", "zh": "23.8 英寸可选\\n电容触摸屏；\\n可选\\n安装摄\\n像头（位于\\n屏幕下方）；"}	2026-05-05 02:11:57.117	2026-05-05 03:32:27.128
psg_PROD_KIOSK_0505_E0XK_3	{"en": "", "zh": "连接参数"}	2026-05-05 05:09:49.865	2026-05-05 05:09:49.865
psl_PROD_KIOSK_0505_E0XK_0_2	{"en": "", "zh": "触摸屏"}	2026-05-05 05:09:50.664	2026-05-05 05:09:50.664
psl_PROD_KIOSK_0505_E0XK_0_1	{"en": "", "zh": "屏幕尺寸"}	2026-05-05 05:09:50.67	2026-05-05 05:09:50.67
psl_PROD_KIOSK_0505_E0XK_0_5	{"en": "", "zh": "内存"}	2026-05-05 05:09:50.676	2026-05-05 05:09:50.676
psl_PROD_KIOSK_0505_E0XK_0_7	{"en": "", "zh": "机械硬盘"}	2026-05-05 05:09:51.35	2026-05-05 05:09:51.35
psl_PROD_KIOSK_0505_E0XK_1_0	{"en": "", "zh": "产品尺寸"}	2026-05-05 05:09:51.353	2026-05-05 05:09:51.353
psl_PROD_KIOSK_0505_E0XK_0_10	{"en": "", "zh": "系统"}	2026-05-05 05:09:51.353	2026-05-05 05:09:51.353
psl_PROD_KIOSK_0505_E0XK_1_1	{"en": "", "zh": "材质"}	2026-05-05 05:09:52.219	2026-05-05 05:09:52.219
psl_PROD_KIOSK_0505_E0XK_1_2	{"en": "", "zh": "颜色"}	2026-05-05 05:09:52.22	2026-05-05 05:09:52.22
psl_PROD_KIOSK_0505_E0XK_3_0	{"en": "", "zh": "网卡"}	2026-05-05 05:09:52.235	2026-05-05 05:09:52.235
psl_PROD_KIOSK_0505_E0XK_2_1	{"en": "", "zh": "扩展接口"}	2026-05-05 05:09:52.224	2026-05-05 05:09:52.224
psv_PROD_KIOSK_0505_E0XK_0_9	{"en": "", "zh": "高清音频编解码器; 立体声扬声器"}	2026-05-05 05:09:54.777	2026-05-05 05:09:54.777
psv_PROD_KIOSK_0505_E0XK_0_10	{"en": "", "zh": "兼容Win7/Win10/Win11"}	2026-05-05 05:09:54.778	2026-05-05 05:09:54.778
psv_PROD_KIOSK_0505_E0XK_1_0	{"en": "", "zh": "19英寸：433(W)× 286(S)× 355(H) mm\\n21.5英寸：491(W)× 294(S)× 363(H) mm\\n23.8英寸：540(W)× 321(S)× 410(H) mm\\n27英寸：-"}	2026-05-05 05:09:54.781	2026-05-05 05:09:54.781
psv_PROD_KIOSK_0505_E0XK_1_1	{"en": "", "zh": "铝合金底座，ABS 塑料外壳"}	2026-05-05 05:09:54.782	2026-05-05 05:09:54.782
psv_PROD_KIOSK_0505_E0XK_1_2	{"en": "", "zh": "黑色 / 白色"}	2026-05-05 05:09:55.552	2026-05-05 05:09:55.552
psv_PROD_KIOSK_0505_E0XK_2_0	{"en": "", "zh": "300万/500万/800万像素高清(带麦克风)摄像头"}	2026-05-05 05:09:55.56	2026-05-05 05:09:55.56
psv_PROD_KIOSK_0505_E0XK_3_1	{"en": "", "zh": "150Mbps无线WiFi\\n(433Mbps双频WiFi和WiFi 6功能可选)"}	2026-05-05 05:09:55.564	2026-05-05 05:09:55.564
psv_PROD_KIOSK_0505_E0XK_3_0	{"en": "", "zh": "100/1000Mbps自适应有线网卡"}	2026-05-05 05:09:55.565	2026-05-05 05:09:55.565
psv_PROD_KIOSK_0505_E0XK_2_1	{"en": "", "zh": "2 × USB2.0"}	2026-05-05 05:09:55.565	2026-05-05 05:09:55.565
psv_PROD_KIOSK_0505_E0XK_3_2	{"en": "", "zh": "默认BT4.2/可选BT5.0"}	2026-05-05 05:09:55.566	2026-05-05 05:09:55.566
prod_name_PROD_KIOSK_0505_95WB	{"en": "", "zh": "mini PC"}	2026-05-05 05:20:15.14	2026-05-05 05:20:15.14
psl_PROD_AIO_0504_987C_0_2	{"en": "Touchscreen", "zh": "触摸屏"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_desc_PROD_MONITOR_0504_FIA9	{"zh": "发到付阿道夫阿道夫阿道夫阿道夫阿迪斯发的发生的发的发多发点\\n打法打法多发点fasdf阿道夫阿道\\n阿达发到付阿道夫阿斯蒂芬"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_4_1	{"en": "19-inch: 495(L)×145(D)×450(H)mm\\n21.5-inch: 560(L)×145(D)×450(H)mm\\n23.8-inch: 600(L)×145(D)×450(H)mm\\n27-inch: -", "zh": "19英寸：495(L)×145(D)×450(H)mm\\n21.5英寸：560(L)×145(D)×450(H)mm\\n23.8英寸：600(L)×145(D)×450(H)mm\\n27英寸：-"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_4_2	{"en": "19-inch: 3.75kg\\n21.5-inch: 5.4kg\\n23.8-inch: 5.4kg\\n27-inch: -", "zh": "19英寸：3.75kg\\n21.5英寸：5.4kg\\n23.8英寸：5.4kg\\n27英寸：-"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_needQuote	{"en": "Need a custom quote?", "zh": "需要定制报价？"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_expertHelp	{"en": "Our experts are ready to help you with large-scale deployment and technical specs.", "zh": "我们的专家随时准备为您提供大规模部署方案和技术支持。"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_wholesaleLine	{"en": "Wholesale Line", "zh": "批发产品线"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_name_PROD_AIO_0504_987C	{"en": "Slim Series Flat K2 All-in-one PC", "zh": "轻薄系列 平面K2款 一体机电脑"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_9	{"en": "Multimedia", "zh": "多媒体"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_2_0	{"en": "Camera", "zh": "摄像头"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_2_1	{"en": "Expansion Ports", "zh": "扩展接口"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_3_0	{"en": "Network Card", "zh": "网卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_3_1	{"en": "WIFI", "zh": "WIFI"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_3_2	{"en": "Bluetooth", "zh": "蓝牙"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_3_3	{"en": "Bottom Ports", "zh": "底部接口"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_4_1	{"en": "Package Dimensions", "zh": "包装尺寸"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_contactSales	{"en": "Contact Sales", "zh": "联系销售"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_projectSolutions	{"en": "Project Solutions", "zh": "项目解决方案"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_quickSearch	{"en": "Quick Search", "zh": "快速搜索"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_categories	{"en": "Categories", "zh": "产品分类"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_itemsCount	{"en": "Items", "zh": "件产品"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_resetFilters	{"en": "Reset All Filters", "zh": "重置所有过滤器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
products_syncing	{"en": "Synchronizing Global Inventory...", "zh": "正在同步全球库存..."}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_2	{"en": "23.8-inch optional capacitive touchscreen", "zh": "23.8英寸可选电容触摸屏"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_7	{"en": "500GB / 1TB / 2TB", "zh": "500GB / 1TB / 2TB"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_0_8	{"en": "Integrated Core Graphics", "zh": "集成核心显卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_1_1	{"en": "Aluminum alloy base, ABS plastic casing", "zh": "铝合金底座，ABS 塑料外壳"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_2_1	{"en": "2 × USB2.0", "zh": "2 × USB2.0"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_3_1	{"en": "150Mbps Wireless WiFi\\n(433Mbps dual-band WiFi and WiFi 6 optional)", "zh": "150Mbps无线WiFi\\n(433Mbps双频WiFi和WiFi 6功能可选)"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_name_PROD_KIOSK_0505_E0XK	{"en": "", "zh": "笔记本电脑"}	2026-05-05 05:09:48.891	2026-05-05 05:09:48.891
prod_desc_PROD_KIOSK_0505_E0XK	{"en": "", "zh": ""}	2026-05-05 05:09:49.234	2026-05-05 05:09:49.234
psg_PROD_KIOSK_0505_E0XK_0	{"en": "", "zh": "常规参数"}	2026-05-05 05:09:49.852	2026-05-05 05:09:49.852
prod_name_cmoibfi320007uknu4dcvlfch	{"en": "High-Performance Mini PC", "zh": "高性能迷你主机"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_name_cmoibfi320008uknuhbf1oyi0	{"en": "Curved Gaming Monitor", "zh": "曲面电竞显示器"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_desc_cmoibfi320008uknuhbf1oyi0	{}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_1	{"en": "Screen Size", "zh": "屏幕尺寸"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_AIO_0504_987C_4_0	{"en": "Power Cable, Power Adapter, User Manual", "zh": "电源线，电源适配器，用户手册"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_4	{"en": "CPU", "zh": "CPU"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_5	{"en": "Memory", "zh": "内存"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_3	{"en": "Resolution", "zh": "分辨率"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_6	{"en": "SSD", "zh": "固态硬盘"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_7	{"en": "HDD", "zh": "机械硬盘"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_8	{"en": "Graphics Card", "zh": "显卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_10	{"en": "System", "zh": "系统"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_name_PROD_MONITOR_0504_FIA9	{"zh": "啊多发点范围打法打法打法地方阿道夫阿斯蒂芬阿道夫阿道夫阿斯顿"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psv_PROD_KIOSK_0505_E0XK_3_3	{"en": "", "zh": "1 × 电源端口\\n1 × 高清多媒体接口\\n1 × VGA(COM)\\n1 × LAN\\n4 × USB\\n1 × 音频输出\\n1 × 麦克风输入"}	2026-05-05 05:09:56.118	2026-05-05 05:09:56.118
psv_PROD_KIOSK_0505_E0XK_4_0	{"en": "", "zh": "电源线，电源适配器，用户手册"}	2026-05-05 05:09:56.124	2026-05-05 05:09:56.124
psv_PROD_KIOSK_0505_E0XK_4_1	{"en": "", "zh": "19英寸：495(L)×145(D)×450(H)mm\\n21.5英寸：560(L)×145(D)×450(H)mm\\n23.8英寸：600(L)×145(D)×450(H)mm\\n27英寸：-"}	2026-05-05 05:09:56.122	2026-05-05 05:09:56.122
psv_PROD_KIOSK_0505_E0XK_4_2	{"en": "", "zh": "19英寸：3.75kg\\n21.5英寸：5.4kg\\n23.8英寸：5.4kg\\n27英寸：-"}	2026-05-05 05:09:56.123	2026-05-05 05:09:56.123
prod_desc_PROD_KIOSK_0505_95WB	{"en": "", "zh": ""}	2026-05-05 05:20:15.478	2026-05-05 05:20:15.478
psg_PROD_KIOSK_0505_95WB_1	{"en": "231", "zh": "1231"}	2026-05-05 05:20:15.877	2026-05-05 05:20:15.877
psg_PROD_KIOSK_0505_95WB_0	{"en": "2312313", "zh": "51231"}	2026-05-05 05:20:15.876	2026-05-05 05:20:15.876
psl_PROD_KIOSK_0505_95WB_1_0	{"en": "123", "zh": "123"}	2026-05-05 05:20:17.154	2026-05-05 05:20:17.154
psl_PROD_KIOSK_0505_95WB_1_1	{"en": "", "zh": ""}	2026-05-05 05:20:17.155	2026-05-05 05:20:17.155
psl_PROD_KIOSK_0505_95WB_0_0	{"en": "12312", "zh": "31231"}	2026-05-05 05:20:17.156	2026-05-05 05:20:17.156
psl_PROD_KIOSK_0505_95WB_0_3	{"en": "", "zh": ""}	2026-05-05 05:20:17.169	2026-05-05 05:20:17.169
psl_PROD_KIOSK_0505_95WB_0_1	{"en": "", "zh": "3123123"}	2026-05-05 05:20:17.157	2026-05-05 05:20:17.157
psl_PROD_KIOSK_0505_95WB_0_2	{"en": "12", "zh": "312312"}	2026-05-05 05:20:17.16	2026-05-05 05:20:17.16
psl_PROD_KIOSK_0505_95WB_0_4	{"en": "", "zh": ""}	2026-05-05 05:20:17.834	2026-05-05 05:20:17.834
psl_PROD_KIOSK_0505_95WB_0_5	{"en": "", "zh": ""}	2026-05-05 05:20:17.847	2026-05-05 05:20:17.847
psv_PROD_KIOSK_0505_95WB_1_0	{"en": "", "zh": ""}	2026-05-05 05:20:17.848	2026-05-05 05:20:17.848
psv_PROD_KIOSK_0505_95WB_1_1	{"en": "", "zh": ""}	2026-05-05 05:20:17.852	2026-05-05 05:20:17.852
psv_PROD_KIOSK_0505_95WB_0_0	{"en": "", "zh": "1\\n23\\n12\\n3\\n123\\n1\\n23"}	2026-05-05 05:20:17.858	2026-05-05 05:20:17.858
psv_PROD_KIOSK_0505_95WB_0_3	{"en": "123123123", "zh": ""}	2026-05-05 05:20:17.859	2026-05-05 05:20:17.859
psv_PROD_KIOSK_0505_95WB_0_2	{"en": "", "zh": ""}	2026-05-05 05:20:18.499	2026-05-05 05:20:18.499
psv_PROD_KIOSK_0505_95WB_0_1	{"en": "", "zh": ""}	2026-05-05 05:20:18.5	2026-05-05 05:20:18.5
psv_PROD_KIOSK_0505_95WB_0_4	{"en": "", "zh": ""}	2026-05-05 05:20:18.501	2026-05-05 05:20:18.501
psv_PROD_KIOSK_0505_95WB_0_5	{"en": "", "zh": ""}	2026-05-05 05:20:18.502	2026-05-05 05:20:18.502
nav_mega_title	{"en": "Product Category", "id": "Kategori Produk", "zh": "产品分类"}	2026-05-05 08:28:05.096	2026-05-05 08:28:05.096
nav_mega_view_all	{"en": "View All", "id": "Lihat semua", "zh": "查看全部产品"}	2026-05-05 08:29:10.294	2026-05-05 08:29:10.294
nav_sub_download	{"en": "Download Product Manual", "id": "Unduh manual produk", "vi": "TẢI DANH MỤC", "zh": "下载产品手册"}	2026-05-05 08:30:55.969	2026-05-05 08:42:26.743
nav_wholesale	{"en": "Wholesale Products", "id": "Produk Grosir", "zh": "批发产品"}	2026-05-05 09:03:53.066	2026-05-05 09:03:53.066
nav_projects	{"en": "Project Products", "id": "Produk Proyek", "zh": "项目产品"}	2026-05-05 09:03:53.077	2026-05-05 09:03:53.077
nav_cases	{"en": "Cases", "id": "Kasus", "zh": "案例"}	2026-05-05 09:03:53.081	2026-05-05 09:03:53.081
nav_contact	{"en": "Contact Us", "id": "Hubungi Kami", "zh": "联系我们"}	2026-05-05 09:03:53.085	2026-05-05 09:03:53.085
hero_headline	{"en": "All In One Computer", "id": "Komputer All In One", "zh": "一体化电脑"}	2026-05-05 09:10:12.623	2026-05-05 09:10:12.623
hero_subheadline	{"en": "Professional Manufacturer", "id": "Produsen Profesional", "zh": "专业级制造商"}	2026-05-05 09:10:12.633	2026-05-05 09:10:12.633
hero_cta	{"en": "Explore Solutions", "id": "Jelajahi Solusi", "zh": "探索方案"}	2026-05-05 09:10:12.638	2026-05-05 09:10:12.638
hero_wholesale_title	{"en": "Wholesale Products", "id": "Produk Grosir", "zh": "批发产品"}	2026-05-05 09:10:12.642	2026-05-06 09:12:17.825
hero_wholesale_desc	{"en": "", "id": "", "zh": ""}	2026-05-05 09:10:12.646	2026-05-06 09:12:17.826
hero_project_title	{"en": "Project Products", "id": "Solusi Proyek", "zh": "项目产品"}	2026-05-05 09:10:12.649	2026-05-06 09:12:17.827
PRODUCTS_TITLE	{"en": "Explore our diverse product range", "zh": "探索我们的多元化产品系列"}	2026-05-06 09:07:43.901	2026-05-06 09:12:17.829
cat_name_NOTEBOOK	{"en": "Notebook computer", "zh": "笔记本电脑"}	2026-05-05 02:11:57.117	2026-05-06 05:02:30.707
hero_slide_1778034103591_headline	{"en": "New Title", "zh": "新标题"}	2026-05-06 02:21:33.568	2026-05-06 05:53:36.152
hero_slide_1778034103591_subheadline	{"en": "New Subtitle", "zh": "新副标题"}	2026-05-06 02:21:33.571	2026-05-06 05:53:36.152
hero_project_desc	{"en": "", "id": "", "zh": ""}	2026-05-05 09:10:12.653	2026-05-06 09:12:17.827
PRODUCTS_SUBTITLE	{"en": "", "zh": ""}	2026-05-06 09:07:44.54	2026-05-06 09:12:18.5
GALLERY_TITLE	{"en": "New Product", "zh": "最新产品"}	2026-05-06 09:07:44.56	2026-05-06 09:12:18.586
GALLERY_SUBTITLE	{"en": "", "zh": ""}	2026-05-06 09:07:44.655	2026-05-06 09:12:18.59
hero_slide_legacy-default_subheadline	{"en": "Next-generation hardware solutions for global enterprises", "zh": "面向全球企业的下一代硬件解决方案"}	2026-05-06 01:53:56.258	2026-05-06 09:12:18.591
hero_slide_legacy-default_headline	{"en": "Elevate Your Digital Horizon", "id": "Tingkatkan Cakrawala Digital Anda", "zh": "提升您的数字视野"}	2026-05-06 01:53:56.258	2026-05-06 09:12:18.596
hero_slide_1777967445203_headline	{"en": "F9-S Series All-in-one PC", "zh": "F9-S系列 一体机电脑"}	2026-05-06 01:53:57.069	2026-05-06 09:12:18.602
hero_slide_1777967445203_subheadline	{"en": "Base supports lifting, lowering, and rotation, with brightness adjustment and a pop-up camera.", "zh": "底座支撑升降旋转，支持亮度调节，弹出式摄像头"}	2026-05-06 01:53:57.071	2026-05-06 09:12:19.468
\.


--
-- Data for Name: MapLocation; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."MapLocation" (id, type, "titleZh", "titleEn", "addressZh", "addressEn", "descZh", "descEn", "imageUrl", "posTop", "posLeft", "homepageId") FROM stdin;
cmoibfi390009uknuxxyt82rh	HQ	深圳总部	Shenzhen Headquarters	中国深圳	Shenzhen, China	全球研发与运营中心	Global R&D and Operations Center	\N	35%	78%	hero
cmoibfi39000auknuamax4sia	Factory	印尼工厂	Indonesia Factory	印度尼西亚巴淡岛	Batam, Indonesia	东南亚制造中心	Southeast Asia Manufacturing Hub	\N	55%	82%	hero
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Product" (id, status, "nameTextId", "categoryId", "advantageTextIds", "createdAt", "descriptionTextId", "enabledLanguages", "galleryImageUrls", "localizedDetails", "mainImageUrl", "specGroups", "updatedAt") FROM stdin;
PROD_MONITOR_0504_FIA9	published	prod_name_PROD_MONITOR_0504_FIA9	LED	\N	2026-05-04 07:15:13.105	prod_desc_PROD_MONITOR_0504_FIA9	{zh,en,id}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	[]	2026-05-05 05:20:33.425
cmoibfi320008uknuhbf1oyi0	published	prod_name_cmoibfi320008uknuhbf1oyi0	NOTEBOOK	\N	2026-04-28 07:39:36.398	prod_desc_cmoibfi320008uknuhbf1oyi0	{zh,id,en}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	[]	2026-05-05 05:20:37.987
cmoibfi320007uknu4dcvlfch	published	prod_name_cmoibfi320007uknu4dcvlfch	MINIPC	\N	2026-04-28 07:39:36.398	prod_desc_cmoibfi320007uknu4dcvlfch	{zh,en,id}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	[]	2026-05-05 05:20:39.905
PROD_AIO_0504_987C	published	prod_name_PROD_AIO_0504_987C	AIO	\N	2026-05-04 06:23:07.527	prod_desc_PROD_AIO_0504_987C	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg,http://localhost:9000/heovose-assets/uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg,http://localhost:9000/heovose-assets/uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg,http://localhost:9000/heovose-assets/uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg,http://localhost:9000/heovose-assets/uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg,http://localhost:9000/heovose-assets/uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg,http://localhost:9000/heovose-assets/uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	[{"items": [{"labelId": "psl_PROD_AIO_0504_987C_0_0", "valueId": "psv_PROD_AIO_0504_987C_0_0"}, {"labelId": "psl_PROD_AIO_0504_987C_0_1", "valueId": "psv_PROD_AIO_0504_987C_0_1"}, {"labelId": "psl_PROD_AIO_0504_987C_0_2", "valueId": "psv_PROD_AIO_0504_987C_0_2"}, {"labelId": "psl_PROD_AIO_0504_987C_0_3", "valueId": "psv_PROD_AIO_0504_987C_0_3"}, {"labelId": "psl_PROD_AIO_0504_987C_0_4", "valueId": "psv_PROD_AIO_0504_987C_0_4"}, {"labelId": "psl_PROD_AIO_0504_987C_0_5", "valueId": "psv_PROD_AIO_0504_987C_0_5"}, {"labelId": "psl_PROD_AIO_0504_987C_0_6", "valueId": "psv_PROD_AIO_0504_987C_0_6"}, {"labelId": "psl_PROD_AIO_0504_987C_0_7", "valueId": "psv_PROD_AIO_0504_987C_0_7"}, {"labelId": "psl_PROD_AIO_0504_987C_0_8", "valueId": "psv_PROD_AIO_0504_987C_0_8"}, {"labelId": "psl_PROD_AIO_0504_987C_0_9", "valueId": "psv_PROD_AIO_0504_987C_0_9"}, {"labelId": "psl_PROD_AIO_0504_987C_0_10", "valueId": "psv_PROD_AIO_0504_987C_0_10"}], "titleId": "psg_PROD_AIO_0504_987C_0"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_1_0", "valueId": "psv_PROD_AIO_0504_987C_1_0"}, {"labelId": "psl_PROD_AIO_0504_987C_1_1", "valueId": "psv_PROD_AIO_0504_987C_1_1"}, {"labelId": "psl_PROD_AIO_0504_987C_1_2", "valueId": "psv_PROD_AIO_0504_987C_1_2"}], "titleId": "psg_PROD_AIO_0504_987C_1"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_2_0", "valueId": "psv_PROD_AIO_0504_987C_2_0"}, {"labelId": "psl_PROD_AIO_0504_987C_2_1", "valueId": "psv_PROD_AIO_0504_987C_2_1"}], "titleId": "psg_PROD_AIO_0504_987C_2"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_3_0", "valueId": "psv_PROD_AIO_0504_987C_3_0"}, {"labelId": "psl_PROD_AIO_0504_987C_3_1", "valueId": "psv_PROD_AIO_0504_987C_3_1"}, {"labelId": "psl_PROD_AIO_0504_987C_3_2", "valueId": "psv_PROD_AIO_0504_987C_3_2"}, {"labelId": "psl_PROD_AIO_0504_987C_3_3", "valueId": "psv_PROD_AIO_0504_987C_3_3"}], "titleId": "psg_PROD_AIO_0504_987C_3"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_4_0", "valueId": "psv_PROD_AIO_0504_987C_4_0"}, {"labelId": "psl_PROD_AIO_0504_987C_4_1", "valueId": "psv_PROD_AIO_0504_987C_4_1"}, {"labelId": "psl_PROD_AIO_0504_987C_4_2", "valueId": "psv_PROD_AIO_0504_987C_4_2"}], "titleId": "psg_PROD_AIO_0504_987C_4"}]	2026-05-05 03:33:43.895
PROD_KIOSK_0505_E0XK	published	prod_name_PROD_KIOSK_0505_E0XK	KIOSK	\N	2026-05-05 05:09:56.611	prod_desc_PROD_KIOSK_0505_E0XK	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg,http://localhost:9000/heovose-assets/uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg,http://localhost:9000/heovose-assets/uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg,http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg}	{"en": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">Tutoring fee</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">Tutoring fee Adolf</strong></b></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">fa place is short hair short hair</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><img src=\\"http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg\\" alt=\\"Product image\\" width=\\"auto\\" height=\\"auto\\"></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">I</span></p>", "zh": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">辅导费</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">辅导费阿道夫</strong></b></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">fa地方是短发短发</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><img src=\\"http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg\\" alt=\\"Product image\\" width=\\"auto\\" height=\\"auto\\"></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">我</span></p>"}	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	[{"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_0_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_2"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_3", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_3"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_4", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_4"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_5", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_5"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_6", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_6"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_7", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_7"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_8", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_8"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_9", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_9"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_10", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_10"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_0"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_1_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_1_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_1_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_2"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_1"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_2_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_2_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_2_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_2_1"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_2"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_3_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_2"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_3", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_3"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_3"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_4_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_4_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_4_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_2"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_4"}]	2026-05-05 05:11:10.678
PROD_KIOSK_0505_95WB	published	prod_name_PROD_KIOSK_0505_95WB	KIOSK	\N	2026-05-05 05:20:19.018	prod_desc_PROD_KIOSK_0505_95WB	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg,http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg,http://localhost:9000/heovose-assets/uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg,http://localhost:9000/heovose-assets/uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg,http://localhost:9000/heovose-assets/uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg}	{"en": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><br></p>", "zh": ""}	http://localhost:9000/heovose-assets/uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	[{"items": [{"labelId": "psl_PROD_KIOSK_0505_95WB_0_0", "valueId": "psv_PROD_KIOSK_0505_95WB_0_0"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_1", "valueId": "psv_PROD_KIOSK_0505_95WB_0_1"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_2", "valueId": "psv_PROD_KIOSK_0505_95WB_0_2"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_3", "valueId": "psv_PROD_KIOSK_0505_95WB_0_3"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_4", "valueId": "psv_PROD_KIOSK_0505_95WB_0_4"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_5", "valueId": "psv_PROD_KIOSK_0505_95WB_0_5"}], "titleId": "psg_PROD_KIOSK_0505_95WB_0"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_95WB_1_0", "valueId": "psv_PROD_KIOSK_0505_95WB_1_0"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_1_1", "valueId": "psv_PROD_KIOSK_0505_95WB_1_1"}], "titleId": "psg_PROD_KIOSK_0505_95WB_1"}]	2026-05-05 05:20:30.187
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."ProductCategory" (id, slug, "thumbnailImageUrl", "parentId", "nameTextId", "descriptionTextId", "order") FROM stdin;
WHOLESALE	wholesale	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	\N	cat_name_WHOLESALE	cat_desc_WHOLESALE	-1
MINIPC	minipc	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	WHOLESALE	cat_name_MINIPC	cat_desc_MINIPC	0
WHITEBOARD	whiteboard		PROJECT	cat_name_WHITEBOARD	cat_desc_WHITEBOARD	0
CORE	core		WHOLESALE	cat_name_CORE	cat_desc_CORE	1
AIO	aio	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	WHOLESALE	cat_name_AIO	cat_desc_AIO	-1
MONITOR	monitor		WHOLESALE	cat_name_MONITOR	cat_desc_MONITOR	0
ESSENTIALS	essentials		WHOLESALE	cat_name_ESSENTIALS	cat_desc_ESSENTIALS	0
KIOSK	kiosk		PROJECT	cat_name_KIOSK	cat_desc_KIOSK	0
INDUSTRIAL	industrial		PROJECT	cat_name_INDUSTRIAL	cat_desc_INDUSTRIAL	0
LED	led		PROJECT	cat_name_LED	cat_desc_LED	0
SHOWROOM	showroom		PROJECT	cat_name_SHOWROOM	cat_desc_SHOWROOM	0
PROJECT	project	http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	\N	cat_name_PROJECT	cat_desc_PROJECT	0
NOTEBOOK	notebook	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	WHOLESALE	cat_name_NOTEBOOK	cat_desc_NOTEBOOK	0
\.


--
-- Data for Name: ProductionStep; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."ProductionStep" (id, "order", "titleZh", "titleEn", "descZh", "descEn", "imageUrls") FROM stdin;
cmoibfi3p000cuknuihdblv62	1	IQC 来料检验	IQC (Incoming Quality Control)	对所有原材料进行严格测试。	Rigorous testing of all raw materials.	{https://placehold.co/400x300?text=IQC}
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Session" ("sessionToken", "userId", expires, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Setting" (id, value) FROM stdin;
ai	{"apiKey":"AIzaSyCdor09jDPt3aKX-zE5FSSF4ZLblTvkcJ8","isEnabled":true,"temperature":0.7,"systemInstruction":"你是一位专业的工业硬件制造专家，擅长将复杂的计算机硬件规格（如一体机、迷你电脑、工业显示器）翻译成地道、专业的商务语言。请保持术语的准确性，并统一单位。","model":"googleai/gemini-2.5-flash","lastDiagnosis":{"status":"success","message":"连接成功：模型响应正常，鉴权通过。","latency":-17869,"modelUsed":"googleai/gemini-2.5-flash","keySource":"手动输入 (Manual)","timestamp":"2026-04-28T07:55:36.556Z"}}
navigation	{"navbarMaterial":"level-03","showBorder":true,"showShadow":true,"megaMenuColumns":3,"megaMenuGap":12,"featuredText":"立即下载手册","featuredDownloadUrl":"/files/catalog_2026.pdf","featuredCoverUrl":"/image/catalog-placeholder.png"}
languages	{"supportedLanguages":[{"code":"zh","label":"中文"},{"code":"en","label":"English"},{"code":"id","label":"Indonesian"}],"defaultLanguage":"en"}
\.


--
-- Data for Name: SpecTemplate; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."SpecTemplate" (id, name, "specGroups", "createdAt", "updatedAt") FROM stdin;
tpl_1777515394458	4123	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:14.961	2026-04-30 02:16:14.961
tpl_1777515428610	612312312	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": "1\\n23\\n12\\n3\\n123\\n1\\n23"}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "123123123", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:47.888	2026-04-30 06:00:19.358
tpl_1777874684855	一体机电脑	[{"items": [{"labelEn": "", "labelZh": "型号", "valueEn": "", "valueZh": "K2"}, {"labelEn": "", "labelZh": "屏幕尺寸", "valueEn": "", "valueZh": "19英寸、21.5英寸、23.8英寸、27英寸"}, {"labelEn": "", "labelZh": "触摸屏", "valueEn": "", "valueZh": "23.8英寸可选电容触摸屏"}, {"labelEn": "", "labelZh": "分辨率", "valueEn": "", "valueZh": "19英寸：1440×900（16:10）\\n19/23.8/27英寸：1920×1080（16:9）"}, {"labelEn": "", "labelZh": "CPU", "valueEn": "", "valueZh": "英特尔 酷睿 i3、i5、i7\\n英特尔 赛扬\\n英特尔 奔腾"}, {"labelEn": "", "labelZh": "内存", "valueEn": "", "valueZh": "4GB / 8GB / 16GB / 32GB"}, {"labelEn": "", "labelZh": "固态硬盘", "valueEn": "", "valueZh": "64GB / 128GB / 256GB / 512GB / 1TB"}, {"labelEn": "", "labelZh": "机械硬盘", "valueEn": "", "valueZh": "500GB / 1TB / 2TB"}, {"labelEn": "", "labelZh": "显卡", "valueEn": "", "valueZh": "集成核心显卡"}, {"labelEn": "", "labelZh": "多媒体", "valueEn": "", "valueZh": "高清音频编解码器; 立体声扬声器"}, {"labelEn": "", "labelZh": "系统", "valueEn": "", "valueZh": "兼容Win7/Win10/Win11"}], "titleEn": "", "titleZh": "常规参数"}, {"items": [{"labelEn": "", "labelZh": "产品尺寸", "valueEn": "", "valueZh": "19英寸：433(W)× 286(S)× 355(H) mm\\n21.5英寸：491(W)× 294(S)× 363(H) mm\\n23.8英寸：540(W)× 321(S)× 410(H) mm\\n27英寸：-"}, {"labelEn": "", "labelZh": "材质", "valueEn": "", "valueZh": "铝合金底座，ABS 塑料外壳"}, {"labelEn": "", "labelZh": "颜色", "valueEn": "", "valueZh": "黑色 / 白色"}], "titleEn": "", "titleZh": "物理参数"}, {"items": [{"labelEn": "", "labelZh": "摄像头", "valueEn": "", "valueZh": "300万/500万/800万像素高清(带麦克风)摄像头"}, {"labelEn": "", "labelZh": "扩展接口", "valueEn": "", "valueZh": "2 × USB2.0"}], "titleEn": "", "titleZh": "扩展参数"}, {"items": [{"labelEn": "", "labelZh": "网卡", "valueEn": "", "valueZh": "100/1000Mbps自适应有线网卡"}, {"labelEn": "", "labelZh": "WIFI", "valueEn": "", "valueZh": "150Mbps无线WiFi\\n(433Mbps双频WiFi和WiFi 6功能可选)"}, {"labelEn": "", "labelZh": "蓝牙", "valueEn": "", "valueZh": "默认BT4.2/可选BT5.0"}, {"labelEn": "", "labelZh": "底部接口", "valueEn": "", "valueZh": "1 × 电源端口\\n1 × 高清多媒体接口\\n1 × VGA(COM)\\n1 × LAN\\n4 × USB\\n1 × 音频输出\\n1 × 麦克风输入"}], "titleEn": "", "titleZh": "连接参数"}, {"items": [{"labelEn": "", "labelZh": "附件清单", "valueEn": "", "valueZh": "电源线，电源适配器，用户手册"}, {"labelEn": "", "labelZh": "包装尺寸", "valueEn": "", "valueZh": "19英寸：495(L)×145(D)×450(H)mm\\n21.5英寸：560(L)×145(D)×450(H)mm\\n23.8英寸：600(L)×145(D)×450(H)mm\\n27英寸：-"}, {"labelEn": "", "labelZh": "重量", "valueEn": "", "valueZh": "19英寸：3.75kg\\n21.5英寸：5.4kg\\n23.8英寸：5.4kg\\n27英寸：-"}], "titleEn": "", "titleZh": "包装（1台）"}]	2026-05-04 06:04:21.682	2026-05-04 06:07:44.329
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."User" (id, name, email, "emailVerified", image, password, role, "createdAt", "updatedAt") FROM stdin;
cmoibfi230000uknuxbuglkp0	Admin User	admin@heovose.com	\N	\N	$2b$10$YpgPo2dhecCziS5OpYg1MukcgdBvn7huiEHFvbS20hnh748Kz24jq	superadmin	2026-04-28 07:39:36.361	2026-04-29 02:10:43.51
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2d33dec6-92ef-49da-b11c-7c33c46ee2d5	8739c45e9f83fcddbfcca91f023e9a11c255237c6f9e248bf326ec76438a20be	2026-04-28 05:46:47.496148+00	20260428021540_init	\N	\N	2026-04-28 05:46:47.34318+00	1
47afafa8-6a0b-4c41-ac1a-370289862562	70ec7825aeef33bb15d935614f1aa7c648506a33f8de9d665ec75f1cf84d46f2	2026-04-28 05:46:47.590309+00	20260428023158_auth	\N	\N	2026-04-28 05:46:47.503128+00	1
d42474bc-f221-4b4d-bb70-30a22c6463ec	b363a71b05e1385cc2cd2bca98f15c674ccb97327bb620ffc9ae3f592e3b5d4e	2026-04-28 05:46:47.64225+00	20260428023813_gallery	\N	\N	2026-04-28 05:46:47.596307+00	1
17b38abb-8aa9-4657-b7ec-312d7c03beec	376d1b7f801b48166bae42a975dffb4bd15ad80d60f0ecf526858af3fed5be02	2026-04-28 05:46:59.361156+00	20260428054659_simplify_gallery_categories	\N	\N	2026-04-28 05:46:59.311913+00	1
962a8156-a673-408e-b9e7-889032fa0708	c31b8b5f5920fb40d8c9f4615a3e93d445a12e99587dd1d226ab45d103d8cdf1	2026-04-28 06:00:36.043244+00	20260428060036_add_asset_file_details	\N	\N	2026-04-28 06:00:36.025975+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (provider, "providerAccountId");


--
-- Name: CaseStudy CaseStudy_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."CaseStudy"
    ADD CONSTRAINT "CaseStudy_pkey" PRIMARY KEY (id);


--
-- Name: GalleryAsset GalleryAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."GalleryAsset"
    ADD CONSTRAINT "GalleryAsset_pkey" PRIMARY KEY (id);


--
-- Name: GalleryCategory GalleryCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."GalleryCategory"
    ADD CONSTRAINT "GalleryCategory_pkey" PRIMARY KEY (id);


--
-- Name: HomepageBentoItem HomepageBentoItem_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."HomepageBentoItem"
    ADD CONSTRAINT "HomepageBentoItem_pkey" PRIMARY KEY (id);


--
-- Name: HomepageContent HomepageContent_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."HomepageContent"
    ADD CONSTRAINT "HomepageContent_pkey" PRIMARY KEY (id);


--
-- Name: LocalizedString LocalizedString_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."LocalizedString"
    ADD CONSTRAINT "LocalizedString_pkey" PRIMARY KEY (id);


--
-- Name: MapLocation MapLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."MapLocation"
    ADD CONSTRAINT "MapLocation_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ProductionStep ProductionStep_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."ProductionStep"
    ADD CONSTRAINT "ProductionStep_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: SpecTemplate SpecTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."SpecTemplate"
    ADD CONSTRAINT "SpecTemplate_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationToken VerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY (identifier, token);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: GalleryAsset_categoryId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "GalleryAsset_categoryId_idx" ON public."GalleryAsset" USING btree ("categoryId");


--
-- Name: ProductCategory_descriptionTextId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "ProductCategory_descriptionTextId_idx" ON public."ProductCategory" USING btree ("descriptionTextId");


--
-- Name: ProductCategory_nameTextId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "ProductCategory_nameTextId_idx" ON public."ProductCategory" USING btree ("nameTextId");


--
-- Name: ProductCategory_parentId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "ProductCategory_parentId_idx" ON public."ProductCategory" USING btree ("parentId");


--
-- Name: ProductCategory_slug_key; Type: INDEX; Schema: public; Owner: heovose
--

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON public."ProductCategory" USING btree (slug);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_descriptionTextId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "Product_descriptionTextId_idx" ON public."Product" USING btree ("descriptionTextId");


--
-- Name: Product_nameTextId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "Product_nameTextId_idx" ON public."Product" USING btree ("nameTextId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: heovose
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: heovose
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GalleryAsset GalleryAsset_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."GalleryAsset"
    ADD CONSTRAINT "GalleryAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."GalleryCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GalleryCategory GalleryCategory_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."GalleryCategory"
    ADD CONSTRAINT "GalleryCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."GalleryCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MapLocation MapLocation_homepageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."MapLocation"
    ADD CONSTRAINT "MapLocation_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES public."HomepageContent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductCategory ProductCategory_descriptionTextId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_descriptionTextId_fkey" FOREIGN KEY ("descriptionTextId") REFERENCES public."LocalizedString"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategory ProductCategory_nameTextId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_nameTextId_fkey" FOREIGN KEY ("nameTextId") REFERENCES public."LocalizedString"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategory ProductCategory_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_descriptionTextId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_descriptionTextId_fkey" FOREIGN KEY ("descriptionTextId") REFERENCES public."LocalizedString"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_nameTextId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_nameTextId_fkey" FOREIGN KEY ("nameTextId") REFERENCES public."LocalizedString"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: heovose
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict zvokvdoTfLbZ2mNb6mFip2g4dhvR97ibZMxEjU0deDEmNJ0WrRRmv0PI3Yegcr0

