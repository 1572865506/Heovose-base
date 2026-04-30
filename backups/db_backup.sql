--
-- PostgreSQL database dump
--

\restrict AxLMJd6UjsP1PGfN2NTWY5tmAc0yYBVTo5EKsKKy16SSDxGCSGwfh0NpkzRj9bs

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
    width integer
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
    "videoUrl" text
);


ALTER TABLE public."HomepageContent" OWNER TO heovose;

--
-- Name: LocalizedString; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."LocalizedString" (
    id text NOT NULL,
    zh text NOT NULL,
    en text NOT NULL
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

COPY public."GalleryAsset" (id, title, url, "categoryId", "createdAt", "fileName", "fileSize", height, width) FROM stdin;
asset_1777367981154_0	这是一个一体机电脑产品，帮我生成一张使用场景的场景图_202604151453	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	cat_1777363045711	2026-04-28 09:19:21.635	uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	626021	\N	\N
asset_1777433984930_0	里面的笔记本电脑就换成图1，图2这个笔记本_2K_202604160904	http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	cat_1777363045711	2026-04-29 03:39:24.956	uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	409429	\N	\N
asset_1777433985864_1	Project Product-1	http://localhost:9000/heovose-assets/uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	cat_1777363045711	2026-04-29 03:39:25.769	uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	148092	\N	\N
asset_1777433986677_2	Project Product-2	http://localhost:9000/heovose-assets/uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	cat_1777363045711	2026-04-29 03:39:26.697	uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	149750	\N	\N
asset_1777433987620_3	Wholesale Product	http://localhost:9000/heovose-assets/uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	cat_1777363045711	2026-04-29 03:39:47.95	uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	120752	\N	\N
asset_1777439296324_0	2-1	http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	cat_1777363045711	2026-04-29 05:08:16.776	uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	267782	\N	\N
asset_1777439484026_6	7	http://localhost:9000/heovose-assets/uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	cat_1777439509227	2026-04-29 05:11:03.825	uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	186134	\N	\N
asset_1777439480942_3	4	http://localhost:9000/heovose-assets/uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	cat_1777439509227	2026-04-29 05:11:21.274	uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	174062	\N	\N
asset_1777439479065_1	2	http://localhost:9000/heovose-assets/uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	cat_1777439509227	2026-04-29 05:11:19.407	uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	175650	\N	\N
asset_1777439481828_4	5	http://localhost:9000/heovose-assets/uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	cat_1777439509227	2026-04-29 05:11:22.408	uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	230501	\N	\N
asset_1777439483111_5	6	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	cat_1777439509227	2026-04-29 05:11:02.812	uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	409595	\N	\N
asset_1777439479940_2	3	http://localhost:9000/heovose-assets/uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	cat_1777439509227	2026-04-29 05:11:20.387	uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	240459	\N	\N
asset_1777439478092_0	1	http://localhost:9000/heovose-assets/uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	cat_1777439509227	2026-04-29 05:11:18.522	uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	190446	\N	\N
asset_1777439485065_7	8	http://localhost:9000/heovose-assets/uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	cat_1777439509227	2026-04-29 05:11:04.767	uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	182281	\N	\N
asset_1777439647319_0	2	http://localhost:9000/heovose-assets/uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	cat_1777439615716	2026-04-29 05:13:47.12	uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	160258	\N	\N
asset_1777439648403_1	3	http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	cat_1777439615716	2026-04-29 05:13:48.107	uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	162211	\N	\N
asset_1777439649230_2	4+	http://localhost:9000/heovose-assets/uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	cat_1777439615716	2026-04-29 05:13:49.021	uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	55232	\N	\N
asset_1777439650261_3	5	http://localhost:9000/heovose-assets/uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	cat_1777439615716	2026-04-29 05:13:49.944	uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	56115	\N	\N
asset_1777439651171_4	6	http://localhost:9000/heovose-assets/uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	cat_1777439615716	2026-04-29 05:13:50.95	uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	141463	\N	\N
asset_1777439652265_5	7	http://localhost:9000/heovose-assets/uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	cat_1777439615716	2026-04-29 05:14:12.599	uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	95362	\N	\N
asset_1777439653179_6	8	http://localhost:9000/heovose-assets/uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	cat_1777439615716	2026-04-29 05:14:13.624	uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	141021	\N	\N
asset_1777439654287_7	9	http://localhost:9000/heovose-assets/uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	cat_1777439615716	2026-04-29 05:14:14.609	uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	74627	\N	\N
asset_1777439655277_8	10	http://localhost:9000/heovose-assets/uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	cat_1777439615716	2026-04-29 05:13:56.376	uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	302898	\N	\N
asset_1777439656696_9	12	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	cat_1777439615716	2026-04-29 05:13:57.39	uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	214659	\N	\N
asset_1777448722825_ywqq1_0	MINI-PC-P-1	http://localhost:9000/heovose-assets/uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	cat_1777433109728	2026-04-29 07:45:24.644	uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	108510	900	1100
asset_1777448725091_e2jyo_1	MINI-PC-P-2	http://localhost:9000/heovose-assets/uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	cat_1777433109728	2026-04-29 07:45:25.551	uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	138300	900	1100
asset_1777448725958_dibm2_2	MINI-PC-P-3	http://localhost:9000/heovose-assets/uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	cat_1777433109728	2026-04-29 07:45:26.293	uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	135571	900	1100
asset_1777448726694_4lxgr_3	MINI-PC-P-4	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	cat_1777433109728	2026-04-29 07:45:27.115	uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	123066	900	1100
asset_1777448727513_ptx4a_4	MINI-PC-P-5	http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	cat_1777433109728	2026-04-29 07:45:27.837	uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	131588	900	1100
asset_1777448728217_q9vv7_5	MINI-PC-P-6	http://localhost:9000/heovose-assets/uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	cat_1777433109728	2026-04-29 07:45:28.628	uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	112783	900	1100
asset_1777448729015_xnnhf_6	MINI-PC-P-7	http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	cat_1777433109728	2026-04-29 07:45:29.336	uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	114772	900	1100
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
\.


--
-- Data for Name: HomepageContent; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."HomepageContent" (id, "heroHeadlineEn", "heroHeadlineZh", "heroSubheadlineEn", "heroSubheadlineZh", "heroWholesaleButtonEn", "heroWholesaleButtonZh", "heroProjectButtonEn", "heroProjectButtonZh", "heroWholesaleCategoryId", "heroProjectCategoryId", "isVideoEnabled", "videoTitleEn", "videoTitleZh", "videoSubtitleEn", "videoSubtitleZh", "mapTitleEn", "mapTitleZh", "mapSubtitleEn", "mapSubtitleZh", "heroProjectDescriptionEn", "heroProjectDescriptionZh", "heroSlides", "heroWholesaleDescriptionEn", "heroWholesaleDescriptionZh", "videoUrl") FROM stdin;
hero	Elevate Your Digital Horizon	提升您的数字视野	Next-Generation Hardware Solutions for Global Enterprises	面向全球企业的下一代硬件解决方案	Wholesale Inquiry	批发咨询	Project Solutions	项目方案	\N	\N	t	Our Craftsmanship	我们的工艺	\N	\N	Global Footprint	全球足迹	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: LocalizedString; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."LocalizedString" (id, zh, en) FROM stdin;
cmoibfi2o0001uknuisfb5oa2	高性能迷你主机	High-Performance Mini PC
cmoibfi2r0002uknurlgkgzym	曲面电竞显示器	Curved Gaming Monitor
cat_name_PROJECT	项目产品	Project Products
cat_desc_PROJECT		
cat_name_WHOLESALE	批发产品	Wholesale Products
cat_desc_WHOLESALE		
cat_name_AWE	噶而且我	1fwqwe
cat_desc_AWE		
cat_name_NOTEBOOK	笔记本电脑	Notebook computer
cat_desc_NOTEBOOK		
cat_name_MINIPC	小主机	MINI PC
cat_desc_MINIPC		
cat_name_AIO	一体机电脑	All-in-one PC
cat_desc_AIO	极致性能，专为办公而生	Ultimate performance, designed for office use
prod_name_cmoibfi320007uknu4dcvlfch	高性能迷你主机	High-Performance Mini PC
prod_desc_cmoibfi320007uknu4dcvlfch		
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
cmoibfi320007uknu4dcvlfch	published	cmoibfi2o0001uknuisfb5oa2	\N	\N	2026-04-28 07:39:36.398	\N	\N	\N	\N	\N	\N	2026-04-28 07:39:36.398
cmoibfi320008uknuhbf1oyi0	published	cmoibfi2r0002uknurlgkgzym	\N	\N	2026-04-28 07:39:36.398	\N	\N	\N	\N	\N	\N	2026-04-28 07:39:36.398
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."ProductCategory" (id, slug, "thumbnailImageUrl", "parentId", "nameTextId", "descriptionTextId", "order") FROM stdin;
WHOLESALE	wholesale	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	\N	cat_name_WHOLESALE	cat_desc_WHOLESALE	-1
PROJECT	project		\N	cat_name_PROJECT	\N	0
NOTEBOOK	notebook		WHOLESALE	cat_name_NOTEBOOK	cat_desc_NOTEBOOK	0
MINIPC	minipc	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	WHOLESALE	cat_name_MINIPC	cat_desc_MINIPC	0
AIO	aio	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	WHOLESALE	cat_name_AIO	cat_desc_AIO	1
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
\.


--
-- Data for Name: SpecTemplate; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."SpecTemplate" (id, name, "specGroups", "createdAt", "updatedAt") FROM stdin;
tpl_1777515394458	4123	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:14.961	2026-04-30 02:16:14.961
tpl_1777515408609	51231	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:27.902	2026-04-30 02:16:27.902
tpl_1777515420179	61231231	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:39.464	2026-04-30 02:16:39.464
tpl_1777515423995	123123	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:43.288	2026-04-30 02:16:43.288
tpl_1777515428610	612312312	[{"items": [{"labelEn": "12312", "labelZh": "31231", "valueEn": "", "valueZh": "1\\n23\\n12\\n3\\n123\\n1\\n23"}, {"labelEn": "", "labelZh": "3123123", "valueEn": "", "valueZh": ""}, {"labelEn": "12", "labelZh": "312312", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "123123123", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "2312313", "titleZh": "51231"}, {"items": [{"labelEn": "123", "labelZh": "123", "valueEn": "", "valueZh": ""}, {"labelEn": "", "labelZh": "", "valueEn": "", "valueZh": ""}], "titleEn": "231", "titleZh": "1231"}]	2026-04-30 02:16:47.888	2026-04-30 06:00:19.358
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

\unrestrict AxLMJd6UjsP1PGfN2NTWY5tmAc0yYBVTo5EKsKKy16SSDxGCSGwfh0NpkzRj9bs

