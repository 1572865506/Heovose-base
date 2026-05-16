--
-- PostgreSQL database dump
--

\restrict FO1gC0sjkgUFfb9DXlhNDe0PV3Q409XWJRdmaHhTZOc9hqGcyoeeaid5WvZgmvS

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
-- Name: AnalyticsEvent; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."AnalyticsEvent" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    type text NOT NULL,
    path text NOT NULL,
    x double precision,
    y double precision,
    element text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "extraData" jsonb
);


ALTER TABLE public."AnalyticsEvent" OWNER TO heovose;

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
    "imageUrl" text NOT NULL,
    brightness double precision,
    "descriptionTextId" text,
    "tagTextId" text,
    "titleTextId" text,
    published boolean DEFAULT true NOT NULL
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
    type text DEFAULT 'IMAGE'::text NOT NULL,
    brightness double precision
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    brightness double precision
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
    "galleryTitleZh" text,
    "galleryItems" jsonb,
    "casesSubtitleEn" text,
    "casesSubtitleZh" text,
    "casesTitleEn" text,
    "casesTitleZh" text,
    "casesSubtitleTextId" text DEFAULT 'CASES_SUBTITLE'::text,
    "casesTitleTextId" text DEFAULT 'CASES_TITLE'::text,
    "processSubtitleTextId" text DEFAULT 'PROCESS_SUBTITLE'::text,
    "processTitleTextId" text DEFAULT 'PROCESS_TITLE'::text,
    "mapSubtitleTextId" text DEFAULT 'MAP_SUBTITLE'::text,
    "mapTitleTextId" text DEFAULT 'MAP_TITLE'::text
);


ALTER TABLE public."HomepageContent" OWNER TO heovose;

--
-- Name: Inquiry; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."Inquiry" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    subject text,
    message text NOT NULL,
    "productId" text,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailViewedAt" timestamp(3) without time zone
);


ALTER TABLE public."Inquiry" OWNER TO heovose;

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
    "homepageId" text NOT NULL,
    "addressTextId" text,
    "descTextId" text,
    "titleTextId" text,
    "order" integer DEFAULT 0 NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "galleryImageBrightnesses" double precision[],
    "mainImageBrightness" double precision
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
    "order" integer DEFAULT 0 NOT NULL,
    "thumbnailBrightness" double precision
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
    "imageUrls" text[],
    brightnesses double precision[],
    "descriptionTextId" text,
    "titleTextId" text
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    "lastSeen" timestamp(3) without time zone
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
-- Name: VisitorSession; Type: TABLE; Schema: public; Owner: heovose
--

CREATE TABLE public."VisitorSession" (
    id text NOT NULL,
    "visitorId" text NOT NULL,
    ip text,
    country text,
    city text,
    "userAgent" text,
    referrer text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastPath" text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VisitorSession" OWNER TO heovose;

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
-- Data for Name: AnalyticsEvent; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."AnalyticsEvent" (id, "sessionId", type, path, x, y, element, "timestamp", "extraData") FROM stdin;
cmp3c0vmv0001ukb3rzqneikj	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:39:23.431	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c0w220003ukb3rnp5kok1	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 00:39:23.978	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c0ws90005ukb3uj6fmrvm	sess_aoypdp8jmn_1778632764381	PAGEVIEW	/design-system	\N	\N	\N	2026-05-13 00:39:24.922	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c46xr0008ukb3eih84842	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:41:58.047	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c5hgl000aukb3s3bt2k57	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:42:58.342	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c7557000cukb3jxu2a9iy	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-13 00:44:15.67	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c79bh000eukb3pax6jawy	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 00:44:21.102	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3c8qmp000gukb33rsot1xh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:45:30.193	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cacw6000iukb3ts4dn732	sess_yqiejy75aqj_1778632761370	CLICK	/	36.22047244094488	2.520542420728941	DIV	2026-05-13 00:46:45.701	{"screenWidth": 1920, "screenHeight": 945}
cmp3caksn000kukb35u4hitxd	sess_yqiejy75aqj_1778632761370	CLICK	/	32.75590551181102	2.470131572314362	DIV	2026-05-13 00:46:55.943	{"screenWidth": 1920, "screenHeight": 945}
cmp3cavxo000mukb3jy1arxk0	sess_yqiejy75aqj_1778632761370	CLICK	/	68.66141732283465	2.838130765740787	DIV	2026-05-13 00:47:10.381	{"screenWidth": 1920, "screenHeight": 945}
cmp3cb7tu000oukb3yjz236pr	sess_s8iyecsd0xb_1778633245089	PAGEVIEW	/	\N	\N	\N	2026-05-13 00:47:25.794	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3cblph000qukb3jwkguek1	sess_s8iyecsd0xb_1778633245089	CLICK	/	79.87388334209143	0.2174363222199213	BUTTON	2026-05-13 00:47:43.78	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbmco000sukb3p6ovtsyl	sess_s8iyecsd0xb_1778633245089	CLICK	/	87.07304256437205	0.8490370677158832	DIV	2026-05-13 00:47:44.616	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbn0j000uukb3mdaq67ry	sess_s8iyecsd0xb_1778633245089	CLICK	/	85.9375	0.2226133775108718	SPAN	2026-05-13 00:47:45.475	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbo5t000wukb30sripcgz	sess_s8iyecsd0xb_1778633245089	CLICK	/	41.5625	1.703251190722717	INPUT	2026-05-13 00:47:46.961	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbokn000yukb3az6q3r2w	sess_s8iyecsd0xb_1778633245089	CLICK	/	54.16666666666666	1.811969351832678	INPUT	2026-05-13 00:47:47.495	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbp6q0010ukb3smvrsi29	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.86458333333334	2.34520604680058	INPUT	2026-05-13 00:47:48.291	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbphv0012ukb3p4xyng6k	sess_s8iyecsd0xb_1778633245089	CLICK	/	45.20833333333334	2.319320770345827	INPUT	2026-05-13 00:47:48.691	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbpy50014ukb3zjo0xdd0	sess_s8iyecsd0xb_1778633245089	CLICK	/	55.15624999999999	3.085524953406502	TEXTAREA	2026-05-13 00:47:49.277	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbqhn0016ukb3d9p0l6qb	sess_s8iyecsd0xb_1778633245089	CLICK	/	76.25	1.83785462828743	DIV	2026-05-13 00:47:49.979	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbs3a0018ukb3na4m0pim	sess_s8iyecsd0xb_1778633245089	CLICK	/	87.08333333333333	0.1190722716918617	BUTTON	2026-05-13 00:47:52.054	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbsws001aukb38rj7kn6s	sess_s8iyecsd0xb_1778633245089	CLICK	/	73.28125	1.905156347069787	DIV	2026-05-13 00:47:53.116	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbtsl001cukb3agrwrxgw	sess_s8iyecsd0xb_1778633245089	CLICK	/	85.36458333333333	0.2588527645475254	BUTTON	2026-05-13 00:47:54.262	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbv1l001eukb3nu0psluz	sess_s8iyecsd0xb_1778633245089	CLICK	/	83.85416666666666	1.599710084903707	DIV	2026-05-13 00:47:55.881	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbwsv001gukb3lsmobbz7	sess_s8iyecsd0xb_1778633245089	CLICK	/	83.59375	0.2019051563470698	SPAN	2026-05-13 00:47:58.16	{"screenWidth": 1920, "screenHeight": 911}
cmp3cbz1h001iukb3u6vdhued	sess_s8iyecsd0xb_1778633245089	CLICK	/	80.52083333333333	1.299440878028577	DIV	2026-05-13 00:48:01.06	{"screenWidth": 1920, "screenHeight": 911}
cmp3ccunk001kukb367frbkxz	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.54860746190226	91.11617312072893	BUTTON	2026-05-13 00:48:42.032	{"screenWidth": 1920, "screenHeight": 911}
cmp3ccvth001mukb3bygdefpm	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.54860746190226	91.11617312072893	BUTTON	2026-05-13 00:48:43.542	{"screenWidth": 1920, "screenHeight": 911}
cmp3ccwsb001oukb35v1olwp1	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.54860746190226	91.11617312072893	BUTTON	2026-05-13 00:48:44.795	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdejz001qukb3enaq80wg	sess_s8iyecsd0xb_1778633245089	CLICK	/	69.62690488702049	89.75460757920895	DIV	2026-05-13 00:49:07.799	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdf81001sukb3eypfpqsn	sess_s8iyecsd0xb_1778633245089	CLICK	/	74.56647398843931	89.60965003106233	DIV	2026-05-13 00:49:08.689	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdhkz001uukb3wp9q1inx	sess_s8iyecsd0xb_1778633245089	CLICK	/	35.15625	84.24104369434666	IMG	2026-05-13 00:49:11.748	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdifi001wukb3kakit2fs	sess_s8iyecsd0xb_1778633245089	CLICK	/	76.19791666666667	84.37047007662042	IMG	2026-05-13 00:49:12.847	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdk2s001yukb3aucwyax4	sess_s8iyecsd0xb_1778633245089	CLICK	/	50.9196006305833	89.69248291571755	DIV	2026-05-13 00:49:14.98	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdkzi0020ukb3zszwmr9g	sess_s8iyecsd0xb_1778633245089	CLICK	/	80.76720966894378	91.55104576516877	DIV	2026-05-13 00:49:16.158	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdm9f0022ukb3m8witria	sess_s8iyecsd0xb_1778633245089	CLICK	/	50.65685759327378	88.75025885276455	DIV	2026-05-13 00:49:17.811	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdn8i0024ukb3nrc10hvd	sess_s8iyecsd0xb_1778633245089	CLICK	/	85.23384130320547	88.40857320356182	DIV	2026-05-13 00:49:19.074	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdof30026ukb3qjnkreen	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.23331581713084	94.54338372333817	DIV	2026-05-13 00:49:20.607	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdpch0028ukb3pilwg30f	sess_s8iyecsd0xb_1778633245089	CLICK	/	85.02364687335786	94.49161317042865	DIV	2026-05-13 00:49:21.809	{"screenWidth": 1920, "screenHeight": 911}
cmp3cdxwr002aukb3kkh3iy6i	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:49:32.887	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ceuvv002cukb3ulc1mqep	sess_yqiejy75aqj_1778632761370	CLICK	/	83.02083333333333	3.715279528154459	SPAN	2026-05-13 00:50:15.642	{"screenWidth": 1920, "screenHeight": 945}
cmp3cevj2002eukb3iyczckvb	sess_yqiejy75aqj_1778632761370	CLICK	/	43.17708333333334	5.338508847103897	INPUT	2026-05-13 00:50:16.478	{"screenWidth": 1920, "screenHeight": 945}
cmp3cfcsn002gukb31ynmxrh8	sess_yqiejy75aqj_1778632761370	CLICK	/	50.83333333333333	7.077683117406866	BUTTON	2026-05-13 00:50:38.854	{"screenWidth": 1920, "screenHeight": 945}
cmp3cfhzf002jukb30ghku4la	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:50:45.579	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ci2i1002lukb3iyldv9hh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:52:45.481	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cif7c002nukb38e8bmst3	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:53:01.944	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cko16002pukb339q0h2oi	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 00:54:46.698	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cl7tr002rukb3qznypcog	sess_r0krawi1bq_1778633713095	PAGEVIEW	/	\N	\N	\N	2026-05-13 00:55:12.351	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp3cle19002tukb3epnmcxy4	sess_r0krawi1bq_1778633713095	CLICK	/	79.49393779652083	0.1704457414389753	BUTTON	2026-05-13 00:55:20.397	{"screenWidth": 1912, "screenHeight": 914}
cmp3clej1002vukb31fsme75h	sess_r0krawi1bq_1778633713095	CLICK	/	88.03373748023195	1.4823614482723	DIV	2026-05-13 00:55:21.037	{"screenWidth": 1912, "screenHeight": 914}
cmp3clf6i002xukb3birnfjat	sess_r0krawi1bq_1778633713095	CLICK	/	86.14016736401673	0.1911058313103662	SPAN	2026-05-13 00:55:21.882	{"screenWidth": 1912, "screenHeight": 914}
cmp3clfzb002zukb3ncp7ji1h	sess_r0krawi1bq_1778633713095	CLICK	/	89.06903765690377	1.978203605185683	DIV	2026-05-13 00:55:22.919	{"screenWidth": 1912, "screenHeight": 914}
cmp3cltlq0031ukb3qgjxs0vp	sess_r0krawi1bq_1778633713095	CLICK	/	37.55230125523013	16.59005216672693	BUTTON	2026-05-13 00:55:40.572	{"screenWidth": 1912, "screenHeight": 914}
cmp3clu4n0033ukb3vv5q7pc9	sess_r0krawi1bq_1778633713095	CLICK	/	52.82426778242678	17.48360105366458	DIV	2026-05-13 00:55:41.255	{"screenWidth": 1912, "screenHeight": 914}
cmp3clxli0035ukb3zrtuxs2g	sess_r0krawi1bq_1778633713095	CLICK	/	45.0836820083682	46.15464077268736	IMG	2026-05-13 00:55:45.75	{"screenWidth": 1912, "screenHeight": 914}
cmp3cly670037ukb3pvhtt62n	sess_r0krawi1bq_1778633713095	CLICK	/	84.2050209205021	46.26827126698001	IMG	2026-05-13 00:55:46.495	{"screenWidth": 1912, "screenHeight": 914}
cmp3clym90039ukb37ictn1hg	sess_r0krawi1bq_1778633713095	CLICK	/	41.84100418410041	46.03584525592687	IMG	2026-05-13 00:55:47.073	{"screenWidth": 1912, "screenHeight": 914}
cmp3clyy0003bukb33mtfto7x	sess_r0krawi1bq_1778633713095	CLICK	/	45.86820083682008	45.89122462682712	IMG	2026-05-13 00:55:47.496	{"screenWidth": 1912, "screenHeight": 914}
cmp3cm545003dukb3vn1kl4cq	sess_r0krawi1bq_1778633713095	CLICK	/	52.82024248813917	91.05418108568773	svg	2026-05-13 00:55:55.492	{"screenWidth": 1912, "screenHeight": 914}
cmp3cm6ci003fukb33i3z1uhg	sess_r0krawi1bq_1778633713095	CLICK	/	53.08381655245123	91.13165642270545	BUTTON	2026-05-13 00:55:57.091	{"screenWidth": 1912, "screenHeight": 914}
cmp3cm6qc003hukb3qzs77drq	sess_r0krawi1bq_1778633713095	CLICK	/	53.08381655245123	91.13165642270545	BUTTON	2026-05-13 00:55:57.589	{"screenWidth": 1912, "screenHeight": 914}
cmp3cm99p003jukb38qs38b02	sess_r0krawi1bq_1778633713095	CLICK	/	52.97838692672641	91.09033624296265	BUTTON	2026-05-13 00:56:00.878	{"screenWidth": 1912, "screenHeight": 914}
cmp3cma30003lukb3j4jyr9dl	sess_r0krawi1bq_1778633713095	CLICK	/	49.60463890353189	91.0180259284128	DIV	2026-05-13 00:56:01.932	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmffr003nukb3qipuqeum	sess_r0krawi1bq_1778633713095	CLICK	/	52.18766473379019	91.04385104075202	svg	2026-05-13 00:56:08.871	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmg2q003pukb3s3ot1dqz	sess_r0krawi1bq_1778633713095	CLICK	/	49.86821296784397	89.42719900831568	DIV	2026-05-13 00:56:09.698	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmgtw003rukb3rekzkp9j	sess_r0krawi1bq_1778633713095	CLICK	/	57.77543489720611	90.84241516450597	DIV	2026-05-13 00:56:10.675	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmh4a003tukb3rr2vgg2n	sess_r0krawi1bq_1778633713095	CLICK	/	52.82024248813917	89.44785909818708	DIV	2026-05-13 00:56:11.051	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmhi6003vukb3qtgmlcic	sess_r0krawi1bq_1778633713095	CLICK	/	62.04533473906167	91.3434223438872	DIV	2026-05-13 00:56:11.55	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmhyt003xukb3dccyb7b9	sess_r0krawi1bq_1778633713095	CLICK	/	75.96204533473906	89.93337121016476	DIV	2026-05-13 00:56:12.149	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmimp003zukb3gn2obanx	sess_r0krawi1bq_1778633713095	CLICK	/	50.07907221929362	89.64412995196528	DIV	2026-05-13 00:56:13.009	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmj0s0041ukb3x0avxtd6	sess_r0krawi1bq_1778633713095	CLICK	/	59.40959409594095	91.4622178606477	DIV	2026-05-13 00:56:13.516	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmkeo0043ukb35l2jac9z	sess_r0krawi1bq_1778633713095	CLICK	/	13.75856615709014	94.07571922937865	DIV	2026-05-13 00:56:15.312	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmjlg0045ukb3v7bges0t	sess_r0krawi1bq_1778633713095	CLICK	/	87.08487084870849	95.16037394762668	DIV	2026-05-13 00:56:14.26	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmjxu0047ukb3amzudx57	sess_r0krawi1bq_1778633713095	CLICK	/	33.15761729045862	94.12220443158927	DIV	2026-05-13 00:56:14.706	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmkem0049ukb3nt6g3b8p	sess_r0krawi1bq_1778633713095	CLICK	/	85.08170795993675	94.54057125148493	DIV	2026-05-13 00:56:15.31	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmkqd004bukb3rdxrs0dj	sess_r0krawi1bq_1778633713095	CLICK	/	52.87295730100158	94.26166003822117	DIV	2026-05-13 00:56:15.733	{"screenWidth": 1912, "screenHeight": 914}
cmp3cml45004dukb335egmy0s	sess_r0krawi1bq_1778633713095	CLICK	/	86.4522930943595	94.57672640875988	DIV	2026-05-13 00:56:16.229	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmlhf004fukb33q8f5l29	sess_r0krawi1bq_1778633713095	CLICK	/	63.31049024775962	94.20484479107483	DIV	2026-05-13 00:56:16.707	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmlqz004hukb3s4ac3kq7	sess_r0krawi1bq_1778633713095	CLICK	/	86.82129678439642	94.58705645369557	DIV	2026-05-13 00:56:17.051	{"screenWidth": 1912, "screenHeight": 914}
cmp3cmukd004jukb3cu3ahe6n	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:56:28.478	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cnaep004lukb3l0lgso7n	sess_yqiejy75aqj_1778632761370	CLICK	/	84.73958333333333	5.696425870847406	SPAN	2026-05-13 00:56:49.008	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnav0004nukb3s277t5he	sess_yqiejy75aqj_1778632761370	CLICK	/	45.83333333333333	7.334778444321217	INPUT	2026-05-13 00:56:49.596	{"screenWidth": 1920, "screenHeight": 945}
cmp3cncpn004pukb3apc2cf6h	sess_yqiejy75aqj_1778632761370	CLICK	/	54.27083333333334	7.440641225991833	INPUT	2026-05-13 00:56:51.995	{"screenWidth": 1920, "screenHeight": 945}
cmp3cneh7004rukb3nbp12na8	sess_yqiejy75aqj_1778632761370	CLICK	/	44.0625	7.949790794979079	INPUT	2026-05-13 00:56:54.284	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnexl004tukb32sk3ishz	sess_yqiejy75aqj_1778632761370	CLICK	/	54.0625	7.344860614004133	INPUT	2026-05-13 00:56:54.874	{"screenWidth": 1920, "screenHeight": 945}
cmp3cniat004vukb3az456nuc	sess_yqiejy75aqj_1778632761370	CLICK	/	42.8125	7.944749710137621	INPUT	2026-05-13 00:56:59.237	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnjje004xukb35tpxage9	sess_yqiejy75aqj_1778632761370	CLICK	/	54.63541666666667	7.904421031405959	INPUT	2026-05-13 00:57:00.842	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnkgb004zukb3syxqf7ye	sess_yqiejy75aqj_1778632761370	CLICK	/	49.11458333333334	8.610172909210062	TEXTAREA	2026-05-13 00:57:02.027	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnljp0051ukb3hm3dvksc	sess_yqiejy75aqj_1778632761370	CLICK	/	50.52083333333334	9.068911629782729	BUTTON	2026-05-13 00:57:03.445	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnnjs0054ukb3pzvruokk	sess_yqiejy75aqj_1778632761370	CLICK	/	86.71875	5.716590210213238	SPAN	2026-05-13 00:57:06.039	{"screenWidth": 1920, "screenHeight": 945}
cmp3cno2t0056ukb3hcaher8d	sess_yqiejy75aqj_1778632761370	CLICK	/	43.64583333333334	7.430559056308918	INPUT	2026-05-13 00:57:06.725	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnrju0058ukb3b48wz584	sess_yqiejy75aqj_1778632761370	CLICK	/	53.28125	7.380148207894339	INPUT	2026-05-13 00:57:11.226	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnu4u005aukb3u64xw3jb	sess_yqiejy75aqj_1778632761370	CLICK	/	44.0625	7.818722589101175	INPUT	2026-05-13 00:57:14.574	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnuu9005cukb3f12si50x	sess_yqiejy75aqj_1778632761370	CLICK	/	55.00000000000001	7.859051267832838	INPUT	2026-05-13 00:57:15.489	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnur2005eukb3sdl257d6	sess_yqiejy75aqj_1778632761370	CLICK	/	50.20833333333334	9.078993799465646	BUTTON	2026-05-13 00:57:15.375	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnwz9005hukb3zfx2xfs0	sess_yqiejy75aqj_1778632761370	CLICK	/	86.82291666666667	5.731713464737612	SPAN	2026-05-13 00:57:18.26	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnxfz005jukb3bub0doyy	sess_yqiejy75aqj_1778632761370	CLICK	/	43.02083333333334	7.309573020113929	INPUT	2026-05-13 00:57:18.864	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnys5005lukb3j3dq5xau	sess_yqiejy75aqj_1778632761370	CLICK	/	42.39583333333334	7.415435801784544	INPUT	2026-05-13 00:57:20.597	{"screenWidth": 1920, "screenHeight": 945}
cmp3cnzpe005nukb3zev1uhaj	sess_yqiejy75aqj_1778632761370	CLICK	/	53.59374999999999	7.349901698845591	INPUT	2026-05-13 00:57:21.794	{"screenWidth": 1920, "screenHeight": 945}
cmp3co0m0005pukb3n8kb5111	sess_yqiejy75aqj_1778632761370	CLICK	/	44.84375	7.848969098149921	INPUT	2026-05-13 00:57:22.968	{"screenWidth": 1920, "screenHeight": 945}
cmp3co1he005rukb3ejudb37v	sess_yqiejy75aqj_1778632761370	CLICK	/	54.63541666666667	7.859051267832838	INPUT	2026-05-13 00:57:24.098	{"screenWidth": 1920, "screenHeight": 945}
cmp3co265005tukb3bz39gbos	sess_yqiejy75aqj_1778632761370	CLICK	/	50.67708333333333	8.418611685234662	TEXTAREA	2026-05-13 00:57:24.989	{"screenWidth": 1920, "screenHeight": 945}
cmp3co3bl005vukb3h5lf790h	sess_yqiejy75aqj_1778632761370	CLICK	/	49.375	9.104199223672934	BUTTON	2026-05-13 00:57:26.481	{"screenWidth": 1920, "screenHeight": 945}
cmp3co5o3005yukb35mmog0tu	sess_yqiejy75aqj_1778632761370	CLICK	/	85.26041666666667	5.706508040530322	SPAN	2026-05-13 00:57:29.523	{"screenWidth": 1920, "screenHeight": 945}
cmp3co6ll0060ukb3d1wyg673	sess_yqiejy75aqj_1778632761370	CLICK	/	43.4375	7.370066038211423	INPUT	2026-05-13 00:57:30.729	{"screenWidth": 1920, "screenHeight": 945}
cmp3co7vd0062ukb3f5v9vpfr	sess_yqiejy75aqj_1778632761370	CLICK	/	54.37499999999999	7.410394716943086	INPUT	2026-05-13 00:57:32.377	{"screenWidth": 1920, "screenHeight": 945}
cmp3codr30064ukb3lnjuvrd9	sess_yqiejy75aqj_1778632761370	CLICK	/	54.79166666666667	7.899379946564501	INPUT	2026-05-13 00:57:39.998	{"screenWidth": 1920, "screenHeight": 945}
cmp3coedi0066ukb3imvs9qq7	sess_yqiejy75aqj_1778632761370	CLICK	/	48.02083333333334	8.51943338206382	TEXTAREA	2026-05-13 00:57:40.806	{"screenWidth": 1920, "screenHeight": 945}
cmp3coji20068ukb3ceixm55k	sess_yqiejy75aqj_1778632761370	CLICK	/	46.35416666666667	8.463981448807784	TEXTAREA	2026-05-13 00:57:47.45	{"screenWidth": 1920, "screenHeight": 945}
cmp3cpkit006aukb3wkf3gvzy	sess_yqiejy75aqj_1778632761370	CLICK	/	49.27083333333334	9.109240308514392	BUTTON	2026-05-13 00:58:35.428	{"screenWidth": 1920, "screenHeight": 945}
cmp3cpnwe006dukb3pp1hh5b5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 00:58:39.806	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cvs78006fukb3ng5ugygy	sess_yqiejy75aqj_1778632761370	CLICK	/	84.16666666666667	5.706508040530322	SPAN	2026-05-13 01:03:25.316	{"screenWidth": 1920, "screenHeight": 945}
cmp3cvznc006hukb3yll8xz2p	sess_yqiejy75aqj_1778632761370	CLICK	/	43.38541666666666	8.438776024600495	TEXTAREA	2026-05-13 01:03:34.966	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw0zv006jukb32lsgle00	sess_yqiejy75aqj_1778632761370	CLICK	/	42.44791666666667	7.309573020113929	INPUT	2026-05-13 01:03:36.715	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw2ol006lukb3uzfxgyhm	sess_yqiejy75aqj_1778632761370	CLICK	/	42.86458333333334	7.385189292735797	INPUT	2026-05-13 01:03:38.901	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw2t3006nukb32fcc7qbn	sess_yqiejy75aqj_1778632761370	CLICK	/	42.86458333333334	7.385189292735797	INPUT	2026-05-13 01:03:39.063	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw2xo006pukb32t9xsc2d	sess_yqiejy75aqj_1778632761370	CLICK	/	42.86458333333334	7.385189292735797	INPUT	2026-05-13 01:03:39.228	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw5s9006rukb3w9fw627n	sess_yqiejy75aqj_1778632761370	CLICK	/	53.28125	7.380148207894339	INPUT	2026-05-13 01:03:42.922	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw6zq006tukb30bu03ko5	sess_yqiejy75aqj_1778632761370	CLICK	/	41.61458333333334	7.859051267832838	INPUT	2026-05-13 01:03:44.487	{"screenWidth": 1920, "screenHeight": 945}
cmp3cw81n006vukb3p525edn1	sess_yqiejy75aqj_1778632761370	CLICK	/	53.48958333333334	7.884256692040127	INPUT	2026-05-13 01:03:45.851	{"screenWidth": 1920, "screenHeight": 945}
cmp3cwb37006xukb3gz877zs5	sess_yqiejy75aqj_1778632761370	CLICK	/	53.33333333333334	7.924585370771791	INPUT	2026-05-13 01:03:49.795	{"screenWidth": 1920, "screenHeight": 945}
cmp3cwb7h006zukb3oswqglyi	sess_yqiejy75aqj_1778632761370	CLICK	/	53.33333333333334	7.924585370771791	INPUT	2026-05-13 01:03:49.949	{"screenWidth": 1920, "screenHeight": 945}
cmp3cwbug0071ukb3qzs4yivi	sess_yqiejy75aqj_1778632761370	CLICK	/	54.58333333333333	8.126228764430106	DIV	2026-05-13 01:03:50.776	{"screenWidth": 1920, "screenHeight": 945}
cmp3cwcg30073ukb3fc7h2cah	sess_yqiejy75aqj_1778632761370	CLICK	/	52.65625000000001	9.104199223672934	BUTTON	2026-05-13 01:03:51.555	{"screenWidth": 1920, "screenHeight": 945}
cmp3cwivb0076ukb3rb3ipa62	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 01:03:59.879	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3cxhlt0078ukb3fn5jpkcc	sess_yqiejy75aqj_1778632761370	CLICK	/	87.08333333333333	5.751877804103443	SPAN	2026-05-13 01:04:44.896	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxia5007aukb3zwt1q8qw	sess_yqiejy75aqj_1778632761370	CLICK	/	53.48958333333334	9.144527902404597	BUTTON	2026-05-13 01:04:45.773	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxjf9007cukb3g8lbpftw	sess_yqiejy75aqj_1778632761370	CLICK	/	45.67708333333334	7.228915662650602	INPUT	2026-05-13 01:04:47.253	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxkt6007eukb3uo9m2v8m	sess_yqiejy75aqj_1778632761370	CLICK	/	49.79166666666666	9.169733326611887	BUTTON	2026-05-13 01:04:49.05	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxlui007gukb3ba8mmzq7	sess_yqiejy75aqj_1778632761370	CLICK	/	50.625	8.443817109441952	TEXTAREA	2026-05-13 01:04:50.394	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxm71007iukb3bwxoqztw	sess_yqiejy75aqj_1778632761370	CLICK	/	55.10416666666666	7.233956747492059	INPUT	2026-05-13 01:04:50.846	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxmpd007kukb3egt8k7go	sess_yqiejy75aqj_1778632761370	CLICK	/	59.84374999999999	6.729848263346272	DIV	2026-05-13 01:04:51.506	{"screenWidth": 1920, "screenHeight": 945}
cmp3cxnsy007mukb3c4is5ojm	sess_yqiejy75aqj_1778632761370	CLICK	/	61.61458333333333	6.462670766749004	svg	2026-05-13 01:04:52.93	{"screenWidth": 1920, "screenHeight": 945}
cmp3d19gv007oukb3gqfkfww0	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	62.67716535433071	31.03662873399716	TD	2026-05-13 01:07:40.95	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1l5o007qukb3quv7qvp8	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	58.21522309711285	75.6667852062589	P	2026-05-13 01:07:56.123	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1lvk007sukb32jhpvpva	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	33.54330708661417	75.63122332859174	DIV	2026-05-13 01:07:57.056	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1mlu007uukb3klp1pmfa	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	42.72965879265092	74.81106072730506	BUTTON	2026-05-13 01:07:58.003	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1olj007wukb3s7de2px2	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	59.47506561679789	74.82884324708812	H5	2026-05-13 01:08:00.583	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1pas007yukb3jilmqm32	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	59.16010498687664	75.1822546230441	BUTTON	2026-05-13 01:08:01.493	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1q9w0080ukb3dooqhqsj	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	56.74540682414698	75.87571123755335	P	2026-05-13 01:08:02.756	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1qte0082ukb3fmibx86h	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	58.37270341207349	74.71995021337126	BUTTON	2026-05-13 01:08:03.458	{"screenWidth": 1920, "screenHeight": 945}
cmp3d1rjl0084ukb3ybqbgykx	sess_aoypdp8jmn_1778632764381	CLICK	/design-system	58.26771653543307	75.99128733997155	DIV	2026-05-13 01:08:04.402	{"screenWidth": 1920, "screenHeight": 945}
cmp3e16z70001uk66q4fuvdw0	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/login	\N	\N	\N	2026-05-13 01:35:37.363	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e17iq0003uk66mwm8zlba	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 01:35:38.067	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e2xme0005uk66wmbpb0a0	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 01:36:58.55	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e32pj0007uk66k84u6cse	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 01:37:05.143	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e48au0009uk66ca9src2v	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 01:37:59.046	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e6h2y000buk66gmmojirq	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/map	\N	\N	\N	2026-05-13 01:39:43.739	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e6mg6000duk66ut6ra1zm	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/cases	\N	\N	\N	2026-05-13 01:39:50.695	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e6xdl000fuk66qtvzcopf	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/steps	\N	\N	\N	2026-05-13 01:40:04.857	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e74kd000huk66mjqmcuhy	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 01:40:14.173	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3e7ahk000juk66whnd6xjt	sess_yqiejy75aqj_1778632761370	CLICK	/	85.57291666666667	0.2218077330241468	SPAN	2026-05-13 01:40:21.77	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7erz000luk66n35ircgv	sess_yqiejy75aqj_1778632761370	CLICK	/	82.39583333333333	1.320764228461965	DIV	2026-05-13 01:40:27.407	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7f72000nuk66d1sq22z9	sess_yqiejy75aqj_1778632761370	CLICK	/	78.26771653543307	0.2066844784997732	SPAN	2026-05-13 01:40:27.951	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7g11000puk66ov1i3p04	sess_yqiejy75aqj_1778632761370	CLICK	/	75.38057742782152	1.084972622186169	SPAN	2026-05-13 01:40:29.03	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7gjq000ruk666s2r3d9a	sess_yqiejy75aqj_1778632761370	CLICK	/	85.52083333333333	0.1865201391339416	SPAN	2026-05-13 01:40:29.702	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7ijj000tuk660ins0jyx	sess_yqiejy75aqj_1778632761370	CLICK	/	73.69791666666666	1.345969652669254	DIV	2026-05-13 01:40:32.288	{"screenWidth": 1920, "screenHeight": 945}
cmp3e7zyt000vuk66gq9ly5cw	sess_yqiejy75aqj_1778632761370	CLICK	/	84.32291666666667	0.211725563341231	SPAN	2026-05-13 01:40:54.867	{"screenWidth": 1920, "screenHeight": 945}
cmp3e8prt000xuk66glvki0ub	sess_yqiejy75aqj_1778632761370	CLICK	/	57.65625	1.789585118717548	INPUT	2026-05-13 01:41:28.312	{"screenWidth": 1920, "screenHeight": 945}
cmp3e8qg0000zuk66k3rwf4uj	sess_yqiejy75aqj_1778632761370	CLICK	/	56.875	1.441750264656954	DIV	2026-05-13 01:41:29.185	{"screenWidth": 1920, "screenHeight": 945}
cmp3e8r6q0011uk66004q6ozn	sess_yqiejy75aqj_1778632761370	CLICK	/	48.28125	2.888541614155366	TEXTAREA	2026-05-13 01:41:30.146	{"screenWidth": 1920, "screenHeight": 945}
cmp3e8s610013uk66f050s413	sess_yqiejy75aqj_1778632761370	CLICK	/	57.29166666666666	1.265312295205928	H2	2026-05-13 01:41:31.418	{"screenWidth": 1920, "screenHeight": 945}
cmp3e8t290015uk66k3qx4y26	sess_yqiejy75aqj_1778632761370	CLICK	/	61.61458333333333	1.013258053133034	svg	2026-05-13 01:41:32.577	{"screenWidth": 1920, "screenHeight": 945}
cmp3e97bb0017uk66a0njmfrx	sess_kl7qarqfh5_1778636508194	PAGEVIEW	/	\N	\N	\N	2026-05-13 01:41:51.048	{"referrer": "", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1"}
cmp3e9cdc0019uk66lojpu37g	sess_kl7qarqfh5_1778636508194	CLICK	/	90.46511627906978	1.581863979848867	line	2026-05-13 01:41:57.6	{"screenWidth": 430, "screenHeight": 775}
cmp3e9dnv001buk66zrds7iu6	sess_kl7qarqfh5_1778636508194	CLICK	/	85.34883720930233	4.418136020151134	BUTTON	2026-05-13 01:41:59.275	{"screenWidth": 430, "screenHeight": 775}
cmp3e9f6a001duk66zyc0p2ne	sess_kl7qarqfh5_1778636508194	CLICK	/	84.18604651162791	2.025188916876574	DIV	2026-05-13 01:42:01.234	{"screenWidth": 430, "screenHeight": 775}
cmp3e9h88001fuk66wiy0bgsq	sess_kl7qarqfh5_1778636508194	CLICK	/	80.46511627906978	2.35264483627204	INPUT	2026-05-13 01:42:03.896	{"screenWidth": 430, "screenHeight": 775}
cmp3e9idi001huk660wdg9t0o	sess_kl7qarqfh5_1778636508194	CLICK	/	62.7906976744186	2.599496221662469	DIV	2026-05-13 01:42:05.382	{"screenWidth": 323, "screenHeight": 582}
cmp3e9l61001juk66jrjiqxi3	sess_kl7qarqfh5_1778636508194	CLICK	/	70.46511627906978	2.866498740554156	INPUT	2026-05-13 01:42:09.002	{"screenWidth": 400, "screenHeight": 722}
cmp3e9mii001luk66nl9pfklp	sess_kl7qarqfh5_1778636508194	CLICK	/	68.13953488372093	3.259445843828716	INPUT	2026-05-13 01:42:10.746	{"screenWidth": 323, "screenHeight": 582}
cmp3e9n73001nuk66oxi2v7kr	sess_kl7qarqfh5_1778636508194	CLICK	/	59.30232558139535	3.863979848866498	INPUT	2026-05-13 01:42:11.631	{"screenWidth": 323, "screenHeight": 582}
cmp3e9nsg001puk66xn5s23h2	sess_kl7qarqfh5_1778636508194	CLICK	/	62.09302325581395	4.317380352644836	TEXTAREA	2026-05-13 01:42:12.4	{"screenWidth": 323, "screenHeight": 582}
cmp3e9oow001ruk66yqrckn2g	sess_kl7qarqfh5_1778636508194	CLICK	/	63.72093023255814	4.045340050377834	DIV	2026-05-13 01:42:13.568	{"screenWidth": 323, "screenHeight": 582}
cmp3e9tbm001tuk662et3h3jb	sess_kl7qarqfh5_1778636508194	CLICK	/	71.16279069767441	6.413098236775819	TEXTAREA	2026-05-13 01:42:19.569	{"screenWidth": 430, "screenHeight": 815}
cmp3e9v33001vuk66s54wc10u	sess_kl7qarqfh5_1778636508194	CLICK	/	63.25581395348837	5.98992443324937	DIV	2026-05-13 01:42:21.855	{"screenWidth": 323, "screenHeight": 612}
cmp3e9vvh001xuk66ttwwf2a2	sess_kl7qarqfh5_1778636508194	CLICK	/	58.13953488372093	7.219143576826196	INPUT	2026-05-13 01:42:22.877	{"screenWidth": 323, "screenHeight": 612}
cmp3e9x9e001zuk66733kvqvs	sess_kl7qarqfh5_1778636508194	CLICK	/	54.88372093023256	8.71536523929471	TEXTAREA	2026-05-13 01:42:24.674	{"screenWidth": 323, "screenHeight": 612}
cmp3ea1410021uk66ezr3q5md	sess_kl7qarqfh5_1778636508194	CLICK	/	96.27906976744185	7.828715365239295	DIV	2026-05-13 01:42:29.665	{"screenWidth": 430, "screenHeight": 815}
cmp3ea1qw0023uk66w1n6v30f	sess_kl7qarqfh5_1778636508194	CLICK	/	93.48837209302326	7.889168765743074	path	2026-05-13 01:42:30.488	{"screenWidth": 430, "screenHeight": 815}
cmp3ea4ac0025uk66jhstexqq	sess_kl7qarqfh5_1778636508194	CLICK	/	66.97674418604652	16.38287153652393	BUTTON	2026-05-13 01:42:33.779	{"screenWidth": 430, "screenHeight": 815}
cmp3ea7c60027uk664tw3m9x0	sess_kl7qarqfh5_1778636508194	CLICK	/	85.34883720930233	16.79596977329975	DIV	2026-05-13 01:42:37.735	{"screenWidth": 430, "screenHeight": 815}
cmp3ea8ra0029uk66pqrf7189	sess_kl7qarqfh5_1778636508194	CLICK	/	95.34883720930233	15.01259445843829	svg	2026-05-13 01:42:39.575	{"screenWidth": 430, "screenHeight": 815}
cmp3ebi0f002buk662mf0kaeh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-13 01:43:38.222	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3emj0d002duk66bxa0m3wh	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 01:52:12.733	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3f2gd9002fuk669fcdy73c	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 02:04:35.806	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3f40ir002huk66agvob5e4	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:05:48.579	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qgwpt00g9uk3kqou9iqf2	sess_ge4hcbj8iee_1778656957764	PAGEVIEW	/products	\N	\N	\N	2026-05-13 07:23:45.953	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp3faubl002juk66hqqqc8v5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 02:11:07.138	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3favc6002luk6643edkaci	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:11:08.455	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fe0p9002nuk66n1tu9cmx	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:13:35.373	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fgdzh002puk66l6uvzd81	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:15:25.901	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fgfyu002ruk66wgng0d49	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:15:28.47	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fghdd002tuk66vb90o98m	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:15:30.289	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fk3zh002vuk66ts1krd42	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:18:19.565	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fk9ab002xuk668i3ghhot	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:18:26.435	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fkr3r002zuk66j6b9muym	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/	\N	\N	\N	2026-05-13 02:18:49.527	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fkuji0031uk66y85xhu0n	sess_t1t3b6ulx19_1778632761310	CLICK	/	77.11286089238844	0.2470131572314362	BUTTON	2026-05-13 02:18:53.983	{"screenWidth": 1920, "screenHeight": 945}
cmp3fkx050033uk664omxurw0	sess_t1t3b6ulx19_1778632761310	CLICK	/	72.6509186351706	0.6692354491989455	DIV	2026-05-13 02:18:57.173	{"screenWidth": 1920, "screenHeight": 945}
cmp3fkyqz0035uk66boly2z65	sess_t1t3b6ulx19_1778632761310	CLICK	/	49.65879265091863	5.121742198921208	SECTION	2026-05-13 02:18:59.435	{"screenWidth": 1920, "screenHeight": 945}
cmp3fl4av0037uk66s9q6o97s	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:19:06.632	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3flpbl0039uk66p8ee05r5	sess_yqiejy75aqj_1778632761370	CLICK	/	43.09711286089239	4.068155467056511	DIV	2026-05-13 02:19:33.872	{"screenWidth": 1920, "screenHeight": 945}
cmp3flqrf003buk66ozemdilh	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/products	\N	\N	\N	2026-05-13 02:19:35.739	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3flvaq003duk66bw7g1qes	sess_yqiejy75aqj_1778632761370	CLICK	/products	16.64041994750656	43.66589327146171	BUTTON	2026-05-13 02:19:41.619	{"screenWidth": 1920, "screenHeight": 945}
cmp3flwdo003fuk66pdc6n6yy	sess_yqiejy75aqj_1778632761370	CLICK	/products	37.58530183727034	36.70533642691415	IMG	2026-05-13 02:19:43.02	{"screenWidth": 1920, "screenHeight": 945}
cmp3flydq003huk66y5lbtnyf	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/products/cmoibfi320008uknuhbf1oyi0	\N	\N	\N	2026-05-13 02:19:45.614	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fm5gg003juk66yxz1687d	sess_yqiejy75aqj_1778632761370	CLICK	/products/cmoibfi320008uknuhbf1oyi0	44.30446194225722	73.82899628252788	FOOTER	2026-05-13 02:19:54.783	{"screenWidth": 1920, "screenHeight": 945}
cmp3fm5si003luk66rmb4c2m5	sess_yqiejy75aqj_1778632761370	CLICK	/products/cmoibfi320008uknuhbf1oyi0	57.37532808398949	73.7918215613383	FOOTER	2026-05-13 02:19:55.218	{"screenWidth": 1920, "screenHeight": 945}
cmp3fm6e4003nuk662gi4jcyj	sess_yqiejy75aqj_1778632761370	CLICK	/products/cmoibfi320008uknuhbf1oyi0	70.23622047244095	73.71747211895911	FOOTER	2026-05-13 02:19:55.996	{"screenWidth": 1920, "screenHeight": 945}
cmp3fm6t7003puk6629wmussb	sess_yqiejy75aqj_1778632761370	CLICK	/products/cmoibfi320008uknuhbf1oyi0	79.26509186351706	73.68029739776951	FOOTER	2026-05-13 02:19:56.54	{"screenWidth": 1920, "screenHeight": 945}
cmp3fm829003ruk660o55cq5i	sess_yqiejy75aqj_1778632761370	CLICK	/products/cmoibfi320008uknuhbf1oyi0	16.95538057742782	25.79925650557621	IMG	2026-05-13 02:19:58.161	{"screenWidth": 1920, "screenHeight": 945}
cmp3fm8o3003tuk66rfdy4dnk	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 02:19:58.946	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fmbey003vuk66lb4uukvg	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 02:20:02.506	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fmmqc003xuk6676fgsyyg	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:20:17.172	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fnr7h003zuk66d3t5y2nm	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/products	\N	\N	\N	2026-05-13 02:21:09.629	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fnyfr0041uk66yivv49g3	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/products	\N	\N	\N	2026-05-13 02:21:18.999	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fpdxa0043uk66lmh1rcaa	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:22:25.726	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fpdxs0045uk66290uw0y5	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 02:22:25.721	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3fsxjb0047uk66anapyird	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/products/cmoibfi320008uknuhbf1oyi0	\N	\N	\N	2026-05-13 02:25:11.111	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3g0ry80001uktq2q5drvgd	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:31:17.12	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3g1fig0003uktqtoi0g266	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 02:31:47.656	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3g2coy0001uk7ae99jnhni	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 02:32:30.659	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3g73ju0003uk7a36sop6j5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:36:12.089	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gb4m40005uk7ayy814udr	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:39:20.091	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gecxn0007uk7a1cdvjovr	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:41:50.843	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ggx5p0009uk7a9e2gloj1	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:43:50.366	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gllh90001uk3keplua433	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:47:28.509	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3grovv0003uk3kpr0evsb3	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:52:12.859	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gsfhi0005uk3kc9rlec8t	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:52:47.335	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gv0130007uk3k22dhfj04	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:54:47.271	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3gxjg60009uk3ktjz8lism	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 02:56:45.75	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3hvi1r000buk3kfnn54bt0	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 03:23:10.239	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3hyuq4000duk3keevcwsty	sess_yqiejy75aqj_1778632761370	CLICK	/	75.95800524934383	3.125472601703887	DIV	2026-05-13 03:25:46.615	{"layout": {"pageX": 1447, "pageY": 620, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3hz78a000fuk3kseual4tn	sess_yqiejy75aqj_1778632761370	CLICK	/	76.11548556430446	83.3997076170792	DIV	2026-05-13 03:26:02.841	{"layout": {"pageX": 1450, "pageY": 16544, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3i96q5000huk3km4vj8jrm	sess_s8iyecsd0xb_1778633245089	PAGEVIEW	/	\N	\N	\N	2026-05-13 03:33:48.749	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3it10s000juk3kens2c61j	sess_yqiejy75aqj_1778632761370	CLICK	/	78.53018372703411	0.1966023088168574	SPAN	2026-05-13 03:49:14.474	{"layout": {"pageX": 1496, "pageY": 39, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3it1sp000luk3k786xczdp	sess_yqiejy75aqj_1778632761370	CLICK	/	76.16797900262468	0.8368200836820083	DIV	2026-05-13 03:49:15.481	{"layout": {"pageX": 1451, "pageY": 166, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3it3kz000nuk3k8edgze03	sess_yqiejy75aqj_1778632761370	CLICK	/	77.32283464566929	0.2167666481826889	SPAN	2026-05-13 03:49:17.795	{"layout": {"pageX": 1473, "pageY": 43, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3it4d9000puk3kmfpnut4q	sess_yqiejy75aqj_1778632761370	CLICK	/	74.64566929133858	1.039342932468059	SPAN	2026-05-13 03:49:18.813	{"layout": {"pageX": 1422, "pageY": 205, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19724}}
cmp3us5fg0099uk1nwdrvwgco	sess_aoypdp8jmn_1778632764381	PAGEVIEW	/design-system	\N	\N	\N	2026-05-13 09:24:28.924	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3it5au000ruk3k6vsasd0x	sess_yqiejy75aqj_1778632761370	CLICK	/	77.53280839895012	0.2016433936583153	BUTTON	2026-05-13 03:49:20.023	{"layout": {"pageX": 1477, "pageY": 40, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3it62b000tuk3krwfqk4u5	sess_yqiejy75aqj_1778632761370	CLICK	/	75.27559055118111	0.6301356051822352	DIV	2026-05-13 03:49:21.011	{"layout": {"pageX": 1434, "pageY": 125, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itrek000vuk3kf3k2ft3d	sess_yqiejy75aqj_1778632761370	CLICK	/	78.79265091863516	0.2570953269143519	BUTTON	2026-05-13 03:49:48.666	{"layout": {"pageX": 1501, "pageY": 51, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3its4d000xuk3k8s0h3h67	sess_yqiejy75aqj_1778632761370	CLICK	/	76.9028871391076	0.6603821142309825	DIV	2026-05-13 03:49:49.597	{"layout": {"pageX": 1465, "pageY": 131, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itvbc000zuk3ku70mmxio	sess_yqiejy75aqj_1778632761370	CLICK	/	40.10498687664042	5.499823562030548	DIV	2026-05-13 03:49:53.736	{"layout": {"pageX": 764, "pageY": 1091, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itvru0011uk3k5ypnbain	sess_yqiejy75aqj_1778632761370	CLICK	/	23.04461942257218	5.424207289408681	DIV	2026-05-13 03:49:54.33	{"layout": {"pageX": 439, "pageY": 1076, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itvwh0013uk3kw61jn6wo	sess_yqiejy75aqj_1778632761370	CLICK	/	23.04461942257218	5.424207289408681	DIV	2026-05-13 03:49:54.497	{"layout": {"pageX": 439, "pageY": 1076, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itw220015uk3kvd8h9x7i	sess_yqiejy75aqj_1778632761370	CLICK	/	23.04461942257218	5.424207289408681	DIV	2026-05-13 03:49:54.698	{"layout": {"pageX": 439, "pageY": 1076, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itwf50017uk3ku3xnfe6u	sess_yqiejy75aqj_1778632761370	CLICK	/	50.44619422572178	5.479659222664717	DIV	2026-05-13 03:49:55.169	{"layout": {"pageX": 961, "pageY": 1087, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itwyf0019uk3kq8crw751	sess_yqiejy75aqj_1778632761370	CLICK	/	79.21259842519684	4.168977163885669	BUTTON	2026-05-13 03:49:55.863	{"layout": {"pageX": 1509, "pageY": 827, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ity0h001buk3kl8twssk0	sess_yqiejy75aqj_1778632761370	CLICK	/	75.06561679790026	4.839441447799567	DIV	2026-05-13 03:49:57.233	{"layout": {"pageX": 1430, "pageY": 960, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ityoy001duk3kqrjvk2cs	sess_yqiejy75aqj_1778632761370	CLICK	/	77.58530183727034	4.305086454605031	BUTTON	2026-05-13 03:49:58.114	{"layout": {"pageX": 1478, "pageY": 854, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3itzdx001fuk3k0x1f243p	sess_yqiejy75aqj_1778632761370	CLICK	/	75.11811023622047	4.743660835811866	DIV	2026-05-13 03:49:59.013	{"layout": {"pageX": 1431, "pageY": 941, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu0hx001huk3knaowqlg3	sess_yqiejy75aqj_1778632761370	CLICK	/	77.79527559055119	4.204264757775873	SPAN	2026-05-13 03:50:00.454	{"layout": {"pageX": 1482, "pageY": 834, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu16t001juk3k2kcdn0ge	sess_yqiejy75aqj_1778632761370	CLICK	/	74.750656167979	4.925139890104351	SPAN	2026-05-13 03:50:01.349	{"layout": {"pageX": 1424, "pageY": 977, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu1zi001luk3kl5tslt8b	sess_yqiejy75aqj_1778632761370	CLICK	/	78.21522309711287	4.269798860714826	BUTTON	2026-05-13 03:50:02.382	{"layout": {"pageX": 1490, "pageY": 847, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu2qe001nuk3kggaedndm	sess_yqiejy75aqj_1778632761370	CLICK	/	75.59055118110236	4.743660835811866	DIV	2026-05-13 03:50:03.35	{"layout": {"pageX": 1440, "pageY": 941, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu537001puk3kzz82q9xl	sess_yqiejy75aqj_1778632761370	CLICK	/	78.11023622047244	0.2218077330241468	SPAN	2026-05-13 03:50:06.402	{"layout": {"pageX": 1488, "pageY": 44, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iu5m3001ruk3klpz9wxpz	sess_yqiejy75aqj_1778632761370	CLICK	/	75.69553805774278	0.8721076775722135	DIV	2026-05-13 03:50:07.083	{"layout": {"pageX": 1442, "pageY": 173, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv33o001tuk3kxbkr0r5p	sess_yqiejy75aqj_1778632761370	CLICK	/	52.49343832020998	91.31421081816808	svg	2026-05-13 03:50:50.483	{"layout": {"pageX": 1000, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv4c8001vuk3koinugw7l	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:52.088	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ppjzp009suk3k21apvkbs	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:02:29.749	{"referrer": "http://192.168.1.190:9002/admin/home", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3iv4u8001xuk3k29hxu5hw	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:52.736	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv5rw001zuk3kscax5j8v	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:53.948	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv65h0021uk3k39vbnkn9	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:54.438	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv6xz0023uk3kduafqcrc	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:55.463	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv7sw0025uk3k5fz9nw2m	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:56.576	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv8hd0027uk3k15rg1s83	sess_yqiejy75aqj_1778632761370	CLICK	/	51.86351706036746	91.31421081816808	svg	2026-05-13 03:50:57.457	{"layout": {"pageX": 988, "pageY": 18114, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iv95u0029uk3kc1ndi0au	sess_yqiejy75aqj_1778632761370	CLICK	/	78.11023622047244	87.4325754902455	BUTTON	2026-05-13 03:50:58.338	{"layout": {"pageX": 1488, "pageY": 17344, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iva01002buk3kxcroa9sn	sess_yqiejy75aqj_1778632761370	CLICK	/	\N	87.21076775722135	DIV	2026-05-13 03:50:59.425	{"layout": {"pageX": 0, "pageY": 17300, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iva06002duk3kvmkn4xch	sess_yqiejy75aqj_1778632761370	CLICK	/	75.74803149606299	87.80057468367193	DIV	2026-05-13 03:50:59.43	{"layout": {"pageX": 1443, "pageY": 17417, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iva0o002fuk3knsgnpyhi	sess_yqiejy75aqj_1778632761370	CLICK	/	75.69553805774278	87.86106770176943	DIV	2026-05-13 03:50:59.448	{"layout": {"pageX": 1442, "pageY": 17429, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivapk002huk3k1gl0z7w2	sess_yqiejy75aqj_1778632761370	CLICK	/	52.02099737532808	91.34445732721682	BUTTON	2026-05-13 03:51:00.344	{"layout": {"pageX": 991, "pageY": 18120, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivb1t002juk3kg3xpl957	sess_yqiejy75aqj_1778632761370	CLICK	/	52.23097112860893	91.23355346070474	svg	2026-05-13 03:51:00.785	{"layout": {"pageX": 995, "pageY": 18098, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivbco002luk3k0tz58c73	sess_yqiejy75aqj_1778632761370	CLICK	/	52.23097112860893	91.22851237586329	svg	2026-05-13 03:51:01.176	{"layout": {"pageX": 995, "pageY": 18097, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivblt002nuk3kpj518ddg	sess_yqiejy75aqj_1778632761370	CLICK	/	52.23097112860893	91.22851237586329	svg	2026-05-13 03:51:01.505	{"layout": {"pageX": 995, "pageY": 18097, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivbqy002puk3k7o57shrd	sess_yqiejy75aqj_1778632761370	CLICK	/	52.23097112860893	91.22851237586329	svg	2026-05-13 03:51:01.69	{"layout": {"pageX": 995, "pageY": 18097, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivcw4002ruk3k44mszvd9	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:03.172	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivd2l002tuk3khqu8s5xq	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:03.405	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivd7s002vuk3kyj76s2uf	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:03.592	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivdcv002xuk3kixe18lgp	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:03.775	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivdsa002zuk3kcwc97znk	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:04.33	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivdwz0031uk3khevyif6u	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:04.499	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ive250033uk3k6tcuai26	sess_yqiejy75aqj_1778632761370	CLICK	/	52.44094488188976	91.3595805817412	BUTTON	2026-05-13 03:51:04.685	{"layout": {"pageX": 999, "pageY": 18123, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivep60035uk3k73z8fb1i	sess_yqiejy75aqj_1778632761370	CLICK	/	77.42782152230971	87.3015072843676	DIV	2026-05-13 03:51:05.512	{"layout": {"pageX": 1475, "pageY": 17318, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3iveyi0037uk3kxzu9c6pq	sess_yqiejy75aqj_1778632761370	CLICK	/	77.8477690288714	87.44769874476988	SPAN	2026-05-13 03:51:05.85	{"layout": {"pageX": 1483, "pageY": 17347, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3ivfqg0039uk3kwagrc22k	sess_yqiejy75aqj_1778632761370	CLICK	/	76.37795275590551	88.09799868931795	DIV	2026-05-13 03:51:06.857	{"layout": {"pageX": 1455, "pageY": 17476, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19837}}
cmp3m5m91003buk3kb6xgcsi1	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 05:23:00.709	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3m5n82003duk3kts2iaa82	sess_s8iyecsd0xb_1778633245089	PAGEVIEW	/	\N	\N	\N	2026-05-13 05:23:01.97	{"referrer": "http://192.168.1.190:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3m7tu4003fuk3kef4nuut7	sess_yqiejy75aqj_1778632761370	CLICK	/	90.81364829396325	1.245254365983295	DIV	2026-05-13 05:24:43.85	{"layout": {"pageX": 1730, "pageY": 246, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3m861w003huk3kp6jiw6gr	sess_yqiejy75aqj_1778632761370	CLICK	/	74.64566929133858	11.28321943811693	DIV	2026-05-13 05:24:59.661	{"layout": {"pageX": 1422, "pageY": 2229, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3mh3l6003juk3ksm7iago6	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-13 05:31:56.394	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mhgd9003luk3k5yq5jkm6	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 05:32:12.957	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mhlp9003nuk3k6b5hwsit	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 05:32:19.869	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mjw2l003puk3kgwurw5ih	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-13 05:34:06.621	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mk20z003ruk3kdbnrayez	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-13 05:34:14.339	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mkd6e003tuk3kd0bynrtf	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-13 05:34:28.789	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mkjnd003vuk3k2pxdy0pb	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-13 05:34:37.177	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mkq0o003xuk3k3s6a1ydh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-13 05:34:45.433	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mkx3s003zuk3kpl497b06	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 05:34:54.617	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ml7980041uk3k71rcuuny	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 05:35:07.773	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mla1z0043uk3kksc25fm1	sess_yqiejy75aqj_1778632761370	CLICK	/	77.90026246719161	0.1872943558592761	BUTTON	2026-05-13 05:35:11.399	{"layout": {"pageX": 1484, "pageY": 37, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3mlb530045uk3k5q7altfb	sess_yqiejy75aqj_1778632761370	CLICK	/	73.75328083989501	0.6465736686691783	DIV	2026-05-13 05:35:12.807	{"layout": {"pageX": 1405, "pageY": 127, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19642}}
cmp3mlbrj0047uk3kughxnrep	sess_yqiejy75aqj_1778632761370	CLICK	/	18.00524934383202	1.624905087319666	DIV	2026-05-13 05:35:13.615	{"layout": {"pageX": 343, "pageY": 321, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3mliqu0049uk3kygzmcxsk	sess_yqiejy75aqj_1778632761370	CLICK	/	24.46194225721785	3.204252088078968	DIV	2026-05-13 05:35:22.661	{"layout": {"pageX": 466, "pageY": 633, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3mlw1a004buk3kzun5ear8	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 05:35:39.886	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mlyu3004duk3kvm3f5dw2	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 05:35:43.515	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mmcu1004fuk3k9dzhkhgl	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/manifest	\N	\N	\N	2026-05-13 05:36:01.657	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mn3g1004luk3k4b0hhwgp	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 05:36:36.146	{"referrer": "http://172.25.85.178:9002/admin/settings", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mmkjk004huk3kbsjtjexh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 05:36:11.649	{"referrer": "http://172.25.85.178:9002/admin/analytics/heatmap", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mmpkm004juk3kurg3lkul	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 05:36:18.166	{"referrer": "http://172.25.85.178:9002/admin/settings", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mryni004nuk3knuic05gh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-13 05:40:23.214	{"referrer": "http://172.25.85.178:9002/admin/settings", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3mulu1004puk3kgq4pj1kx	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:42:26.569	{"referrer": "http://172.25.85.178:9002/admin/settings", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n30k4004ruk3kfvrk99d2	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:48:58.9	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n34bj004tuk3kyw0qn4l5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:49:03.776	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n3kfg004vuk3kbtf9t6t4	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:49:24.653	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n7l5o004xuk3kie463dgp	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:52:32.22	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n7q2w004zuk3knrnbi2lg	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:52:38.601	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n8akd0051uk3kqsv4ywl1	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:53:05.149	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3n8nft0053uk3ke2ebadzb	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:53:21.834	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nclm50055uk3kdfkv6ii4	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 05:56:26.094	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3npf9w0057uk3k287xl7ee	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 06:06:24.404	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3npgj20059uk3k0y4l0z91	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:06:26.03	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nwhbz005buk3krvyddus0	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:11:53.663	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nyd8r005duk3kn49k2zea	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 06:13:21.676	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nykh2005fuk3kipeo3saz	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 06:13:31.046	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nyroa005huk3kca60u8v8	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:13:40.378	{"referrer": "http://172.25.85.178:9002/admin/gallery", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3nzd10005juk3krvubrkp5	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:14:08.052	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3o3iax005luk3kccbe3f8a	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:17:21.513	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3o3nkl005nuk3kigx2108s	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:17:28.341	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3op2ak005puk3k0gogt6wp	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:34:07.196	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3oumbu005ruk3k3x7vsu8u	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:38:26.442	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ouq1j005tuk3kmnfwnq9e	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 06:38:31.256	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ouq7n005vuk3k2zbg4nas	sess_yqiejy75aqj_1778632761370	CLICK	/	3.412073490813648	9.29779600205023	NEXTJS-PORTAL	2026-05-13 06:38:31.475	{"layout": {"pageX": 65, "pageY": 907, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 9755}}
cmp3ouqu3005xuk3kw4ok3x32	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 06:38:32.283	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3owpjh005zuk3kpvf34ye1	sess_yqiejy75aqj_1778632761370	CLICK	/	19.94750656167979	99.47355099974689	P	2026-05-13 06:40:03.917	{"layout": {"pageX": 380, "pageY": 19651, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3owpq10061uk3kligrir4b	sess_yqiejy75aqj_1778632761370	CLICK	/	20	99.47355099974689	P	2026-05-13 06:40:04.153	{"layout": {"pageX": 381, "pageY": 19651, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3owpt80063uk3kz1t1d4lo	sess_yqiejy75aqj_1778632761370	CLICK	/	20	99.47355099974689	P	2026-05-13 06:40:04.269	{"layout": {"pageX": 381, "pageY": 19651, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3owq9p0065uk3khnlkjw2o	sess_yqiejy75aqj_1778632761370	CLICK	/	37.16535433070866	99.51910908630727	FOOTER	2026-05-13 06:40:04.861	{"layout": {"pageX": 708, "pageY": 19660, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ox5nv0067uk3k0a6zj65l	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 06:40:24.811	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ozqkr0069uk3k0e3gkwth	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:42:25.227	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ozrse006buk3kq5yjjld1	sess_s8iyecsd0xb_1778633245089	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:42:26.798	{"referrer": "http://192.168.1.190:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3p00s8006duk3kmzovhrpw	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:42:38.456	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p020u006fuk3kc6v7f5r6	sess_s8iyecsd0xb_1778633245089	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:42:40.062	{"referrer": "http://192.168.1.190:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3p2abh006huk3k0htewo6d	sess_yqiejy75aqj_1778632761370	CLICK	/	79.63254593175853	93.36370539104024	BUTTON	2026-05-13 06:44:24.125	{"layout": {"pageX": 1517, "pageY": 18444, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3p2b3o006juk3k1lz0lidk	sess_yqiejy75aqj_1778632761370	CLICK	/	75.8005249343832	94.78668160065166	SPAN	2026-05-13 06:44:25.14	{"layout": {"pageX": 1444, "pageY": 18618, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19642}}
cmp3p2iy8006luk3k9st3ipbj	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:44:35.312	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p3jln006nuk3kp6tzufo5	sess_yqiejy75aqj_1778632761370	CLICK	/	75.59055118110236	93.38395342951151	BUTTON	2026-05-13 06:45:22.81	{"layout": {"pageX": 1440, "pageY": 18448, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3p3klf006puk3k32zg6b4v	sess_yqiejy75aqj_1778632761370	CLICK	/	75.59055118110236	94.36411770695449	DIV	2026-05-13 06:45:24.099	{"layout": {"pageX": 1440, "pageY": 18535, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19642}}
cmp3p43kj006ruk3kocha1crj	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:45:48.691	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p6dpf006tuk3khyss7o0f	sess_yqiejy75aqj_1778632761370	CLICK	/	63.93700787401575	1.356618577575297	DIV	2026-05-13 06:47:35.138	{"layout": {"pageX": 1218, "pageY": 268, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3p6t7l006vuk3krxedqkwi	sess_yqiejy75aqj_1778632761370	CLICK	/	40.26246719160105	4.28246013667426	DIV	2026-05-13 06:47:55.233	{"layout": {"pageX": 767, "pageY": 846, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3p6tsx006xuk3kx9q4nrk7	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/products	\N	\N	\N	2026-05-13 06:47:56.002	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p72hx006zuk3kptlnwxqz	sess_yqiejy75aqj_1778632761370	CLICK	/products	19.4750656167979	62.18041485769417	BUTTON	2026-05-13 06:48:07.269	{"layout": {"pageX": 371, "pageY": 1289, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p75o60071uk3ks4k53fms	sess_yqiejy75aqj_1778632761370	CLICK	/products	19.42257217847769	61.45682585624699	BUTTON	2026-05-13 06:48:11.381	{"layout": {"pageX": 370, "pageY": 1274, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p7agh0073uk3k8j36ldx7	sess_yqiejy75aqj_1778632761370	CLICK	/products	18.74015748031496	29.37771345875543	INPUT	2026-05-13 06:48:17.586	{"layout": {"pageX": 357, "pageY": 609, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p7ase0075uk3ko46zv201	sess_yqiejy75aqj_1778632761370	CLICK	/products	27.3490813648294	25.90448625180897	SECTION	2026-05-13 06:48:18.015	{"layout": {"pageX": 521, "pageY": 537, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3ptb4300ceuk3kie8vqa72	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:05:24.867	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p7cn20077uk3kgv54akqt	sess_yqiejy75aqj_1778632761370	CLICK	/products	21.41732283464567	29.18475639170285	INPUT	2026-05-13 06:48:20.415	{"layout": {"pageX": 408, "pageY": 605, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p7cx60079uk3klpq2m4wm	sess_yqiejy75aqj_1778632761370	CLICK	/products	24.7244094488189	24.60202604920405	SECTION	2026-05-13 06:48:20.778	{"layout": {"pageX": 471, "pageY": 510, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p7pnl007fuk3kmaysoofe	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-13 06:48:37.282	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p8csm007juk3kca0xqa92	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 06:49:07.27	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p7l74007buk3kdkdufao0	sess_yqiejy75aqj_1778632761370	CLICK	/products	14.33070866141732	1.688374336710082	IMG	2026-05-13 06:48:31.504	{"layout": {"pageX": 273, "pageY": 35, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3p7lvo007duk3kwya9j3rr	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:48:32.388	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p7rft007huk3kz0rrlag5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-13 06:48:39.593	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3p8f7s007luk3kizjf9kes	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 06:49:10.408	{"referrer": "http://172.25.85.178:9002/admin/settings/site", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pciqn007nuk3k17hvcvqf	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 06:52:21.599	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3peger007puk3kmrdzcn3l	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 06:53:51.891	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pi7ne007suk3kkv4jtroz	sess_7bt5913oswt_1778655406936	PAGEVIEW	/	\N	\N	\N	2026-05-13 06:56:47.162	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3piba4007uuk3keadi4dsv	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 06:56:51.868	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pid4g007wuk3kwo0mwls3	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.87500000000001	47.93650793650794	INPUT	2026-05-13 06:56:54.256	{"layout": {"pageX": 996, "pageY": 453, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pidl5007yuk3kdhf8f73q	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	70.41666666666667	42.53968253968254	DIV	2026-05-13 06:56:54.857	{"layout": {"pageX": 1352, "pageY": 402, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pir9r0080uk3kyjmog8wp	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	45.78125	47.51322751322751	INPUT	2026-05-13 06:57:12.59	{"layout": {"pageX": 879, "pageY": 449, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3piubp0082uk3ky03158ey	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	41.51041666666666	47.08994708994709	INPUT	2026-05-13 06:57:16.549	{"layout": {"pageX": 797, "pageY": 445, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pj2pk0084uk3ke2xbygl9	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 06:57:27.416	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pj8rs0086uk3kk3ahjqri	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	44.89583333333334	52.06349206349207	INPUT	2026-05-13 06:57:35.272	{"layout": {"pageX": 862, "pageY": 492, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pjagr0088uk3km8fhpy34	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.73958333333333	66.56084656084657	BUTTON	2026-05-13 06:57:37.467	{"layout": {"pageX": 955, "pageY": 629, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pk9bm008auk3kjgpoe6hi	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 06:58:22.642	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pkikq008cuk3kniq9o683	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 06:58:34.634	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pkjvt008euk3kvrqi83de	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-13 06:58:36.329	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pkw8f008guk3kinod0j1r	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 06:58:52.336	{"referrer": "http://192.168.1.190:9002/admin/home", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pkxe8008iuk3k5ze1uaeb	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	66.5625	39.04761904761905	DIV	2026-05-13 06:58:53.841	{"layout": {"pageX": 1278, "pageY": 369, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pkxpq008kuk3k4tp6r05i	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.38541666666666	51.85185185185185	INPUT	2026-05-13 06:58:54.255	{"layout": {"pageX": 929, "pageY": 490, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pky14008muk3kukcbpdlb	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.0625	63.28042328042328	INPUT	2026-05-13 06:58:54.664	{"layout": {"pageX": 942, "pageY": 598, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pkyev008ouk3ky2tw15o9	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	72.65625	55.23809523809524	DIV	2026-05-13 06:58:55.16	{"layout": {"pageX": 1395, "pageY": 522, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pm34c0096uk3kqxoxk00l	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 06:59:47.916	{"referrer": "http://192.168.1.190:9002/admin/home", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pkyyb008quk3km21xdseu	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	52.23958333333333	52.80423280423281	INPUT	2026-05-13 06:58:55.86	{"layout": {"pageX": 1003, "pageY": 499, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pkzmm008suk3koyvaij42	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.83333333333333	62.22222222222222	INPUT	2026-05-13 06:58:56.735	{"layout": {"pageX": 976, "pageY": 588, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl04e008uuk3khg8eiyhx	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	52.39583333333333	54.28571428571428	INPUT	2026-05-13 06:58:57.374	{"layout": {"pageX": 1006, "pageY": 513, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl0rl008wuk3kjjayix4f	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	68.80208333333333	55.76719576719577	DIV	2026-05-13 06:58:58.209	{"layout": {"pageX": 1321, "pageY": 527, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl1m3008yuk3k0qw1wwvl	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	69.375	55.34391534391534	DIV	2026-05-13 06:58:59.308	{"layout": {"pageX": 1332, "pageY": 523, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl2900090uk3kpv0gaeqo	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.67708333333333	25.18518518518518	SPAN	2026-05-13 06:59:00.132	{"layout": {"pageX": 973, "pageY": 238, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl3cz0092uk3kz85nq3xa	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	45.3125	12.6984126984127	DIV	2026-05-13 06:59:01.571	{"layout": {"pageX": 870, "pageY": 120, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pl3o50094uk3kw4yelm85	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	70.26041666666667	36.40211640211641	DIV	2026-05-13 06:59:01.973	{"layout": {"pageX": 1349, "pageY": 344, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pm5bi0098uk3kird10lp4	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	21.30208333333333	54.39153439153439	DIV	2026-05-13 06:59:50.766	{"layout": {"pageX": 409, "pageY": 514, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pofzk009auk3ke2d68xli	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	27.76041666666666	62.75132275132275	DIV	2026-05-13 07:01:37.904	{"layout": {"pageX": 533, "pageY": 593, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pokfu009cuk3kcrihci22	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	22.03125	55.13227513227513	DIV	2026-05-13 07:01:43.674	{"layout": {"pageX": 423, "pageY": 521, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pp0mi009euk3ksloampo5	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.4375	52.06349206349207	INPUT	2026-05-13 07:02:04.649	{"layout": {"pageX": 930, "pageY": 492, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pp0y7009guk3kfa1zzkmu	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.54166666666666	61.90476190476191	INPUT	2026-05-13 07:02:05.071	{"layout": {"pageX": 932, "pageY": 585, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pp1y7009iuk3kdupi7yvz	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	54.21875000000001	54.39153439153439	INPUT	2026-05-13 07:02:06.368	{"layout": {"pageX": 1041, "pageY": 514, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pp8vl009kuk3kjsgmll4m	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:02:15.345	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppd1c009muk3k19jrl4tq	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.98958333333334	68.35978835978837	INPUT	2026-05-13 07:02:20.735	{"layout": {"pageX": 979, "pageY": 646, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppd5o009ouk3kjuc1f7ds	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.98958333333334	68.35978835978837	INPUT	2026-05-13 07:02:20.892	{"layout": {"pageX": 979, "pageY": 646, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppdae009quk3k2ckwta5h	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.98958333333334	68.35978835978837	INPUT	2026-05-13 07:02:21.062	{"layout": {"pageX": 979, "pageY": 646, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppkv9009uuk3kp6e1b3bs	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	46.61458333333333	56.71957671957671	DIV	2026-05-13 07:02:30.886	{"layout": {"pageX": 895, "pageY": 536, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppl2q009wuk3kuz834zjp	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.91666666666667	52.9100529100529	INPUT	2026-05-13 07:02:31.155	{"layout": {"pageX": 920, "pageY": 500, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppl6w009yuk3ktelcqudl	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.91666666666667	52.9100529100529	INPUT	2026-05-13 07:02:31.305	{"layout": {"pageX": 920, "pageY": 500, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pppuz00a0uk3kzz9smgwf	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:02:37.355	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pptfx00a2uk3kha6d6m6a	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:02:41.997	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppwhx00a4uk3kla90w4di	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:02:45.957	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppxjo00a6uk3k9snivo66	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.8125	67.72486772486772	INPUT	2026-05-13 07:02:47.316	{"layout": {"pageX": 918, "pageY": 640, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3ppyry00a8uk3k8l9as25g	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.04166666666666	77.98941798941799	BUTTON	2026-05-13 07:02:48.91	{"layout": {"pageX": 980, "pageY": 737, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pq79b00aauk3kpyogjg6g	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:02:59.903	{"referrer": "http://192.168.1.190:9002/admin/home", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pqnzs00acuk3kd3ckpj1p	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 07:03:21.592	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pqo0j00aeuk3kzincbwqj	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:03:21.598	{"referrer": "http://192.168.1.190:9002/admin/home", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pqrbb00aguk3kt7fiool0	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 07:03:25.895	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pqrjo00aiuk3ked1u2u2v	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:03:26.196	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3psahs00akuk3kerue5kh7	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:04:37.408	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3psboj00amuk3k8i2ooscf	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	66.45833333333333	47.61904761904761	DIV	2026-05-13 07:04:38.947	{"layout": {"pageX": 1276, "pageY": 450, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psdb300aouk3k0v6ve8og	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.57291666666666	62.11640211640211	INPUT	2026-05-13 07:04:41.056	{"layout": {"pageX": 971, "pageY": 587, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psdl700aquk3k9bxh4fvm	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.45833333333333	55.76719576719577	INPUT	2026-05-13 07:04:41.42	{"layout": {"pageX": 988, "pageY": 527, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pse0b00asuk3ke57jxckf	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.125	40.95238095238095	DIV	2026-05-13 07:04:41.963	{"layout": {"pageX": 1020, "pageY": 387, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psf4400auuk3k5rqtv31h	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	61.25000000000001	47.83068783068783	DIV	2026-05-13 07:04:43.396	{"layout": {"pageX": 1176, "pageY": 452, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psfg100awuk3k9l49yuep	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	54.32291666666666	32.91005291005291	DIV	2026-05-13 07:04:43.826	{"layout": {"pageX": 1043, "pageY": 311, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psfu000ayuk3k3ctvwx9k	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.45833333333333	24.55026455026455	SPAN	2026-05-13 07:04:44.328	{"layout": {"pageX": 988, "pageY": 232, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psfyg00b0uk3kk47ao2un	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.45833333333333	24.55026455026455	SPAN	2026-05-13 07:04:44.488	{"layout": {"pageX": 988, "pageY": 232, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psg3o00b2uk3kn2f7oq9j	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.45833333333333	24.55026455026455	SPAN	2026-05-13 07:04:44.677	{"layout": {"pageX": 988, "pageY": 232, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psgx900b4uk3kuu64nfcg	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	54.42708333333334	32.27513227513227	DIV	2026-05-13 07:04:45.741	{"layout": {"pageX": 1045, "pageY": 305, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pst7n00b6uk3kuz4yisb8	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	60.67708333333334	89.41798941798942	DIV	2026-05-13 07:05:01.666	{"layout": {"pageX": 1165, "pageY": 845, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psti000b8uk3ks5f8qjkj	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	52.81249999999999	89.62962962962962	DIV	2026-05-13 07:05:02.04	{"layout": {"pageX": 1014, "pageY": 847, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psu2r00bauk3kxta0lmj3	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	38.28125	84.23280423280424	DIV	2026-05-13 07:05:02.788	{"layout": {"pageX": 735, "pageY": 796, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psuc900bcuk3k9crw75hv	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	42.60416666666666	89.3121693121693	DIV	2026-05-13 07:05:03.129	{"layout": {"pageX": 818, "pageY": 844, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psuvx00beuk3kb8x7sfc2	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.47916666666667	63.70370370370371	INPUT	2026-05-13 07:05:03.837	{"layout": {"pageX": 950, "pageY": 602, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psvrp00bguk3kfz5tr9jt	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	68.33333333333333	62.01058201058201	DIV	2026-05-13 07:05:04.981	{"layout": {"pageX": 1312, "pageY": 586, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psw5400biuk3khlp7mrko	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.27083333333334	52.6984126984127	INPUT	2026-05-13 07:05:05.464	{"layout": {"pageX": 946, "pageY": 498, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pswec00bkuk3k4d7ifr4s	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.85416666666666	61.48148148148148	INPUT	2026-05-13 07:05:05.796	{"layout": {"pageX": 938, "pageY": 581, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pswlx00bmuk3kdr2idoqh	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.6875	51.85185185185185	INPUT	2026-05-13 07:05:06.069	{"layout": {"pageX": 954, "pageY": 490, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pswul00bouk3kootqd6m7	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.63541666666666	62.32804232804233	INPUT	2026-05-13 07:05:06.381	{"layout": {"pageX": 953, "pageY": 589, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psx5900bquk3ko3ixozip	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.85416666666666	51.53439153439153	INPUT	2026-05-13 07:05:06.766	{"layout": {"pageX": 938, "pageY": 487, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psxhs00bsuk3keiu44ksd	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.64583333333334	47.51322751322751	DIV	2026-05-13 07:05:07.216	{"layout": {"pageX": 934, "pageY": 449, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psxva00buuk3kj1gptvyx	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.76041666666666	53.54497354497354	INPUT	2026-05-13 07:05:07.702	{"layout": {"pageX": 917, "pageY": 506, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psy4800bwuk3km4gm8pm3	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.5	62.75132275132275	INPUT	2026-05-13 07:05:08.024	{"layout": {"pageX": 912, "pageY": 593, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psygn00byuk3k0qlaq4ng	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	66.25	58.3068783068783	DIV	2026-05-13 07:05:08.472	{"layout": {"pageX": 1272, "pageY": 551, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3psz2b00c0uk3knphsel91	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	57.55208333333334	58.41269841269842	SPAN	2026-05-13 07:05:09.251	{"layout": {"pageX": 1105, "pageY": 552, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt07r00c2uk3k6ym9472a	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	57.49999999999999	59.15343915343916	SPAN	2026-05-13 07:05:10.744	{"layout": {"pageX": 1104, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt0ol00c4uk3khrhcf7zc	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	62.81250000000001	58.73015873015873	DIV	2026-05-13 07:05:11.349	{"layout": {"pageX": 1206, "pageY": 555, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt10m00c6uk3kyeze4sit	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	57.60416666666666	59.15343915343916	SPAN	2026-05-13 07:05:11.782	{"layout": {"pageX": 1106, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt16l00c8uk3ky9ov7nbz	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	57.60416666666666	59.15343915343916	SPAN	2026-05-13 07:05:11.998	{"layout": {"pageX": 1106, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt1fl00cauk3kk579bsz1	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	54.01041666666667	61.7989417989418	INPUT	2026-05-13 07:05:12.321	{"layout": {"pageX": 1037, "pageY": 584, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pt1p000ccuk3kpzymf1gd	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	52.29166666666667	54.6031746031746	INPUT	2026-05-13 07:05:12.66	{"layout": {"pageX": 1004, "pageY": 516, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pv06c00cguk3kl2sgxy1m	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:06:44.004	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3pv7ph00ciuk3kz4mvsgtf	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.80208333333334	24.86772486772487	H1	2026-05-13 07:06:53.765	{"layout": {"pageX": 937, "pageY": 235, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pv7tj00ckuk3k3e6cgcos	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.80208333333334	24.86772486772487	H1	2026-05-13 07:06:53.911	{"layout": {"pageX": 937, "pageY": 235, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pv7z700cmuk3k1u3q7o3i	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.80208333333334	24.86772486772487	H1	2026-05-13 07:06:54.115	{"layout": {"pageX": 937, "pageY": 235, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pv8aw00couk3k3ltzzo56	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	62.76041666666666	28.46560846560847	DIV	2026-05-13 07:06:54.536	{"layout": {"pageX": 1205, "pageY": 269, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pvht800cquk3kxzd8k03j	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	40	22.85714285714286	H1	2026-05-13 07:07:06.86	{"layout": {"pageX": 768, "pageY": 216, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwu4400csuk3kgv6gfq8g	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	66.77083333333333	32.48677248677249	DIV	2026-05-13 07:08:09.44	{"layout": {"pageX": 1282, "pageY": 307, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwwwl00cuuk3k7qkky2t0	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.02083333333334	49.31216931216931	INPUT	2026-05-13 07:08:13.077	{"layout": {"pageX": 922, "pageY": 466, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwx6e00cwuk3kcogdoxfa	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	47.70833333333334	59.47089947089948	INPUT	2026-05-13 07:08:13.43	{"layout": {"pageX": 916, "pageY": 562, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwxeu00cyuk3kmomx24w1	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.69791666666667	46.98412698412698	INPUT	2026-05-13 07:08:13.734	{"layout": {"pageX": 935, "pageY": 444, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwxp100d0uk3k7tgjc93r	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.75	42.22222222222222	DIV	2026-05-13 07:08:14.101	{"layout": {"pageX": 936, "pageY": 399, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwy3400d2uk3k56sdmsyn	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.02083333333334	48.99470899470899	INPUT	2026-05-13 07:08:14.608	{"layout": {"pageX": 922, "pageY": 463, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwylm00d4uk3keyy93jpz	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.54166666666666	58.51851851851851	INPUT	2026-05-13 07:08:15.274	{"layout": {"pageX": 932, "pageY": 553, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwz2g00d6uk3kedfqthvl	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	64.89583333333333	54.70899470899471	DIV	2026-05-13 07:08:15.88	{"layout": {"pageX": 1246, "pageY": 517, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pwzu400d8uk3k2kyvornh	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.21875	58.94179894179894	INPUT	2026-05-13 07:08:16.876	{"layout": {"pageX": 945, "pageY": 557, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px02700dauk3kbcvbm9hx	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	49.84375	46.66666666666666	INPUT	2026-05-13 07:08:17.167	{"layout": {"pageX": 957, "pageY": 441, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px0cq00dcuk3kdbca8c05	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.41666666666666	59.68253968253968	INPUT	2026-05-13 07:08:17.546	{"layout": {"pageX": 968, "pageY": 564, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px0ng00deuk3kih4taqlr	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.87500000000001	47.61904761904761	INPUT	2026-05-13 07:08:17.932	{"layout": {"pageX": 996, "pageY": 450, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px0uq00dguk3k96ao08wi	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	52.60416666666666	60.10582010582011	INPUT	2026-05-13 07:08:18.194	{"layout": {"pageX": 1010, "pageY": 568, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px13l00diuk3kp8um7bvc	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	54.16666666666666	48.14814814814815	INPUT	2026-05-13 07:08:18.513	{"layout": {"pageX": 1040, "pageY": 455, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px1c500dkuk3kbwwvozkx	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.80208333333333	59.36507936507937	INPUT	2026-05-13 07:08:18.821	{"layout": {"pageX": 1033, "pageY": 561, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px2ju00dmuk3k4vcmbkio	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.85416666666667	59.15343915343916	INPUT	2026-05-13 07:08:20.394	{"layout": {"pageX": 1034, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px2ol00douk3kiwaf6dmv	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.80208333333333	59.15343915343916	INPUT	2026-05-13 07:08:20.566	{"layout": {"pageX": 1033, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px2ut00dquk3ksh5ctrp8	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.80208333333333	59.15343915343916	INPUT	2026-05-13 07:08:20.789	{"layout": {"pageX": 1033, "pageY": 559, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px3ah00dsuk3kn2njf49a	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.17708333333333	49.52380952380953	INPUT	2026-05-13 07:08:21.353	{"layout": {"pageX": 1021, "pageY": 468, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px3iw00duuk3kal1h7hye	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	53.17708333333333	49.52380952380953	INPUT	2026-05-13 07:08:21.656	{"layout": {"pageX": 1021, "pageY": 468, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px48j00dwuk3kvb1anqgl	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	63.33333333333333	49.94708994708994	DIV	2026-05-13 07:08:22.579	{"layout": {"pageX": 1216, "pageY": 472, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3px7d500dyuk3k2t77td5x	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	63.59375000000001	79.8941798941799	DIV	2026-05-13 07:08:26.632	{"layout": {"pageX": 1221, "pageY": 755, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxck700e0uk3kvzjqhesr	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.9375	18.94179894179894	IMG	2026-05-13 07:08:33.367	{"layout": {"pageX": 978, "pageY": 179, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxdry00e2uk3kk8jj7isq	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.46874999999999	23.38624338624339	P	2026-05-13 07:08:34.943	{"layout": {"pageX": 969, "pageY": 221, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxdwc00e4uk3kj7fmxs4v	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.46874999999999	23.38624338624339	P	2026-05-13 07:08:35.101	{"layout": {"pageX": 969, "pageY": 221, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxe1800e6uk3kc0xumq5i	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	50.46874999999999	23.38624338624339	P	2026-05-13 07:08:35.276	{"layout": {"pageX": 969, "pageY": 221, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxedk00e8uk3kbrujhzwb	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	65.26041666666667	37.98941798941799	DIV	2026-05-13 07:08:35.72	{"layout": {"pageX": 1253, "pageY": 359, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxfd200eauk3ko6ihw9gv	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	48.54166666666666	48.78306878306879	INPUT	2026-05-13 07:08:36.998	{"layout": {"pageX": 932, "pageY": 461, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxlrx00ecuk3kkk76yn6p	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:08:45.308	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxtvr00eeuk3kvfuv5t7q	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:08:55.815	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3pxvqz00eguk3k94xy3m92	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:08:58.235	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qa9fq00eiuk3knofaxf8e	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin/profile	\N	\N	\N	2026-05-13 07:18:35.846	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qaipw00ekuk3k4pg9td6u	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 07:18:47.876	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qazam00emuk3k40n342p3	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 07:19:09.359	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qb5z200eouk3k4kf4zhxx	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:19:18.014	{"referrer": "http://192.168.1.190:9002/auth/login", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qba3x00equk3kmqo83ej6	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:19:23.373	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qbah800esuk3krjdx8hrw	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	51.19791666666666	46.56084656084656	INPUT	2026-05-13 07:19:23.852	{"layout": {"pageX": 983, "pageY": 440, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3qbjzj00euuk3k8nj2ktp2	sess_wgmok0exs1i_1778655411453	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:19:36.174	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3qdd4800eyuk3k16ez4xqp	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:21:00.585	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qeg5200f2uk3kjzanz52i	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 07:21:51.158	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qbkzm00ewuk3kdhn2ii4o	sess_wgmok0exs1i_1778655411453	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:19:37.474	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qdebv00f0uk3kbrfs8w67	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 07:21:02.155	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qeyme00f4uk3kw8it6hg8	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:22:15.11	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qfli700f6uk3kuu4wiurr	sess_ge4hcbj8iee_1778656957764	PAGEVIEW	/	\N	\N	\N	2026-05-13 07:22:44.768	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp3qg8x200f8uk3kr646fquu	sess_ge4hcbj8iee_1778656957764	CLICK	/	54.6462063086104	95.23283346487766	DIV	2026-05-13 07:23:15.111	{"layout": {"pageX": 641, "pageY": 18099, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qg9sk00fauk3k02l2w30y	sess_ge4hcbj8iee_1778656957764	CLICK	/	82.18243819266837	94.72244146277295	DIV	2026-05-13 07:23:16.244	{"layout": {"pageX": 964, "pageY": 18002, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgb7000fcuk3k18mj9cua	sess_ge4hcbj8iee_1778656957764	CLICK	/	73.23103154305201	90.52354643514865	DIV	2026-05-13 07:23:18.06	{"layout": {"pageX": 859, "pageY": 17204, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgbvg00feuk3kpp4q6tag	sess_ge4hcbj8iee_1778656957764	CLICK	/	63.76811594202898	90.3499079189687	DIV	2026-05-13 07:23:18.941	{"layout": {"pageX": 748, "pageY": 17171, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgcj300fguk3kezqigl6j	sess_ge4hcbj8iee_1778656957764	CLICK	/	73.91304347826086	90.23414890818205	DIV	2026-05-13 07:23:19.791	{"layout": {"pageX": 867, "pageY": 17149, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgdis00fiuk3k2vefvl5l	sess_ge4hcbj8iee_1778656957764	CLICK	/	48.23232323232323	85.94054196264142	IMG	2026-05-13 07:23:21.075	{"layout": {"pageX": 573, "pageY": 16333, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qge4600fkuk3kxo8gcp1p	sess_ge4hcbj8iee_1778656957764	CLICK	/	72.81144781144782	85.94054196264142	IMG	2026-05-13 07:23:21.846	{"layout": {"pageX": 865, "pageY": 16333, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgfrm00fmuk3kfe3g8jor	sess_ge4hcbj8iee_1778656957764	CLICK	/	87.37373737373737	72.7650618258353	SPAN	2026-05-13 07:23:23.986	{"layout": {"pageX": 1038, "pageY": 13829, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qggl200fouk3kxmpzl6xk	sess_ge4hcbj8iee_1778656957764	CLICK	/	41.16161616161616	74.49092344119968	INPUT	2026-05-13 07:23:25.046	{"layout": {"pageX": 489, "pageY": 14157, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgizu00fquk3k2cpty3td	sess_ge4hcbj8iee_1778656957764	CLICK	/	55.3030303030303	74.4856616679821	INPUT	2026-05-13 07:23:28.17	{"layout": {"pageX": 657, "pageY": 14156, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgks100fsuk3k9nxm05h4	sess_ge4hcbj8iee_1778656957764	CLICK	/	39.47811447811448	74.90134175217048	INPUT	2026-05-13 07:23:30.481	{"layout": {"pageX": 469, "pageY": 14235, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgms300fuuk3kuz29t9y9	sess_ge4hcbj8iee_1778656957764	CLICK	/	59.59595959595959	74.9592212575638	INPUT	2026-05-13 07:23:33.075	{"layout": {"pageX": 708, "pageY": 14246, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgokr00fwuk3k108erspt	sess_ge4hcbj8iee_1778656957764	CLICK	/	50.75757575757576	75.46435148645094	TEXTAREA	2026-05-13 07:23:35.403	{"layout": {"pageX": 603, "pageY": 14342, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgq9x00fyuk3k4ewo74e9	sess_ge4hcbj8iee_1778656957764	CLICK	/	50.84175084175084	76.23783214943435	BUTTON	2026-05-13 07:23:37.604	{"layout": {"pageX": 604, "pageY": 14489, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgrd800g0uk3kearkfb4r	sess_ge4hcbj8iee_1778656957764	CLICK	/	53.61952861952862	75.48013680610366	TEXTAREA	2026-05-13 07:23:39.02	{"layout": {"pageX": 637, "pageY": 14345, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgt9x00g2uk3kgy5pjnqf	sess_ge4hcbj8iee_1778656957764	CLICK	/	54.29292929292929	76.31675874769797	BUTTON	2026-05-13 07:23:41.493	{"layout": {"pageX": 645, "pageY": 14504, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgurt00g5uk3kkfnuv8ke	sess_ge4hcbj8iee_1778656957764	CLICK	/	73.99829497016198	72.13891081294396	DIV	2026-05-13 07:23:43.433	{"layout": {"pageX": 868, "pageY": 13710, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgx8q00g7uk3k36wufgd2	sess_ge4hcbj8iee_1778656957764	CLICK	/	34.69735720375107	65.25651144435675	SPAN	2026-05-13 07:23:46.634	{"layout": {"pageX": 407, "pageY": 12402, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 19005}}
cmp3qgzu900gbuk3kmy9aj9fl	sess_ge4hcbj8iee_1778656957764	CLICK	/products	19.86359761295823	28.95142636854279	BUTTON	2026-05-13 07:23:50.002	{"layout": {"pageX": 233, "pageY": 751, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2594}}
cmp3qh2oz00gduk3k5uw2duo2	sess_ge4hcbj8iee_1778656957764	CLICK	/products	27.96248934356351	19.73913043478261	BUTTON	2026-05-13 07:23:53.699	{"layout": {"pageX": 328, "pageY": 454, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2300}}
cmp3qh64w00gfuk3k7auqb2sc	sess_ge4hcbj8iee_1778656957764	CLICK	/products	19.01108269394714	19.25274725274725	BUTTON	2026-05-13 07:23:58.158	{"layout": {"pageX": 223, "pageY": 438, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2275}}
cmp3qh8l300ghuk3k555cqp6q	sess_ge4hcbj8iee_1778656957764	CLICK	/products	38.27791986359762	72.43956043956044	FOOTER	2026-05-13 07:24:01.335	{"layout": {"pageX": 449, "pageY": 1648, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2275}}
cmp3qh9el00gjuk3k2xozy6pe	sess_ge4hcbj8iee_1778656957764	CLICK	/products	72.1227621483376	87.12087912087912	DIV	2026-05-13 07:24:02.398	{"layout": {"pageX": 846, "pageY": 1982, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2275}}
cmp3qhupx00hhuk3k2j2xxs8k	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	19.35208866155158	0.9003074220465525	IMG	2026-05-13 07:24:30.021	{"layout": {"pageX": 227, "pageY": 41, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4554}}
cmp3qhvbu00hjuk3kq6nwhbgc	sess_ge4hcbj8iee_1778656957764	PAGEVIEW	/	\N	\N	\N	2026-05-13 07:24:30.81	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp3qi8sc00hvuk3kojsphnag	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:24:48.252	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qjkp800hzuk3knyju7us3	sess_0qggctx05ej8_1778657150750	PAGEVIEW	/	\N	\N	\N	2026-05-13 07:25:50.348	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qhb1200gluk3k8cyr3aej	sess_ge4hcbj8iee_1778656957764	CLICK	/products	45.86530264279624	38.85714285714285	DIV	2026-05-13 07:24:04.502	{"layout": {"pageX": 538, "pageY": 884, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 2275}}
cmp3qhbms00gnuk3kerpx6o59	sess_ge4hcbj8iee_1778656957764	PAGEVIEW	/products/PROD_AIO_0504_987C	\N	\N	\N	2026-05-13 07:24:05.284	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp3qhebn00gpuk3ktmfae8ux	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	70.2020202020202	19.21387790953008	BUTTON	2026-05-13 07:24:08.771	{"layout": {"pageX": 834, "pageY": 875, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 4554}}
cmp3qhex300gruk3kay927pb1	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	78.45117845117845	18.57707509881423	DIV	2026-05-13 07:24:09.543	{"layout": {"pageX": 932, "pageY": 846, "innerWidth": 1188, "clientWidth": 1188, "innerHeight": 913, "scrollWidth": 1188, "clientHeight": 913, "scrollHeight": 4554}}
cmp3qhkm600gtuk3kjh340k6n	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	75.10656436487638	27.03118137900747	BUTTON	2026-05-13 07:24:16.926	{"layout": {"pageX": 881, "pageY": 1231, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4554}}
cmp3qhl7x00gvuk3kk306fp2b	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	70.92924126172207	29.25486875529212	DIV	2026-05-13 07:24:17.709	{"layout": {"pageX": 832, "pageY": 1382, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhlt700gxuk3kqnmqivjv	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	60.27280477408355	36.64267569856054	DIV	2026-05-13 07:24:18.474	{"layout": {"pageX": 707, "pageY": 1731, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qho1d00gzuk3kempma2s0	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	32.48081841432225	8.933107535986453	IMG	2026-05-13 07:24:21.362	{"layout": {"pageX": 381, "pageY": 422, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhon900h1uk3kftdlny4o	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	19.6078431372549	14.5004233700254	IMG	2026-05-13 07:24:22.15	{"layout": {"pageX": 230, "pageY": 685, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhoz200h3uk3kpajy9xnx	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	25.91645353793691	14.62743437764606	IMG	2026-05-13 07:24:22.574	{"layout": {"pageX": 304, "pageY": 691, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhp8r00h5uk3k75rcx14b	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	38.87468030690537	14.60626587637595	DIV	2026-05-13 07:24:22.923	{"layout": {"pageX": 456, "pageY": 690, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhpr600h7uk3k0y814ntl	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	50.38363171355499	12.72226926333616	IMG	2026-05-13 07:24:23.586	{"layout": {"pageX": 591, "pageY": 601, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhr4400h9uk3kx8t6y03x	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	10.40068201193521	14.60626587637595	IMG	2026-05-13 07:24:25.348	{"layout": {"pageX": 122, "pageY": 690, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qht3900hbuk3kd217tr2f	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	72.2080136402387	0.4868755292125317	BUTTON	2026-05-13 07:24:27.909	{"layout": {"pageX": 847, "pageY": 23, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhtim00hduk3kie6hww30	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	67.86018755328217	2.222692633361558	DIV	2026-05-13 07:24:28.462	{"layout": {"pageX": 796, "pageY": 105, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4724}}
cmp3qhtvz00hfuk3kf9ctx47g	sess_ge4hcbj8iee_1778656957764	CLICK	/products/PROD_AIO_0504_987C	67.77493606138107	2.810715854194115	DIV	2026-05-13 07:24:28.943	{"layout": {"pageX": 795, "pageY": 128, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 4554}}
cmp3qi2uw00hluk3kgru0tcs0	sess_ge4hcbj8iee_1778656957764	CLICK	/	71.44075021312874	2.25218080888184	DIV	2026-05-13 07:24:40.567	{"layout": {"pageX": 838, "pageY": 426, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 18915}}
cmp3qi2zh00hnuk3kqrg3m9ga	sess_ge4hcbj8iee_1778656957764	CLICK	/	71.44075021312874	2.25218080888184	DIV	2026-05-13 07:24:40.733	{"layout": {"pageX": 838, "pageY": 426, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 18915}}
cmp3qi3co00hpuk3kouu2tp3r	sess_ge4hcbj8iee_1778656957764	CLICK	/	79.62489343563513	2.939466032249537	DIV	2026-05-13 07:24:41.208	{"layout": {"pageX": 934, "pageY": 556, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 18915}}
cmp3qi4bg00hruk3kyvdafjqe	sess_ge4hcbj8iee_1778656957764	CLICK	/	93.09462915601023	4.483214380121597	IMG	2026-05-13 07:24:42.46	{"layout": {"pageX": 1092, "pageY": 848, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 18915}}
cmp3qi4o500htuk3k109tppgt	sess_ge4hcbj8iee_1778656957764	CLICK	/	92.924126172208	4.499074808353159	BUTTON	2026-05-13 07:24:42.917	{"layout": {"pageX": 1090, "pageY": 851, "innerWidth": 1188, "clientWidth": 1173, "innerHeight": 913, "scrollWidth": 1173, "clientHeight": 913, "scrollHeight": 18915}}
cmp3qity300hxuk3kqg76ebb6	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-13 07:25:15.675	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qjpwo00i1uk3kpq6xwl0w	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:25:57.096	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qjqsc00i3uk3k31xn86oq	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	47.08333333333334	48.04232804232804	INPUT	2026-05-13 07:25:58.236	{"layout": {"pageX": 904, "pageY": 454, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3qjzj300i5uk3k7e9qhxfl	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:26:09.566	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3qk24d00i7uk3ka1bidr5l	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:26:12.925	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qkhpa00i9uk3k2b9ht0zj	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 07:26:33.118	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ql5ag00ibuk3kic2mfusb	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:27:03.688	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qqa5600iduk3k6m8dxeb4	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:31:03.258	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qtnja00ifuk3kl8wjahl4	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-13 07:33:40.582	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3qts7k00ihuk3klqbst8ya	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:33:46.64	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3rh2mr0001uk1non6pri5n	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:51:53.235	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ri4mo0003uk1nfn202325	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:52:42.48	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ripdh0005uk1n9gw3ujf0	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:53:09.365	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3riq460007uk1nis498h04	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	51.24999999999999	47.83068783068783	INPUT	2026-05-13 07:53:10.326	{"layout": {"pageX": 984, "pageY": 452, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3riyf10009uk1nmkdze47b	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 07:53:21.085	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3rj0b9000buk1nfvx433gu	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 07:53:23.541	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3rjqnw000duk1na8ltfe69	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 07:53:57.692	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3shut0000fuk1ntwnm8h94	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	45.625	48.57142857142857	INPUT	2026-05-13 08:20:29.341	{"layout": {"pageX": 876, "pageY": 459, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3shv0c000huk1nnbyrr7f3	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	45.78125	59.04761904761905	INPUT	2026-05-13 08:20:29.628	{"layout": {"pageX": 879, "pageY": 558, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3shv6y000juk1n60zdv314	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	47.08333333333334	49.84126984126984	INPUT	2026-05-13 08:20:29.866	{"layout": {"pageX": 904, "pageY": 471, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3shve1000luk1nh8c4q193	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	46.45833333333334	57.88359788359788	INPUT	2026-05-13 08:20:30.121	{"layout": {"pageX": 892, "pageY": 547, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3shvp8000nuk1nbt9en7rz	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	47.34375	47.61904761904761	INPUT	2026-05-13 08:20:30.525	{"layout": {"pageX": 909, "pageY": 450, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3shws6000puk1ny1ag8mmx	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	68.85416666666667	49.52380952380953	DIV	2026-05-13 08:20:31.926	{"layout": {"pageX": 1322, "pageY": 468, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3sk6h6000ruk1n4ioynig7	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:22:17.802	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3slvd9000tuk1n61m2tufw	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:23:36.717	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3smop8000vuk1ntwxe9ntx	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 08:24:14.732	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3sr89m000xuk1negjx2z8z	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 08:27:46.713	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3stcyv000zuk1n6gt92sy9	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 08:29:26.12	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3stsbd0011uk1nqgd4snwt	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:29:46.009	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3sv7h30013uk1nyohevalk	sess_s8iyecsd0xb_1778633245089	CLICK	/	39.42708333333334	16.64760320266195	BUTTON	2026-05-13 08:30:52.31	{"layout": {"pageX": 757, "pageY": 3202, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3sv81q0015uk1nvhbwimx2	sess_s8iyecsd0xb_1778633245089	CLICK	/	46.19791666666666	15.31662680669648	INPUT	2026-05-13 08:30:53.054	{"layout": {"pageX": 887, "pageY": 2946, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3sv9pf0017uk1n7q2zegok	sess_s8iyecsd0xb_1778633245089	CLICK	/	54.79166666666667	15.37381719871061	INPUT	2026-05-13 08:30:55.203	{"layout": {"pageX": 1052, "pageY": 2957, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svayh0019uk1ne6swasw1	sess_s8iyecsd0xb_1778633245089	CLICK	/	42.91666666666666	15.77414994280961	INPUT	2026-05-13 08:30:56.826	{"layout": {"pageX": 824, "pageY": 3034, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svbwx001buk1n75z2w360	sess_s8iyecsd0xb_1778633245089	CLICK	/	52.65625000000001	15.39461370489758	INPUT	2026-05-13 08:30:58.066	{"layout": {"pageX": 1011, "pageY": 2961, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svcec001duk1nn3ms6bo4	sess_s8iyecsd0xb_1778633245089	CLICK	/	45.78125	15.88333160029115	INPUT	2026-05-13 08:30:58.693	{"layout": {"pageX": 879, "pageY": 3055, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svb7y001fuk1n8uyoiu69	sess_s8iyecsd0xb_1778633245089	CLICK	/	55.15624999999999	15.82094208173027	INPUT	2026-05-13 08:30:57.166	{"layout": {"pageX": 1059, "pageY": 3043, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svbwa001huk1nmbrkxat7	sess_s8iyecsd0xb_1778633245089	CLICK	/	49.58333333333334	17.15711760424249	BUTTON	2026-05-13 08:30:58.042	{"layout": {"pageX": 952, "pageY": 3300, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svcex001juk1n0o5vx4qk	sess_s8iyecsd0xb_1778633245089	CLICK	/	48.85416666666666	16.52802329208693	TEXTAREA	2026-05-13 08:30:58.713	{"layout": {"pageX": 938, "pageY": 3179, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svdrt001luk1nzkdrhd4p	sess_s8iyecsd0xb_1778633245089	CLICK	/	50.98958333333334	17.03233856712072	BUTTON	2026-05-13 08:31:00.473	{"layout": {"pageX": 979, "pageY": 3276, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svecp001nuk1nw80vep8x	sess_s8iyecsd0xb_1778633245089	CLICK	/	54.79166666666667	15.32182593324322	INPUT	2026-05-13 08:31:01.225	{"layout": {"pageX": 1052, "pageY": 2947, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svini001puk1ndg6tcyb4	sess_s8iyecsd0xb_1778633245089	CLICK	/	47.13541666666667	15.93532286575855	INPUT	2026-05-13 08:31:06.797	{"layout": {"pageX": 905, "pageY": 3065, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svivk001ruk1noodwrmy6	sess_s8iyecsd0xb_1778633245089	CLICK	/	49.6875	16.9647499220131	BUTTON	2026-05-13 08:31:07.088	{"layout": {"pageX": 954, "pageY": 3263, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svove001uuk1n4ws33gsc	sess_s8iyecsd0xb_1778633245089	CLICK	/	53.54166666666666	16.60601019028803	BUTTON	2026-05-13 08:31:14.858	{"layout": {"pageX": 1028, "pageY": 3194, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3svqpn001wuk1n7i5tomx2	sess_s8iyecsd0xb_1778633245089	CLICK	/	61.51041666666666	14.50556306540501	svg	2026-05-13 08:31:17.243	{"layout": {"pageX": 1181, "pageY": 2790, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 911, "scrollWidth": 1920, "clientHeight": 911, "scrollHeight": 19234}}
cmp3syhei001yuk1nwwb15gq5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 08:33:25.146	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3syrx30020uk1n7aj86cee	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/manifest	\N	\N	\N	2026-05-13 08:33:38.775	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3syu450022uk1nqafnhjy7	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 08:33:41.621	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp4s6fc10015ukrxu1lwx94w	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 00:59:22.273	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp3t0gev0024uk1n6vbmnapd	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	48.02083333333334	48.35978835978836	INPUT	2026-05-13 08:34:57.153	{"layout": {"pageX": 922, "pageY": 457, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3t0mnf0026uk1ncehs6hzj	sess_pwpwxi3kg4q_1778657157296	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 08:35:05.259	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3t0ox60028uk1n661lg7bh	sess_pwpwxi3kg4q_1778657157296	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:35:08.202	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3t0y8u002auk1nk4npcrkd	sess_i8ez3c5ktcp_1778661320414	PAGEVIEW	/	\N	\N	\N	2026-05-13 08:35:20.286	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3t12q4002cuk1nbk7x8573	sess_f5l8687k2gk_1778661325878	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-13 08:35:26.093	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3t13ef002euk1nvqheyrwh	sess_f5l8687k2gk_1778661325878	CLICK	/auth/login	46.82291666666666	48.14814814814815	INPUT	2026-05-13 08:35:26.967	{"layout": {"pageX": 899, "pageY": 455, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3t19lw002guk1nqmwpguld	sess_f5l8687k2gk_1778661325878	CLICK	/auth/login	\N	\N	BUTTON	2026-05-13 08:35:35.012	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp3t1bm3002iuk1nuyr0p3ys	sess_f5l8687k2gk_1778661325878	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:35:37.61	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tau5f002kuk1nakgn9j5n	sess_yqiejy75aqj_1778632761370	CLICK	/	60.36745406824146	15.75803594026829	H3	2026-05-13 08:43:01.537	{"layout": {"pageX": 1150, "pageY": 3113, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tau7j002muk1n6l2j3mgf	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/products	\N	\N	\N	2026-05-13 08:43:01.615	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tavoa002ouk1nc5oruzkj	sess_yqiejy75aqj_1778632761370	CLICK	/products	86.14583333333333	2.122527737578389	SPAN	2026-05-13 08:43:03.514	{"layout": {"pageX": 1654, "pageY": 44, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 2073}}
cmp3taxrc002quk1na71cxkl4	sess_yqiejy75aqj_1778632761370	CLICK	/products	62.03125000000001	9.792571152918475	svg	2026-05-13 08:43:06.217	{"layout": {"pageX": 1191, "pageY": 203, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 2073}}
cmp3tayyf002suk1n5he5pcbo	sess_yqiejy75aqj_1778632761370	CLICK	/products	42.20472440944881	37.43367100820068	IMG	2026-05-13 08:43:07.767	{"layout": {"pageX": 804, "pageY": 776, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp3tb11t002uuk1nrw4nqx3t	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/products/PROD_AIO_0504_987C	\N	\N	\N	2026-05-13 08:43:10.481	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tb20c002wuk1n6sgzein2	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	85.72916666666667	0.8592910848549946	SPAN	2026-05-13 08:43:11.725	{"layout": {"pageX": 1646, "pageY": 40, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb36d002yuk1ng7zrm7lo	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	60.88541666666667	4.146079484425349	DIV	2026-05-13 08:43:13.237	{"layout": {"pageX": 1169, "pageY": 193, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb3lz0030uk1ntlw09ogm	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	61.66666666666667	4.360902255639098	svg	2026-05-13 08:43:13.8	{"layout": {"pageX": 1184, "pageY": 203, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb4l40032uk1nsxsdqq58	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	69.89583333333333	17.87325456498389	BUTTON	2026-05-13 08:43:15.064	{"layout": {"pageX": 1342, "pageY": 832, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb6010034uk1ned7utz6x	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	61.51041666666666	12.99677765843179	svg	2026-05-13 08:43:16.896	{"layout": {"pageX": 1181, "pageY": 605, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb6x20036uk1n1anwcrly	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	63.64583333333334	17.65843179377014	BUTTON	2026-05-13 08:43:18.087	{"layout": {"pageX": 1222, "pageY": 822, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb7gw0038uk1nes1xuugs	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	45.05208333333333	16.26208378088077	INPUT	2026-05-13 08:43:18.801	{"layout": {"pageX": 865, "pageY": 757, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb828003auk1nod44t7fx	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.39583333333334	14.43609022556391	P	2026-05-13 08:43:19.568	{"layout": {"pageX": 814, "pageY": 672, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb8co003cuk1ni5r2zpvt	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.39583333333334	14.43609022556391	P	2026-05-13 08:43:19.945	{"layout": {"pageX": 814, "pageY": 672, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb8hk003euk1ndf2f4rrx	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.39583333333334	14.43609022556391	P	2026-05-13 08:43:20.121	{"layout": {"pageX": 814, "pageY": 672, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb8me003guk1nulm0u4wt	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.39583333333334	14.43609022556391	P	2026-05-13 08:43:20.294	{"layout": {"pageX": 814, "pageY": 672, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb92p003iuk1n14ai8y6w	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	44.6875	15.31686358754028	DIV	2026-05-13 08:43:20.882	{"layout": {"pageX": 858, "pageY": 713, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tb9cd003kuk1n5ip680t0	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	44.0625	16.51987110633727	INPUT	2026-05-13 08:43:21.229	{"layout": {"pageX": 846, "pageY": 769, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbaw4003muk1nmlyi0iw7	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	52.86458333333334	16.17615467239527	INPUT	2026-05-13 08:43:23.236	{"layout": {"pageX": 1015, "pageY": 753, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbcnw003ouk1nkvlhzela	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	44.6875	18.34586466165414	INPUT	2026-05-13 08:43:25.532	{"layout": {"pageX": 858, "pageY": 854, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbdp4003quk1nrq0fkgvv	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	53.95833333333333	18.66809881847476	INPUT	2026-05-13 08:43:26.872	{"layout": {"pageX": 1036, "pageY": 869, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbek5003suk1nk2xw70c0	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	48.07291666666666	20.515574650913	TEXTAREA	2026-05-13 08:43:27.989	{"layout": {"pageX": 923, "pageY": 955, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbh0n003uuk1ngu159ntp	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	49.58333333333334	23.73791621911923	BUTTON	2026-05-13 08:43:31.176	{"layout": {"pageX": 952, "pageY": 1105, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tbxet003zuk1njiji1fui	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-13 08:43:52.422	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tbs2u003xuk1n30fqwd64	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-13 08:43:45.51	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tbypl0041uk1nt64n7t07	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 08:43:54.106	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tfqw00043uk1nk0spc8l2	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 08:46:50.592	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tfx2o0045uk1n1pwmo1mh	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 08:46:58.608	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3thqg20047uk1n1yj20rf1	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 08:48:23.33	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tqn940049uk1n4476kwwi	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	72.60416666666667	17.65843179377014	BUTTON	2026-05-13 08:55:19.096	{"layout": {"pageX": 1394, "pageY": 822, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqnta004buk1ng8ogok9m	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	45.15625	18.79699248120301	INPUT	2026-05-13 08:55:19.822	{"layout": {"pageX": 867, "pageY": 875, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqq4v004duk1n35xlgt9b	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	53.02083333333333	18.58216970998926	INPUT	2026-05-13 08:55:22.831	{"layout": {"pageX": 1018, "pageY": 865, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqrn3004fuk1n1rfhkiw0	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.39583333333334	20.12889366272825	DIV	2026-05-13 08:55:24.782	{"layout": {"pageX": 814, "pageY": 937, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqrxw004huk1n2arx87b1	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	42.55208333333334	20.70891514500537	INPUT	2026-05-13 08:55:25.172	{"layout": {"pageX": 817, "pageY": 964, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqtel004juk1nwi5qg835	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	54.37499999999999	20.6015037593985	INPUT	2026-05-13 08:55:27.069	{"layout": {"pageX": 1044, "pageY": 959, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqv0x004luk1nsrp5mphf	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	50.57291666666666	23.02900107411386	TEXTAREA	2026-05-13 08:55:29.17	{"layout": {"pageX": 971, "pageY": 1072, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqyh7004nuk1ndic8e7iq	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	43.4375	18.71106337271751	INPUT	2026-05-13 08:55:33.643	{"layout": {"pageX": 834, "pageY": 871, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqyk8004puk1n1tlrstrg	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	43.4375	18.71106337271751	INPUT	2026-05-13 08:55:33.752	{"layout": {"pageX": 834, "pageY": 871, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tqynx004ruk1n0u9ffftc	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	43.4375	18.71106337271751	INPUT	2026-05-13 08:55:33.885	{"layout": {"pageX": 834, "pageY": 871, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tr9o0004tuk1n6ty4d7w6	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	49.6875	18.51772287862513	DIV	2026-05-13 08:55:48.143	{"layout": {"pageX": 954, "pageY": 862, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3traqh004vuk1nad9ua5s4	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	44.6875	20.75187969924812	INPUT	2026-05-13 08:55:49.529	{"layout": {"pageX": 858, "pageY": 966, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3trauh004xuk1nxebdvf70	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	44.6875	20.75187969924812	INPUT	2026-05-13 08:55:49.673	{"layout": {"pageX": 858, "pageY": 966, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3trplb004zuk1ndl5y6udz	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	50.41666666666666	25.71428571428571	BUTTON	2026-05-13 08:56:08.782	{"layout": {"pageX": 968, "pageY": 1197, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tsd2l0052uk1ni4cic986	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 08:56:39.213	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tvnr10054uk1n1tsj1z9n	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	71.51041666666667	18.32438238453276	BUTTON	2026-05-13 08:59:13.02	{"layout": {"pageX": 1373, "pageY": 853, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvo7d0056uk1nelrbtfv5	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	45.3125	18.79699248120301	INPUT	2026-05-13 08:59:13.609	{"layout": {"pageX": 870, "pageY": 875, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvofh0058uk1n86unnpy3	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	45.3125	18.79699248120301	INPUT	2026-05-13 08:59:13.902	{"layout": {"pageX": 870, "pageY": 875, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvoc4005auk1n11qztxs0	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	52.70833333333334	18.56068743286788	INPUT	2026-05-13 08:59:13.781	{"layout": {"pageX": 1012, "pageY": 864, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvqgl005cuk1njitvj8og	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	46.61458333333333	20.6015037593985	INPUT	2026-05-13 08:59:16.534	{"layout": {"pageX": 895, "pageY": 959, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvrdy005euk1n2w3rh5vo	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	53.02083333333333	20.77336197636949	INPUT	2026-05-13 08:59:17.735	{"layout": {"pageX": 1018, "pageY": 967, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvs1p005guk1nd9befw3i	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	48.59375	23.37271750805585	TEXTAREA	2026-05-13 08:59:18.589	{"layout": {"pageX": 933, "pageY": 1088, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvsmv005iuk1n8eycs3tb	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	43.07291666666666	22.92158968850698	TEXTAREA	2026-05-13 08:59:19.351	{"layout": {"pageX": 827, "pageY": 1067, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvsqu005kuk1n0itjx38t	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	43.07291666666666	22.92158968850698	TEXTAREA	2026-05-13 08:59:19.494	{"layout": {"pageX": 827, "pageY": 1067, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tvvwe005muk1ntbst8rrt	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	50	26.03651987110634	BUTTON	2026-05-13 08:59:23.583	{"layout": {"pageX": 960, "pageY": 1212, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tw2ko005puk1ndbhhl0xv	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 08:59:32.232	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tx8ai005ruk1nbilxw53b	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:00:26.298	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tybw8005tuk1nwkkhe84c	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	47.66404199475065	2.900107411385607	NAV	2026-05-13 09:01:17.597	{"layout": {"pageX": 908, "pageY": 135, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tycyf005vuk1n0d2uu1b4	sess_yqiejy75aqj_1778632761370	CLICK	/products/PROD_AIO_0504_987C	18.53018372703412	0.8592910848549946	IMG	2026-05-13 09:01:19	{"layout": {"pageX": 353, "pageY": 40, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp3tydw7005xuk1nquhdf6w5	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:01:20.216	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3tyh1n005zuk1nktjrpjxv	sess_yqiejy75aqj_1778632761370	CLICK	/	59.42708333333333	16.35535307517084	BUTTON	2026-05-13 09:01:24.299	{"layout": {"pageX": 1141, "pageY": 3231, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tyhxs0061uk1n5hbljidz	sess_yqiejy75aqj_1778632761370	CLICK	/	43.69791666666666	14.99873449759555	INPUT	2026-05-13 09:01:25.456	{"layout": {"pageX": 839, "pageY": 2963, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tyi1x0063uk1np1kwh4gd	sess_yqiejy75aqj_1778632761370	CLICK	/	43.69791666666666	14.99873449759555	INPUT	2026-05-13 09:01:25.605	{"layout": {"pageX": 839, "pageY": 2963, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tyi8o0065uk1nzkfvl07v	sess_yqiejy75aqj_1778632761370	CLICK	/	43.69791666666666	14.99873449759555	INPUT	2026-05-13 09:01:25.849	{"layout": {"pageX": 839, "pageY": 2963, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tylyu0067uk1n0moj3f81	sess_yqiejy75aqj_1778632761370	CLICK	/	53.07291666666667	15.04935459377373	INPUT	2026-05-13 09:01:30.678	{"layout": {"pageX": 1019, "pageY": 2973, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tyo6u0069uk1nk8fpe1vv	sess_yqiejy75aqj_1778632761370	CLICK	/	46.45833333333334	15.49987344975955	INPUT	2026-05-13 09:01:33.558	{"layout": {"pageX": 892, "pageY": 3062, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tyq66006buk1nkaspogov	sess_yqiejy75aqj_1778632761370	CLICK	/	53.125	15.52012148823083	INPUT	2026-05-13 09:01:36.125	{"layout": {"pageX": 1020, "pageY": 3066, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tysuf006duk1nzknkppd5	sess_yqiejy75aqj_1778632761370	CLICK	/	46.5625	15.98582637307011	TEXTAREA	2026-05-13 09:01:39.591	{"layout": {"pageX": 894, "pageY": 3158, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3tz4dj006fuk1nogoq8v1s	sess_yqiejy75aqj_1778632761370	CLICK	/	47.39583333333333	16.1225006327512	TEXTAREA	2026-05-13 09:01:54.534	{"layout": {"pageX": 910, "pageY": 3185, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3u0h4n006huk1nzh3k48hx	sess_yqiejy75aqj_1778632761370	CLICK	/	48.80208333333334	16.20855479625411	TEXTAREA	2026-05-13 09:02:57.717	{"layout": {"pageX": 937, "pageY": 3202, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3u0hb1006juk1ne2035ox1	sess_yqiejy75aqj_1778632761370	CLICK	/	48.80208333333334	16.20855479625411	TEXTAREA	2026-05-13 09:02:57.949	{"layout": {"pageX": 937, "pageY": 3202, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3u0he3006luk1ng2vsdjaw	sess_yqiejy75aqj_1778632761370	CLICK	/	48.80208333333334	16.20855479625411	TEXTAREA	2026-05-13 09:02:58.059	{"layout": {"pageX": 937, "pageY": 3202, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3u0mb7006nuk1n6t62qk7p	sess_yqiejy75aqj_1778632761370	CLICK	/	52.5	16.74512781574285	BUTTON	2026-05-13 09:03:04.435	{"layout": {"pageX": 1008, "pageY": 3308, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3u0rlw006quk1nuy6hl9q3	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:03:11.3	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3u86tk006suk1nc53ttlz9	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:08:57.609	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uascf006uuk1nfrc0rtm5	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-13 09:10:58.815	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uaurv006wuk1nr59u0gmd	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-13 09:11:01.964	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ubeeo006yuk1n7b512hoa	sess_yqiejy75aqj_1778632761370	CLICK	/	62.5	16.33004302708175	BUTTON	2026-05-13 09:11:27.407	{"layout": {"pageX": 1200, "pageY": 3226, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubf8l0070uk1nzpa3b4s7	sess_yqiejy75aqj_1778632761370	CLICK	/	44.47916666666666	15.04429258415591	INPUT	2026-05-13 09:11:28.485	{"layout": {"pageX": 854, "pageY": 2972, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubgs30072uk1n9s46u9kd	sess_yqiejy75aqj_1778632761370	CLICK	/	54.42708333333334	15.069602632245	INPUT	2026-05-13 09:11:30.484	{"layout": {"pageX": 1045, "pageY": 2977, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubi3c0074uk1ni27lk8kh	sess_yqiejy75aqj_1778632761370	CLICK	/	54.58333333333333	15.52012148823083	INPUT	2026-05-13 09:11:32.184	{"layout": {"pageX": 1048, "pageY": 3066, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubinr0076uk1ne9b04yk8	sess_yqiejy75aqj_1778632761370	CLICK	/	43.17708333333334	15.66185775752974	FORM	2026-05-13 09:11:32.919	{"layout": {"pageX": 829, "pageY": 3094, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubiwr0078uk1n1n8ogqne	sess_yqiejy75aqj_1778632761370	CLICK	/	42.96875	15.51505947861301	INPUT	2026-05-13 09:11:33.243	{"layout": {"pageX": 825, "pageY": 3065, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubk3m007auk1n6jl16ny2	sess_yqiejy75aqj_1778632761370	CLICK	/	45.72916666666666	16.07694254619084	TEXTAREA	2026-05-13 09:11:34.786	{"layout": {"pageX": 878, "pageY": 3176, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubrjv007cuk1nltlk20aj	sess_yqiejy75aqj_1778632761370	CLICK	/	49.53125	16.11237661351556	TEXTAREA	2026-05-13 09:11:44.441	{"layout": {"pageX": 951, "pageY": 3183, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubtc5007euk1ndory4vtj	sess_yqiejy75aqj_1778632761370	CLICK	/	49.73958333333333	16.69956972918249	BUTTON	2026-05-13 09:11:46.758	{"layout": {"pageX": 955, "pageY": 3299, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp3ubyu9007huk1nxf036a5v	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:11:53.89	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ucy71007juk1n3gmy8hjv	sess_xtocm6aw9e_1778663559918	PAGEVIEW	/products/PROD_AIO_0504_987C	\N	\N	\N	2026-05-13 09:12:39.71	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp3ujmec007luk1ncdo2sp5w	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:17:51.012	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ulqrr007nuk1nvqzkxrs9	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:19:29.991	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3unopa007puk1nt2zw8hht	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:21:00.622	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3unqlt007ruk1n1fiv7haf	sess_yqiejy75aqj_1778632761370	CLICK	/	62.67716535433071	5.289075323727886	SECTION	2026-05-13 09:21:03.089	{"layout": {"pageX": 1194, "pageY": 290, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 5483}}
cmp3unxs7007tuk1n7zcd65id	sess_yqiejy75aqj_1778632761370	CLICK	/	86.14173228346456	8.934446975449253	BUTTON	2026-05-13 09:21:12.391	{"layout": {"pageX": 1641, "pageY": 1765, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uo6qn007vuk1nzsszyy23	sess_yqiejy75aqj_1778632761370	CLICK	/	45.249343832021	47.58289040749177	DIV	2026-05-13 09:21:23.998	{"layout": {"pageX": 862, "pageY": 9400, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uoxsy007xuk1ni6kju809	sess_bguje8pxoi_1778664119473	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:21:59.075	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uprxh007zuk1n9v8qa29z	sess_bguje8pxoi_1778664119473	CLICK	/	52.1259842519685	91.60718805365731	svg	2026-05-13 09:22:38.117	{"layout": {"pageX": 993, "pageY": 18097, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3upudu0081uk1nslrc8hg8	sess_bguje8pxoi_1778664119473	CLICK	/	51.91601049868766	91.76411035180966	BUTTON	2026-05-13 09:22:41.298	{"layout": {"pageX": 989, "pageY": 18128, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3upwg30083uk1nms7oreon	sess_bguje8pxoi_1778664119473	CLICK	/	48.71391076115486	95.21640091116174	DIV	2026-05-13 09:22:43.971	{"layout": {"pageX": 928, "pageY": 18810, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3upxcr0085uk1nmfjzqg0j	sess_bguje8pxoi_1778664119473	CLICK	/	85.87926509186352	95.13034674765882	DIV	2026-05-13 09:22:45.147	{"layout": {"pageX": 1636, "pageY": 18793, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3upxua0087uk1n1jml845a	sess_bguje8pxoi_1778664119473	CLICK	/	49.55380577427822	95.57580359402684	DIV	2026-05-13 09:22:45.778	{"layout": {"pageX": 944, "pageY": 18881, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3upyne0089uk1nwqyynf7i	sess_bguje8pxoi_1778664119473	CLICK	/	48.60892388451444	96.30979498861048	DIV	2026-05-13 09:22:46.826	{"layout": {"pageX": 926, "pageY": 19026, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq0q8008buk1nap0fr0st	sess_bguje8pxoi_1778664119473	CLICK	/	48.55643044619423	95.06454062262718	DIV	2026-05-13 09:22:49.52	{"layout": {"pageX": 925, "pageY": 18780, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq283008duk1nngj20rea	sess_bguje8pxoi_1778664119473	CLICK	/	85.09186351706036	94.3761073146039	DIV	2026-05-13 09:22:51.458	{"layout": {"pageX": 1621, "pageY": 18644, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq2m9008fuk1n3m6fbpal	sess_bguje8pxoi_1778664119473	CLICK	/	65.66929133858268	94.65957985320172	DIV	2026-05-13 09:22:51.969	{"layout": {"pageX": 1251, "pageY": 18700, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq377008huk1na9unaopm	sess_bguje8pxoi_1778664119473	CLICK	/	86.2992125984252	94.46216147810681	DIV	2026-05-13 09:22:52.724	{"layout": {"pageX": 1644, "pageY": 18661, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq49x008juk1nihoabkqz	sess_bguje8pxoi_1778664119473	CLICK	/	41.41732283464567	95.87952417109592	DIV	2026-05-13 09:22:54.117	{"layout": {"pageX": 789, "pageY": 18941, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq4v0008luk1n5ghuaqm2	sess_bguje8pxoi_1778664119473	CLICK	/	54.33070866141733	96.19336876740066	DIV	2026-05-13 09:22:54.876	{"layout": {"pageX": 1035, "pageY": 19003, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq6cq008nuk1n4lwgxlt4	sess_bguje8pxoi_1778664119473	CLICK	/	81.52230971128608	99.60010124019234	BUTTON	2026-05-13 09:22:56.81	{"layout": {"pageX": 1553, "pageY": 19676, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq7zn008puk1n2a79jg8k	sess_bguje8pxoi_1778664119473	CLICK	/	71.18110236220473	90.14932928372565	DIV	2026-05-13 09:22:58.931	{"layout": {"pageX": 1356, "pageY": 17809, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq8n7008ruk1nz8lgst55	sess_bguje8pxoi_1778664119473	CLICK	/	49.86876640419948	89.3900278410529	DIV	2026-05-13 09:22:59.779	{"layout": {"pageX": 950, "pageY": 17659, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uq941008tuk1nio0izco3	sess_bguje8pxoi_1778664119473	CLICK	/	87.8740157480315	88.68640850417616	DIV	2026-05-13 09:23:00.385	{"layout": {"pageX": 1674, "pageY": 17520, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uqbq1008vuk1nnh9geu1v	sess_bguje8pxoi_1778664119473	CLICK	/	77.32283464566929	88.28650974436852	BUTTON	2026-05-13 09:23:03.769	{"layout": {"pageX": 1473, "pageY": 17441, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uqcj2008xuk1n27o4oiu7	sess_bguje8pxoi_1778664119473	CLICK	/	74.96062992125985	88.98506707162743	DIV	2026-05-13 09:23:04.815	{"layout": {"pageX": 1428, "pageY": 17579, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp3uqekd008zuk1n7qm6mjcc	sess_bguje8pxoi_1778664119473	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:23:07.453	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uqsjt0091uk1nsqf3qa38	sess_1z5au53aarxj_1778664204502	PAGEVIEW	/en	\N	\N	\N	2026-05-13 09:23:25.577	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3urutl0093uk1ndwlvy5qg	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:24:15.178	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3urvv70095uk1n1wdy8gq2	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:24:16.532	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3us0000097uk1n46q2chqx	sess_sddpy9ni4u_1778664260185	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:24:21.888	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ut951009fuk1ntjiq1k40	sess_aoypdp8jmn_1778632764381	PAGEVIEW	/design-system	\N	\N	\N	2026-05-13 09:25:20.389	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ut2ot009buk1ndhtvjvhz	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-13 09:25:12.03	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3ut3i1009duk1n65acaxll	sess_yqiejy75aqj_1778632761370	PAGEVIEW	/	\N	\N	\N	2026-05-13 09:25:13.081	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uv6mj009huk1nyngbq36m	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-13 09:26:50.443	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uvq7w009juk1nzs6jv0c8	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin	\N	\N	\N	2026-05-13 09:27:15.837	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp3uvu7z009luk1ntji3tw3b	sess_t1t3b6ulx19_1778632761310	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-13 09:27:21.023	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}
cmp4rktli0001ukrxpgdoxgja	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-14 00:42:34.326	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rkutu0003ukrx5zoxu6fh	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/	\N	\N	\N	2026-05-14 00:42:35.922	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rkx390005ukrx4uxuatnc	sess_pwo94kq814r_1778719357446	PAGEVIEW	/design-system	\N	\N	\N	2026-05-14 00:42:38.853	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rnjgz0007ukrxcmwi3qiw	sess_ohyv172vena_1778719480073	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-14 00:44:41.171	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rnlym0009ukrxs0o5mjfv	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 00:44:44.398	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rqwsg000bukrxn49axb9k	sess_0f4pnfokxib_1778719353876	CLICK	/	81.31233595800525	95.27714502657555	DIV	2026-05-14 00:47:18.376	{"layout": {"pageX": 1549, "pageY": 18822, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp4rr0ac000dukrxzei0l7jl	sess_ohyv172vena_1778719480073	CLICK	/auth/login	50.88541666666667	48.78306878306879	INPUT	2026-05-14 00:47:22.932	{"layout": {"pageX": 977, "pageY": 461, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp4rr7a2000fukrxb8gpeaou	sess_ohyv172vena_1778719480073	CLICK	/auth/login	49.58333333333334	49.2063492063492	INPUT	2026-05-14 00:47:31.993	{"layout": {"pageX": 952, "pageY": 465, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp4rre89000hukrx1ntrj3te	sess_ohyv172vena_1778719480073	CLICK	/auth/login	\N	\N	BUTTON	2026-05-14 00:47:41.001	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 945}}
cmp4rrg0k000jukrx8g5b88dc	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 00:47:43.316	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rrxaf000lukrxhkr2w19u	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 00:48:05.703	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4rsn6w000nukrx6qwrqh37	sess_0f4pnfokxib_1778719353876	CLICK	/	51.18110236220473	96.55277145026575	SECTION	2026-05-14 00:48:39.27	{"layout": {"pageX": 975, "pageY": 19074, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp4rtzp7000pukrxfh0ela6j	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-14 00:49:42.139	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s2054000rukrxgqmm14lt	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-14 00:55:55.96	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s209l000tukrxjnkanh5q	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 00:55:56.121	{"referrer": "http://192.168.1.190:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s3u4m000xukrxi5gc4glv	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 00:57:21.479	{"referrer": "http://192.168.1.190:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s3u4m000vukrxhl7v2lky	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-14 00:57:21.478	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s5j7z000zukrxloa3ofk1	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 00:58:40.655	{"referrer": "http://192.168.1.190:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s5nn10011ukrxr6qsop4y	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 00:58:46.381	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s6amb0013ukrxyt034gcj	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 00:59:16.164	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s6i540017ukrxzojemyln	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-14 00:59:25.912	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s6nmi0019ukrx1y9fow9c	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 00:59:33.018	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s6rfg001bukrxouypx7sf	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 00:59:37.948	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s7kmk001jukrx1brel5sq	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 01:00:15.789	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s7bc7001dukrx2pr2rp0a	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 01:00:03.751	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s7hxh001fukrxdzaejbiz	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 01:00:12.293	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s7jh4001hukrx0qykm49w	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-14 01:00:14.296	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s7nt3001lukrxir01dw54	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-14 01:00:19.911	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s87uv001nukrx7a8t6uex	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 01:00:45.895	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s8jlr001pukrxrj1661cg	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 01:01:01.119	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s8nyo001rukrxwt8rc0ci	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-14 01:01:06.768	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4s9wr7001tukrxk7j4apdr	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-14 01:02:04.82	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4sa3qm001vukrxzx1aqh03	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/manifest	\N	\N	\N	2026-05-14 01:02:13.871	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4saga3001xukrx7uwiml5c	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:02:30.123	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4sb633001zukrxhydj40ud	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:03:03.567	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4skguq0021ukrxmfo3ukvj	sess_pwo94kq814r_1778719357446	CLICK	/design-system	94.38320209973753	0.1347458414645479	BUTTON	2026-05-14 01:10:17.424	{"layout": {"pageX": 1798, "pageY": 29, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 21522}}
cmp4skiv30023ukrxpz3pgx3c	sess_pwo94kq814r_1778719357446	CLICK	/design-system	97.3753280839895	2.978347737199145	path	2026-05-14 01:10:20.032	{"layout": {"pageX": 1855, "pageY": 641, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 21522}}
cmp4sotes0025ukrx5d8bdn6q	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/analytics/heatmap	\N	\N	\N	2026-05-14 01:13:40.324	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4spqee0027ukrx8n8kz16u	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:14:23.078	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4t358n0029ukrxbncqeyia	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:24:48.839	{"referrer": "http://172.25.85.178:9002/admin/users", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4t36su002bukrxqiwqpm8k	sess_ohyv172vena_1778719480073	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:24:50.862	{"referrer": "http://192.168.1.190:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4t36yp002dukrxosfa5g1c	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-14 01:24:51.073	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tc8g2002fukrxj72kxyz4	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 01:31:52.898	{"referrer": "http://172.25.85.178:9002/admin/analytics", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tdl44002hukrx9jf25hsh	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 01:32:55.972	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tdpbi002jukrxj7u64o7n	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-14 01:33:01.422	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tj2gb002lukrxwbw71t70	sess_0f4pnfokxib_1778719353876	CLICK	/	20.20997375328084	87.68919260946596	A	2026-05-14 01:37:11.702	{"layout": {"pageX": 385, "pageY": 17323, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp4tj40v002nukrxxe7okmhz	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:37:13.759	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tj5ls002pukrxbktauu7v	sess_0f4pnfokxib_1778719353876	CLICK	/products	40.62992125984252	33.23685479980704	IMG	2026-05-14 01:37:15.809	{"layout": {"pageX": 774, "pageY": 689, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tj5z1002rukrx9ugpdcic	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products/PROD_AIO_0504_987C	\N	\N	\N	2026-05-14 01:37:16.285	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tj8ik002tukrxk4f1mfyg	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	81.67979002624672	22.96455424274973	BUTTON	2026-05-14 01:37:19.58	{"layout": {"pageX": 1556, "pageY": 1069, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmcsq002vukrx9wzad90r	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products/PROD_AIO_0504_987C	\N	\N	\N	2026-05-14 01:39:45.099	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tmek2002xukrxin3qnlc4	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	69.11458333333333	17.76584317937701	BUTTON	2026-05-14 01:39:47.378	{"layout": {"pageX": 1327, "pageY": 827, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmgyo002zukrxnqbskvwc	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	45.83333333333333	9.838882921589688	INPUT	2026-05-14 01:39:50.496	{"layout": {"pageX": 880, "pageY": 458, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmhjb0031ukrx2088xmw5	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	50.78125	8.055853920515576	P	2026-05-14 01:39:51.24	{"layout": {"pageX": 975, "pageY": 375, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmip80033ukrx5c4f94um	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	61.77083333333333	6.48764769065521	svg	2026-05-14 01:39:52.749	{"layout": {"pageX": 1186, "pageY": 302, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmkes0035ukrxdc27bvlj	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	84.375	0.9022556390977444	SPAN	2026-05-14 01:39:54.964	{"layout": {"pageX": 1620, "pageY": 42, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmlj40037ukrxsgd9sr6m	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	61.77083333333333	4.468313641245972	svg	2026-05-14 01:39:56.416	{"layout": {"pageX": 1186, "pageY": 208, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmnaw0039ukrxsakhc2a6	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	84.47916666666667	0.8378088077336197	SPAN	2026-05-14 01:39:58.711	{"layout": {"pageX": 1622, "pageY": 39, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmo4a003bukrxvl3uyssc	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	61.40624999999999	4.446831364124598	svg	2026-05-14 01:39:59.77	{"layout": {"pageX": 1179, "pageY": 207, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmpge003dukrxg5xfckjo	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	84.84375	0.6874328678839957	SPAN	2026-05-14 01:40:01.502	{"layout": {"pageX": 1629, "pageY": 32, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmqmw003fukrx29fw7wsh	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	61.66666666666667	4.360902255639098	svg	2026-05-14 01:40:03.032	{"layout": {"pageX": 1184, "pageY": 203, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmri7003hukrxy5glhe4b	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	84.6875	0.8163265306122449	SPAN	2026-05-14 01:40:04.159	{"layout": {"pageX": 1626, "pageY": 38, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmsmt003jukrxpykmb761	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	61.92708333333334	4.489795918367347	path	2026-05-14 01:40:05.622	{"layout": {"pageX": 1189, "pageY": 209, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmtq8003lukrxyrjg798b	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	85.93175853018373	18.08807733619764	BUTTON	2026-05-14 01:40:07.04	{"layout": {"pageX": 1637, "pageY": 842, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tmzkf003nukrxl0cin365	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	33.85826771653544	25.02685284640172	DIV	2026-05-14 01:40:14.606	{"layout": {"pageX": 645, "pageY": 1165, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tn2mj003pukrxdy7jjdf2	sess_0f4pnfokxib_1778719353876	CLICK	/products/PROD_AIO_0504_987C	23.51706036745407	82.23415682062299	DIV	2026-05-14 01:40:18.571	{"layout": {"pageX": 448, "pageY": 3828, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 4655}}
cmp4tn34f003rukrx7igzo8sq	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products/cmoibfi320007uknu4dcvlfch	\N	\N	\N	2026-05-14 01:40:19.215	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tn422003tukrxy45og1g6	sess_0f4pnfokxib_1778719353876	CLICK	/products/cmoibfi320007uknu4dcvlfch	67.44791666666666	17.5680859225163	BUTTON	2026-05-14 01:40:20.426	{"layout": {"pageX": 1295, "pageY": 458, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 2607}}
cmp4tn549003vukrxicp8j16p	sess_0f4pnfokxib_1778719353876	CLICK	/products/cmoibfi320007uknu4dcvlfch	61.82291666666667	7.59493670886076	svg	2026-05-14 01:40:21.801	{"layout": {"pageX": 1187, "pageY": 198, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 2607}}
cmp4tvjbp0059ukrxdvh8fi1b	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-14 01:46:53.461	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tn5f5003xukrx2e1cddot	sess_0f4pnfokxib_1778719353876	CLICK	/products/cmoibfi320007uknu4dcvlfch	66.8241469816273	6.098964326812428	DIV	2026-05-14 01:40:22.194	{"layout": {"pageX": 1273, "pageY": 159, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2607}}
cmp4tn5y7003zukrxbscz1iqy	sess_0f4pnfokxib_1778719353876	CLICK	/products/cmoibfi320007uknu4dcvlfch	19.52755905511811	1.879555044112006	IMG	2026-05-14 01:40:22.879	{"layout": {"pageX": 372, "pageY": 49, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2607}}
cmp4tn6pn0041ukrx7bk81vww	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/	\N	\N	\N	2026-05-14 01:40:23.867	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tnak70043ukrxk4ttao90	sess_0f4pnfokxib_1778719353876	CLICK	/	39.79002624671917	4.333080232852442	DIV	2026-05-14 01:40:28.855	{"layout": {"pageX": 758, "pageY": 856, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp4tnato0045ukrxfsiirhf5	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:40:29.196	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tnyeq0047ukrx62egj8aa	sess_0f4pnfokxib_1778719353876	CLICK	/products	16.22047244094488	7.718282682103232	DIV	2026-05-14 01:40:59.76	{"layout": {"pageX": 309, "pageY": 160, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tnxc60049ukrxedq74ogk	sess_0f4pnfokxib_1778719353876	CLICK	/products	16.64041994750656	7.428847081524361	IMG	2026-05-14 01:40:58.374	{"layout": {"pageX": 317, "pageY": 154, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tnxz4004bukrxyupazdfa	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/	\N	\N	\N	2026-05-14 01:40:59.2	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tpxcg004dukrxvx07ptov	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:42:31.696	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ts4lp004fukrx2z0lvcjb	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:44:14.414	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tsqjf004hukrx1ctxzhxl	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:44:42.844	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tszfm004jukrx12ed6nxe	sess_0f4pnfokxib_1778719353876	CLICK	/products	22.78215223097113	22.51360712518555	BUTTON	2026-05-14 01:44:54.369	{"layout": {"pageX": 434, "pageY": 455, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4ttdbl004lukrxs0tsc58v	sess_0f4pnfokxib_1778719353876	CLICK	/products	13.33333333333333	22.23830197780994	BUTTON	2026-05-14 01:45:12.368	{"layout": {"pageX": 254, "pageY": 461, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4ttfmc004nukrx9z2yf1bu	sess_0f4pnfokxib_1778719353876	CLICK	/products	12.23097112860892	11.96333815726001	IMG	2026-05-14 01:45:15.348	{"layout": {"pageX": 233, "pageY": 248, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4ttg9t004pukrx4ar02xtq	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/	\N	\N	\N	2026-05-14 01:45:16.193	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tu9cv004rukrx7splhej1	sess_0f4pnfokxib_1778719353876	CLICK	/	11.81102362204724	13.58643381422425	SECTION	2026-05-14 01:45:53.886	{"layout": {"pageX": 225, "pageY": 2684, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp4tuazn004tukrxq1i9oagk	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:45:56.003	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tucog004vukrx41w5tb4z	sess_0f4pnfokxib_1778719353876	CLICK	/products	23.30708661417323	23.00841167738743	BUTTON	2026-05-14 01:45:58.193	{"layout": {"pageX": 444, "pageY": 465, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4tudfb004xukrxiqcbmchc	sess_0f4pnfokxib_1778719353876	CLICK	/products	16.90288713910761	21.85238784370478	BUTTON	2026-05-14 01:45:59.159	{"layout": {"pageX": 322, "pageY": 453, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tudz4004zukrxtrclp9og	sess_0f4pnfokxib_1778719353876	CLICK	/products	25.19685039370079	22.46412666996536	BUTTON	2026-05-14 01:45:59.872	{"layout": {"pageX": 480, "pageY": 454, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4tufot0051ukrxr7a3l1l0	sess_0f4pnfokxib_1778719353876	CLICK	/products	13.1758530183727	21.61119150988905	path	2026-05-14 01:46:02.093	{"layout": {"pageX": 251, "pageY": 448, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tv7gy0053ukrxfhk8yoc6	sess_0f4pnfokxib_1778719353876	CLICK	/products	22.6246719160105	23.10660877954655	SECTION	2026-05-14 01:46:38.097	{"layout": {"pageX": 431, "pageY": 479, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4tv7q40055ukrx96hs6v39	sess_0f4pnfokxib_1778719353876	CLICK	/products	22.57217847769029	22.76100940128649	BUTTON	2026-05-14 01:46:38.428	{"layout": {"pageX": 430, "pageY": 460, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp6hzsfx003pukir2abjctpf	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:49:48.861	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4tv8gs0057ukrxgnbrvruh	sess_0f4pnfokxib_1778719353876	CLICK	/products	15.06561679790026	22.33478051133623	BUTTON	2026-05-14 01:46:39.389	{"layout": {"pageX": 287, "pageY": 463, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4twnfy005bukrxt0qdhkbn	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:47:45.454	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4txjv4005dukrxx5nja3wi	sess_0f4pnfokxib_1778719353876	CLICK	/products	22.88713910761155	23.10737258782781	BUTTON	2026-05-14 01:48:27.47	{"layout": {"pageX": 436, "pageY": 467, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4txjnt005fukrxh2n2iwrz	sess_0f4pnfokxib_1778719353876	CLICK	/products	15.32808398950131	21.46647370959962	BUTTON	2026-05-14 01:48:27.209	{"layout": {"pageX": 292, "pageY": 445, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4txk4s005hukrxlfzzv1zk	sess_0f4pnfokxib_1778719353876	CLICK	/products	24.46194225721785	22.21672439386442	BUTTON	2026-05-14 01:48:27.82	{"layout": {"pageX": 466, "pageY": 449, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4txlld005jukrxr3gj1v3j	sess_0f4pnfokxib_1778719353876	CLICK	/products	15.85301837270341	21.65943077665219	BUTTON	2026-05-14 01:48:29.713	{"layout": {"pageX": 302, "pageY": 449, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4txm4u005lukrxfmn0v4qr	sess_0f4pnfokxib_1778719353876	CLICK	/products	24.1994750656168	22.11776348342405	BUTTON	2026-05-14 01:48:30.415	{"layout": {"pageX": 461, "pageY": 447, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4txr3p005nukrx76tzvcjt	sess_0f4pnfokxib_1778719353876	CLICK	/products	16.53543307086614	21.70767004341534	BUTTON	2026-05-14 01:48:36.853	{"layout": {"pageX": 315, "pageY": 450, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4txrq9005pukrxfbnwc53b	sess_0f4pnfokxib_1778719353876	CLICK	/products	23.56955380577428	22.26620484908461	BUTTON	2026-05-14 01:48:37.665	{"layout": {"pageX": 449, "pageY": 450, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4txs6u005rukrxgsjr67o8	sess_0f4pnfokxib_1778719353876	CLICK	/products	13.43832020997375	21.80414857694163	svg	2026-05-14 01:48:38.262	{"layout": {"pageX": 256, "pageY": 452, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4txsly005tukrx834sfhb1	sess_0f4pnfokxib_1778719353876	CLICK	/products	23.35958005249344	22.46412666996536	BUTTON	2026-05-14 01:48:38.806	{"layout": {"pageX": 445, "pageY": 454, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4txt3o005vukrxxmreiako	sess_0f4pnfokxib_1778719353876	CLICK	/products	14.54068241469816	21.61119150988905	BUTTON	2026-05-14 01:48:39.444	{"layout": {"pageX": 277, "pageY": 448, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4txtod005xukrxle9ds1m9	sess_0f4pnfokxib_1778719353876	CLICK	/products	23.04461942257218	22.01880257298367	BUTTON	2026-05-14 01:48:40.19	{"layout": {"pageX": 439, "pageY": 445, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2021}}
cmp4tz5m0005zukrx4rjx0j60	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/products	\N	\N	\N	2026-05-14 01:49:42.312	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u0m5b0061ukrx0d8o0ig1	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 01:50:50.399	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u0mso0063ukrxqam8rixu	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 01:50:51.241	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u113y0065ukrxn5lw5259	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-14 01:51:09.79	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u13bm0067ukrxjrlq6zih	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 01:51:12.659	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u14jp0069ukrx2j292kat	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 01:51:14.245	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u7j3k006bukrx3lqh6hc0	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 01:56:13.041	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4u8dj9006dukrx4cildn8k	sess_yoszl2w9hg9_1778723812673	PAGEVIEW	/	\N	\N	\N	2026-05-14 01:56:52.485	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp4u9us2006fukrxabfsdflq	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 01:58:01.49	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ubeea006hukrxbrjvisj7	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 01:59:13.57	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4un0ps006jukrxzn260a9e	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-14 02:08:15.712	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4un5dj006lukrxffgwehu8	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:08:21.751	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4uyu3a006nukrxc4d7jsko	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:17:26.998	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4v00wy006pukrx9h2qfsui	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:18:22.499	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4v1ixa006rukrxsi88z3o9	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:19:32.495	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4vex5m006tukrxzubicx4u	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:29:57.467	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4vwsus006vukrxdro8ix0x	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:43:51.7	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4weyq4006xukrx51t42yjq	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 02:57:59.116	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4wmx14006zukrx6flwdatt	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:04:10.168	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4wt6dh0071ukrx4mrwp4my	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:09:02.213	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4wv5du0073ukrxwahojp1a	sess_0f4pnfokxib_1778719353876	CLICK	/products	16.27296587926509	1.447178002894356	IMG	2026-05-14 03:10:34.242	{"layout": {"pageX": 310, "pageY": 30, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 2073}}
cmp4wv6bd0075ukrxmnqxj0kn	sess_0f4pnfokxib_1778719353876	PAGEVIEW	/	\N	\N	\N	2026-05-14 03:10:35.449	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4wx1ew0077ukrx7lifn98a	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:12:02.408	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4x28ti0079ukrx47h8lw4e	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:16:05.286	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4x5b3j007bukrxyryv789f	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:18:28.207	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xgxlm007dukrxf4z4xjkn	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:27:30.586	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xgzw8007fukrxfwri1mjn	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:27:33.56	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xkk6w007hukrxj78ca8rt	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:30:19.833	{"referrer": "http://172.25.85.178:9002/admin/inquiries", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xnczy007jukrxkak3l581	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:32:30.478	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xq5rp007lukrx4de49pkb	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-14 03:34:41.078	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xq6ni007nukrx2cezri9c	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	53.04955527318933	47.42606790799562	INPUT	2026-05-14 03:34:42.222	{"layout": {"pageX": 835, "pageY": 433, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xq7fn007pukrx1e200eej	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	51.33418043202033	46.00219058050384	INPUT	2026-05-14 03:34:43.235	{"layout": {"pageX": 808, "pageY": 420, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xqgvr007rukrxwtmt6h1l	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	51.96950444726811	47.75465498357065	INPUT	2026-05-14 03:34:55.478	{"layout": {"pageX": 818, "pageY": 436, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xqpzo007tukrx6ce7lbfu	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	51.143583227446	59.36473165388828	INPUT	2026-05-14 03:35:07.284	{"layout": {"pageX": 805, "pageY": 542, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xqyz3007vukrxifd8qjzv	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	\N	\N	BUTTON	2026-05-14 03:35:18.926	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xr1ac007xukrxdehdjuab	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 03:35:21.925	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xrc76007zukrx0wh8ggjb	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/auth/login	\N	\N	\N	2026-05-14 03:35:36.065	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xrcul0081ukrxmfrh6wnx	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	48.09402795425667	46.98795180722892	INPUT	2026-05-14 03:35:36.91	{"layout": {"pageX": 757, "pageY": 429, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xrsm80083ukrxo1f5oo8o	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	50.31766200762389	60.89813800657174	INPUT	2026-05-14 03:35:57.343	{"layout": {"pageX": 792, "pageY": 556, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xrx7n0085ukrxpeywko7l	sess_1dvfphm1s6z_1778729678451	CLICK	/auth/login	\N	\N	BUTTON	2026-05-14 03:36:03.299	{"layout": {"pageX": 0, "pageY": 0, "innerWidth": 1574, "clientWidth": 1574, "innerHeight": 913, "scrollWidth": 1574, "clientHeight": 913, "scrollHeight": 913}}
cmp4xs0j00087ukrxtdiq3kcc	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 03:36:07.597	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xs35s0089ukrx2yfm7u1x	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:36:11.008	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xu8av008bukrxyyg4xjsq	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:37:50.983	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4xuvd3008dukrxqdl63khd	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:38:20.871	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xuwug008fukrx4pirelre	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:38:22.792	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xwqlz008hukrxzsrkpzcm	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:39:48.023	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xwz6x008jukrxl05lr4dl	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-14 03:39:59.145	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xx2e3008lukrxowgkwro2	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:40:03.291	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4xx6de008nukrxhcb2orpb	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:40:08.45	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4y48ey008pukrxlpcp8tco	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:45:37.691	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4yae8q008rukrxvfym3mkw	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:50:25.179	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ycv03008tukrxeys62jqx	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:52:20.211	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4yg13b008vukrx3mn3ucs0	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:54:48.072	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4yga5t008xukrxxyuua358	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:54:59.825	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ygen7008zukrxels1gq0g	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:55:05.636	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ygmxl0091ukrxzefxqpy9	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:55:16.377	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i240f003rukir14hork5t	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:51:37.167	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4ygpth0093ukrxqft584ky	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 03:55:20.116	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4ygqao0095ukrxd4da6x30	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 03:55:20.736	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4ylrbe0097ukrx9up7koha	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 03:59:15.338	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp4yosr20099ukrxknhg3aok	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 04:01:37.166	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yp169009bukrxmk9bqrjr	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 04:01:48.081	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yp2re009dukrxq0mf86s2	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 04:01:50.138	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yp3zz009fukrx5ebz7kuc	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 04:01:51.744	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yplfo009hukrxteppn8mm	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 04:02:14.34	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yq6io009jukrx559uv26f	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 04:02:41.664	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp4yq8tq009lukrxrzdw6g3q	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 04:02:44.655	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp50uxkv009nukrxk0irg6q4	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 05:02:22.591	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp50v8s1009pukrxbh0k1iry	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 05:02:37.106	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp512ytq009rukrxrajq8s6b	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 05:08:37.454	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp513l9b009tukrxyjr7a3vq	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 05:09:06.528	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp513net009vukrxrnut5qct	sess_1dvfphm1s6z_1778729678451	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 05:09:09.317	{"referrer": "http://192.168.1.190:9002/admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp515jco009xukrxei18hq8e	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 05:10:37.368	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp515lg9009zukrx0luifv9t	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 05:10:40.089	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp51e46k00a1ukrxg1bl4829	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 05:17:17.613	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp51z8yl00a3ukrx671aakuk	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 05:33:43.581	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53jepo00a5ukrxfbdi2ush	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 06:17:23.772	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53jgzk00a7ukrx267swqmm	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 06:17:26.72	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53joly00a9ukrxz6s74g1b	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 06:17:36.598	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53k6p200abukrx2pmgwlyo	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 06:18:00.038	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53shrx00adukrx25t2u8hl	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 06:24:27.646	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53spxu00afukrxq3n274q3	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 06:24:38.206	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp53tjnt00ahukrxjvabsu0u	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 06:25:16.746	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54bj1100ajukrx2d952as6	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 06:39:15.733	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54bt6q00alukrxfnonuyul	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 06:39:28.898	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54wse300anukrxjfugj0z3	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/users	\N	\N	\N	2026-05-14 06:55:47.643	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54wxja00apukrxje0hnaks	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-14 06:55:54.31	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54wzfu00arukrxba6ivu8g	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin	\N	\N	\N	2026-05-14 06:55:56.778	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp54x7cy00atukrxb1h5zbu6	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 06:56:07.042	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55dlfq00avukrxqlalxpm6	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 07:08:51.761	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55dnoi00axukrx8g58hx8c	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:08:54.69	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55dovm00azukrxctw524wk	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 07:08:56.242	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55dqwe00b1ukrxdy466hx9	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:08:58.862	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55lr8q00b3ukrxve0rim8b	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:15:12.555	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55qix700b5ukrx3mce5unt	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:18:55.05	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp55rvra00b7ukrxodm2w29f	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:19:58.342	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp56gk4o00b9ukrxk7od50pe	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:39:09.672	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp56jy4600bbukrx0784j0kc	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:41:47.766	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp56p5qs00bdukrx38s91irc	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 07:45:50.933	{"referrer": "http://172.25.85.178:9002/admin/settings/ai", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp587frb00bfukrxrcz0pf72	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 08:28:03.336	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp589dea00bhukrx0pqyggiu	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 08:29:33.586	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp589fam00bjukrxsha5c8zr	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 08:29:36.046	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp589x6500blukrxh0cp8evq	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 08:29:59.214	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp58a1yw00bnukrxcqnojmy9	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 08:30:05.433	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp58a3uy00bpukrxmjb9qdxh	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 08:30:07.882	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp58csjz00brukrxhs11rslr	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 08:32:13.199	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp58pqvl00btukrxr35elh0c	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 08:42:17.554	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp59dbs900bvukrxngppdnjc	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 09:00:37.737	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp59dlmf00bxukrxyrkjuvc8	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-14 09:00:50.487	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp59docg00bzukrxw7uubcm6	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-14 09:00:54.016	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp5a4dod00c1ukrx6tanokvz	sess_lu8v8pfbpvr_1778719353774	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-14 09:21:39.902	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp66uxwu0001ukirn6up0tao	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 00:38:06.894	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp66uzat0003ukir5ap6z03i	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 00:38:08.692	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp66v1fn0005ukiroxeeyk61	sess_ars3axxhb3_1778805491781	PAGEVIEW	/design-system	\N	\N	\N	2026-05-15 00:38:11.459	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp678hzk0007ukirx64157xs	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 00:48:39.44	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp67gqdy0009ukirr80lozq7	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 00:55:03.506	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp67w1m0000bukir1jpetew8	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 01:06:57.96	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp67xro8000dukirlh01ewej	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 01:08:18.369	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp67y0gp000fukirc7vsi6e8	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:08:29.785	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp67zay0000hukiri2f8uriu	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 01:09:30.024	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp67zcgh000jukirpmw2y3r5	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:09:31.985	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp688gli000lukirhf88e6zm	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:16:37.254	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp68k3z1000nukir4xf69hpc	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 01:25:40.765	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp68l2fi000pukir0sx3qhxj	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 01:26:25.421	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp68l7pd000rukir7fd29yny	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:26:32.257	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp68zbzn000tukirqsmr8n58	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:37:30.995	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp690az6000vukirbpn1bj84	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:38:16.338	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp692pvz000xukirfj00cpzm	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/steps	\N	\N	\N	2026-05-15 01:40:08.975	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp692vb2000zukirv7qyshvo	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/cases	\N	\N	\N	2026-05-15 01:40:15.999	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp693v6i0011ukirf2n9aanq	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 01:41:02.49	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6942em0013ukir3s22ttmv	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:41:11.854	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp69lgus0015ukirmrjffnbc	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:54:43.731	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp69qn9v0017ukir5qvm4sxx	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 01:58:45.331	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp69tcyf0019ukirj2riiemj	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 02:00:51.927	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6b4r58001bukirib7jtww2	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 02:37:43.148	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6b8390001dukirnpu8inlb	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 02:40:18.803	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6bizru001fukirovj1xkwj	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 02:48:47.515	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6bj2ns001hukirtozvwzxm	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 02:48:51.169	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6bonqp001jukirc4i1nd09	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 02:53:11.857	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6c1rj6001lukirkftvi9id	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 03:03:23.298	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6c93n4001nukirtdomruga	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 03:09:05.584	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6dvgu2001pukiry159w1yp	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-15 03:54:28.707	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6dzmyc001rukirf4mtvx6v	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-15 03:57:43.284	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6dzpog001tukirf3my2du4	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-15 03:57:46.816	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6dzzhi001vukirrxu1ccga	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-15 03:57:59.527	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6e0b9l001xukirm9xa24x1	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 03:58:14.793	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gik95001zukirvtvss2j6	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 05:08:25.482	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gjl6b0021ukir5t1zb7t6	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/navigation	\N	\N	\N	2026-05-15 05:09:13.331	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gjr1e0023ukiriffcdbsb	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/steps	\N	\N	\N	2026-05-15 05:09:20.93	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gm02v0025ukir5wic1sfi	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/steps	\N	\N	\N	2026-05-15 05:11:05.96	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gngci0027ukirqi8ebn0p	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/cases	\N	\N	\N	2026-05-15 05:12:13.698	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gpa920029ukirqmqs3133	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/cases	\N	\N	\N	2026-05-15 05:13:39.11	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gq6jl002bukireobbtyy6	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/map	\N	\N	\N	2026-05-15 05:14:20.961	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gq84r002dukirlredon9w	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/cases	\N	\N	\N	2026-05-15 05:14:22.932	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gqady002fukirpzchw34e	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/map	\N	\N	\N	2026-05-15 05:14:25.942	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6grtg1002hukirgmbvax4f	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/map	\N	\N	\N	2026-05-15 05:15:37.298	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gswsc002jukirb21rv8m8	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-15 05:16:28.284	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6gtsox002lukir6nf0xhzr	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 05:17:09.633	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6h12jl002nukirsqi1oeh4	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin	\N	\N	\N	2026-05-15 05:22:48.993	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6h15jv002pukirdv5gwzrw	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 05:22:52.892	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6h18qq002rukirye0uuzwk	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 05:22:57.026	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6h3wq8002tukir8frqqg15	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 05:25:01.424	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hklcr002vukiryehj74vl	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 05:37:59.836	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hlg9h002xukirxbnfnqiy	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 05:38:39.893	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hvhvw002zukirnrd89xby	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 05:46:28.557	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hxe7z0031ukirho9ddtia	sess_4u17tczk164_1778805490627	CLICK	/	79.21259842519684	0.2480384712730954	BUTTON	2026-05-15 05:47:57.118	{"layout": {"pageX": 1509, "pageY": 49, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6hxeud0033ukir8cl3820u	sess_4u17tczk164_1778805490627	CLICK	/	43.04461942257218	1.467982789167299	DIV	2026-05-15 05:47:57.926	{"layout": {"pageX": 820, "pageY": 290, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6hxhd80035ukirbom5urgu	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:48:01.196	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hxj1a0037ukirs4ac6umt	sess_4u17tczk164_1778805490627	CLICK	/	80	0.6180469715698393	BUTTON	2026-05-15 05:48:03.358	{"layout": {"pageX": 1524, "pageY": 35, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 5663}}
cmp6hxk8s0039ukirnz1r3neo	sess_4u17tczk164_1778805490627	CLICK	/	61.20734908136482	1.022505395128969	DIV	2026-05-15 05:48:04.924	{"layout": {"pageX": 1166, "pageY": 199, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19462}}
cmp6hxzhc003bukir26nxlncj	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:48:24.673	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hy15o003dukir1xtay775	sess_4u17tczk164_1778805490627	CLICK	/	79.73753280839895	0.5780346820809248	BUTTON	2026-05-15 05:48:26.844	{"layout": {"pageX": 1519, "pageY": 40, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 6920}}
cmp6hy1p0003fukirsfd4daux	sess_4u17tczk164_1778805490627	CLICK	/	60.05249343832021	4.773163883552535	DIV	2026-05-15 05:48:27.54	{"layout": {"pageX": 1144, "pageY": 323, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 6767}}
cmp6hz7n0003hukiry0l1siti	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:49:21.9	{"referrer": "http://172.25.85.178:9002/products?line=wholesale", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hzd4h003jukir83j05iz0	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:49:29.009	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6hzevd003lukir874uzv7i	sess_q8ozwfz707f_1778824168276	CLICK	/	78.89763779527559	0.893671347802298	BUTTON	2026-05-15 05:49:31.274	{"layout": {"pageX": 1503, "pageY": 49, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 5483}}
cmp6hzfhl003nukirdb1o8dkm	sess_q8ozwfz707f_1778824168276	CLICK	/	74.69816272965879	4.577785883640343	SPAN	2026-05-15 05:49:32.073	{"layout": {"pageX": 1423, "pageY": 251, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 5483}}
cmp6i3fu1003vukirfsskxeew	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:52:39.145	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i3oyy003xukirmx9hvp93	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:52:50.987	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i4azu003zukirfz3y2dhj	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:53:19.531	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i2s2e003tukiroir5xca0	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:52:08.342	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i4yb60041ukirmqg49u4e	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:53:49.746	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i5dyz0043ukiryy830jjb	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:10.043	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i5eey0045ukir7j0ksac7	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:10.618	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6i5eg40047ukirwkyaz240	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:10.66	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i5qlc0049ukirnjeafwc9	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:26.4	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i5qxq004bukir1k8n47vn	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:26.847	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i5s1p004dukirwgr643ck	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:54:28.285	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6i6r8h004fukirf1kgz3sr	sess_q8ozwfz707f_1778824168276	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:55:13.889	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i7cow004hukir7bhoclsp	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 05:55:41.696	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i7dzz004jukir257qlamq	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:55:43.391	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i7e95004lukirwfhbrodd	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 05:55:43.721	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i7qrh004nukiruaw6oiti	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:55:59.933	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i80zi004pukirkoos1uu6	sess_k7dyh8fxrdg_1778824572463	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:56:13.183	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i92bv004rukirvv9mez3o	sess_k7dyh8fxrdg_1778824572463	CLICK	/	51.0236220472441	91.63249810174639	BUTTON	2026-05-15 05:57:01.579	{"layout": {"pageX": 972, "pageY": 18102, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6i9ksn004tukira7dors9e	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 05:57:25.511	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i9lwi004vukirl0e423wp	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 05:57:26.947	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6i9lx5004xukirewnz4mk9	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 05:57:26.969	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ib5oi004zukirf76upcae	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 05:58:39.234	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ifzdi0051ukir03j019jl	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin	\N	\N	\N	2026-05-15 06:02:24.342	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6igb8x0053ukirakpkpbbx	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:02:39.729	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ihoaj0055ukirkw84c9pk	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin	\N	\N	\N	2026-05-15 06:03:43.292	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6ihvj00057ukirucpyv0fs	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:03:52.669	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6ihz1q0059ukir7khmwveq	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:03:57.23	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6irq08005bukirdmftv1ke	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:11:32.073	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6is5ne005dukir3nd0i2gc	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 06:11:52.347	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6is8sv005fukirhqub9aaj	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:11:56.431	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6isa9h005hukirseuqu4om	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:11:58.325	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6iufwp005jukirowwn7quy	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:13:38.953	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6iui6t005lukirt2yytjwg	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:13:41.909	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6iul5f005nukir3oyujlva	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:13:45.748	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6iumh0005pukirvhwtwysu	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:13:47.46	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6j506k005rukiromv70kim	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/categories	\N	\N	\N	2026-05-15 06:21:51.766	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j5dyo005tukirh6uh0glo	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/gallery	\N	\N	\N	2026-05-15 06:22:09.648	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j5peo005vukirjnmfuu03	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 06:22:24.48	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j6isr005xukirilipevat	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/navigation	\N	\N	\N	2026-05-15 06:23:02.571	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j6kj0005zukirf5jgn0p0	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/steps	\N	\N	\N	2026-05-15 06:23:04.812	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j6uu40061ukird7b3sacr	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:23:18.172	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6j7uip0063ukirg8yuf6wy	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:24:04.417	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jddd80065ukirhjge430a	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-15 06:28:22.124	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ji8c90067ukirie63mqfc	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:32:08.889	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jjjyt0069ukir0wtrx1vg	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:33:10.613	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jjm60006bukirpjmsytks	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:33:13.464	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jl5ga006dukirp8kmhxvu	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:34:25.115	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jl7yi006fukir8ivlsz8i	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:34:28.362	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jlclc006hukiry7xwhi6v	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:34:34.368	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jmo4c006jukirlaxowymt	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:35:35.964	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jp01r006lukirysdja30w	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:37:24.735	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jp431006nukirp8hv342t	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:37:29.965	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jr52q006pukiraa9olymf	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:39:04.562	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jrmis006rukirklfpw5d5	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:39:27.172	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6jteak006tukiryp6uxmwi	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:40:49.799	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lbr2c008dukir0d70lu9e	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:23:05.796	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6jtfsk006vukirtjkamhaa	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:40:51.765	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6jv0wj006xukirnql6mjh3	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:42:05.779	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6jy434006zukireyqh9ard	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:44:29.872	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6k9cno0071ukir0kjqla05	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:53:14.197	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kb5nq0073ukir21egmd3b	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:54:38.438	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kbgdu0075ukirr8l5h3pm	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:54:52.339	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kbifz0077ukirz1lrq4zj	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 06:54:55.007	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kbl570079ukirn2b1flrj	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:54:58.507	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kbnel007bukirgk1f5quz	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 06:55:01.437	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kdxef007dukirr1munc8b	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:56:47.703	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kdzfu007fukir28554aji	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:56:50.346	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kffya007hukirn3viz2ey	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-15 06:57:58.403	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kfskx007jukiryi9tbj7n	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/site	\N	\N	\N	2026-05-15 06:58:14.769	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kg005007lukir231otfa0	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin	\N	\N	\N	2026-05-15 06:58:24.389	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6kgapg007nukird15nglxv	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 06:58:38.26	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kgodi007pukirlexwlnuy	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 06:58:55.974	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kgq3f007rukireqeptv5f	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 06:58:58.204	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kj9d3007tukir8hp1g4d9	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:00:56.488	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kq25y007vukir4qhhu6we	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:06:13.75	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kvba8007xukirlhfm89h9	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:10:18.848	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kvdto007zukir4lt9k0hp	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:10:22.14	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kwwma0081ukirho0whnkn	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:11:33.154	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kxmjr0083ukirrgbkknxc	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:12:06.759	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kxvyz0085ukirztfanztr	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:12:18.971	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kzoi40087ukireoo1olf6	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:13:42.605	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6kzqgo0089ukirseca7hjs	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:13:45.145	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6la2z0008bukirksw7im3t	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:21:47.916	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6le227008fukir6n7terfs	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:24:53.359	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lf017008hukir8uegytxe	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 07:25:37.387	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lfpt0008jukirx8sfw163	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:26:10.788	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lfwxj008lukirw4x2pwjs	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:26:20.023	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lk20h008nukirytzobxj8	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:29:33.234	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lsmiq008pukirattintru	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:36:13.058	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ltdaa008rukir0goy0nfg	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 07:36:47.746	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lu2zj008tukirbl81pl38	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:37:21.055	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lu5bz008vukirxseb37nc	sess_ars3axxhb3_1778805491781	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:37:24.095	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lvdzo008xukirarpmsf0f	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:38:21.972	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6lw51w008zukirgqstqgch	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:38:57.044	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lwasm0091ukir42a0wufr	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 07:39:04.486	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lx9290093ukird1u5wyqa	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:39:48.897	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lxaaq0095ukiryu0cornw	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:39:50.498	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lyryq0097ukirjd8tp28s	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:41:00.051	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lz0nr0099ukirdo03sw6k	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:41:11.319	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6lz1vn009bukirq11cj0ig	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:41:12.899	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m0bdc009dukir0qeya4rz	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 07:42:11.856	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m0dfe009fukir309010mx	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/translations	\N	\N	\N	2026-05-15 07:42:14.522	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m1d3i009hukirutni6lur	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:43:00.75	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m1nvb009jukire94ndefd	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:43:14.711	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m1p32009lukirzvvctebl	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:43:16.286	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m22hx009nukir27bxx0i2	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin	\N	\N	\N	2026-05-15 07:43:33.669	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m59yc009pukirgcgprwsx	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:46:03.3	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6m8p3x009rukir7vgo7dk4	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:48:42.909	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m8ri3009tukirj4vctv4u	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:48:46.011	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6m8u88009vukirmygb1exy	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/products/editor	\N	\N	\N	2026-05-15 07:48:49.544	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6mdg36009xukirh0y4k8ho	sess_o7rztcebcpi_1778825019802	PAGEVIEW	/admin/settings/ai	\N	\N	\N	2026-05-15 07:52:24.498	{"referrer": "", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"}
cmp6meftp009zukirercx6ijy	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/home	\N	\N	\N	2026-05-15 07:53:10.813	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mepap00a1ukir3c9zq52b	sess_4u17tczk164_1778805490627	CLICK	/	78.4251968503937	0.2176664135661858	SPAN	2026-05-15 07:53:23.089	{"layout": {"pageX": 1494, "pageY": 43, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mepwc00a3ukir2v70r50g	sess_4u17tczk164_1778805490627	CLICK	/	57.9002624671916	1.741331308529486	DIV	2026-05-15 07:53:23.868	{"layout": {"pageX": 1103, "pageY": 344, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mets000a5ukirxz6mwxpr	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 07:53:28.896	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mf6nh00a7ukirbbk4moem	sess_4u17tczk164_1778805490627	CLICK	/	3.569553805774278	8.134649455833966	SECTION	2026-05-15 07:53:45.58	{"layout": {"pageX": 68, "pageY": 1607, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mgd3a00a9ukirtkjdeq9e	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/products	\N	\N	\N	2026-05-15 07:54:40.582	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mitzz00abukirlscastjn	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/inquiries	\N	\N	\N	2026-05-15 07:56:35.807	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6miyca00adukira8eb5j14	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/analytics	\N	\N	\N	2026-05-15 07:56:41.434	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mkdn700afukir35ootpb1	sess_4u17tczk164_1778805490627	CLICK	/	39.10761154855643	16.93748418121994	DIV	2026-05-15 07:57:47.922	{"layout": {"pageX": 745, "pageY": 3346, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mkfqv00ahukirr9c7sx0e	sess_4u17tczk164_1778805490627	CLICK	/	38.63517060367454	17.10959250822577	DIV	2026-05-15 07:57:50.647	{"layout": {"pageX": 736, "pageY": 3380, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mkg9p00ajukir64axxn9j	sess_4u17tczk164_1778805490627	CLICK	/	37.8125	16.33510503669957	BUTTON	2026-05-15 07:57:51.325	{"layout": {"pageX": 726, "pageY": 3227, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mkh7q00alukir1o0w6j11	sess_4u17tczk164_1778805490627	CLICK	/	46.19791666666666	17.29688686408504	DIV	2026-05-15 07:57:52.55	{"layout": {"pageX": 887, "pageY": 3417, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19755}}
cmp6mm3ji00anukirf91u1cba	sess_4u17tczk164_1778805490627	CLICK	/	37.11286089238845	91.6021260440395	DIV	2026-05-15 07:59:08.142	{"layout": {"pageX": 707, "pageY": 18096, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19755}}
cmp6moj6x00apukira6f24wnj	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:01:01.737	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mol6r00arukirrq23lm8d	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:01:04.323	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mom3100atukir2w4pdps4	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:01:05.486	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6mqudh00avukirsv8p1jo6	sess_4u17tczk164_1778805490627	CLICK	/	59.47506561679789	98.86112783463776	DIV	2026-05-15 08:02:49.521	{"layout": {"pageX": 1133, "pageY": 19705, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mtf5v00axukirfzm8ky11	sess_4u17tczk164_1778805490627	CLICK	/	86.14173228346456	99.47320891029501	SPAN	2026-05-15 08:04:49.793	{"layout": {"pageX": 1641, "pageY": 19827, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mtgid00azukirgohrg7za	sess_4u17tczk164_1778805490627	CLICK	/	78.05774278215223	99.47320891029501	SPAN	2026-05-15 08:04:51.541	{"layout": {"pageX": 1487, "pageY": 19827, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mth6900b1ukirstwyaj73	sess_4u17tczk164_1778805490627	CLICK	/	64.67191601049869	99.54344772225568	FOOTER	2026-05-15 08:04:52.401	{"layout": {"pageX": 1232, "pageY": 19841, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mthot00b3ukirelpd1as6	sess_4u17tczk164_1778805490627	CLICK	/	29.23884514435696	99.47320891029501	P	2026-05-15 08:04:53.069	{"layout": {"pageX": 557, "pageY": 19827, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mtj6300b5ukir90xk99si	sess_4u17tczk164_1778805490627	CLICK	/	39.00262467191601	99.54344772225568	FOOTER	2026-05-15 08:04:54.988	{"layout": {"pageX": 743, "pageY": 19841, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mtjg200b7ukir02aw16ye	sess_4u17tczk164_1778805490627	CLICK	/	32.33595800524935	99.578567128236	FOOTER	2026-05-15 08:04:55.346	{"layout": {"pageX": 616, "pageY": 19848, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6mtvq800b9ukirpe4rb8nv	sess_4u17tczk164_1778805490627	CLICK	/	89.92125984251969	99.45314067830624	DIV	2026-05-15 08:05:11.263	{"layout": {"pageX": 1713, "pageY": 19823, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19932}}
cmp6muwmq00bbukirurx1hbqy	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:05:59.09	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6muy1t00bdukircwdm9g31	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:06:00.929	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6mvau800bfukirxdp2bmdo	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:06:17.504	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6mvc9100bhukirfnz3lcph	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:06:19.333	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6n6ya700bjukircp60gxgc	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:15:21.104	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6n6ytr00blukirycfjvjmf	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:15:21.807	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6n72d100bnukirwm96i90f	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:15:26.39	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6n733e00bpukirsenbzpsz	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:15:27.338	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6nab1k00brukir9pt4d4q2	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:17:57.608	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6nb66m00btukirdu702gii	sess_4u17tczk164_1778805490627	CLICK	/	62.72965879265092	99.0726429675425	DIV	2026-05-15 08:18:37.965	{"layout": {"pageX": 1195, "pageY": 19871, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb6zq00bvukir1wivio7y	sess_4u17tczk164_1778805490627	CLICK	/	44.51443569553805	98.5391633843546	DIV	2026-05-15 08:18:39.014	{"layout": {"pageX": 848, "pageY": 19764, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb7d100bxukirgq0gudlg	sess_4u17tczk164_1778805490627	CLICK	/	37.16535433070866	98.5341775938575	P	2026-05-15 08:18:39.494	{"layout": {"pageX": 708, "pageY": 19763, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb7mk00bzukirqgd6ehgv	sess_4u17tczk164_1778805490627	CLICK	/	50.02624671916011	98.52420601286333	P	2026-05-15 08:18:39.836	{"layout": {"pageX": 953, "pageY": 19761, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb7y300c1ukirkjxmnukb	sess_4u17tczk164_1778805490627	CLICK	/	67.71653543307087	98.58902128932542	DIV	2026-05-15 08:18:40.251	{"layout": {"pageX": 1290, "pageY": 19774, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb87s00c3ukirzkj7ceva	sess_4u17tczk164_1778805490627	CLICK	/	82.04724409448819	98.55412075584584	P	2026-05-15 08:18:40.6	{"layout": {"pageX": 1563, "pageY": 19767, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nb8rp00c5ukirswzegmgv	sess_4u17tczk164_1778805490627	CLICK	/	73.91076115485563	98.99287031958917	DIV	2026-05-15 08:18:41.318	{"layout": {"pageX": 1408, "pageY": 19855, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6ndgwh00c7ukiro4uuxn3v	sess_4u17tczk164_1778805490627	CLICK	/	24.51443569553806	97.37747419853417	DIV	2026-05-15 08:20:25.149	{"layout": {"pageX": 467, "pageY": 19531, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6njbyv00c9ukirt6hy6qzn	sess_4u17tczk164_1778805490627	CLICK	/	12.02099737532808	97.2229146931246	DIV	2026-05-15 08:24:58.71	{"layout": {"pageX": 229, "pageY": 19500, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6njgwo00cbukirupqcpuzw	sess_4u17tczk164_1778805490627	CLICK	/	17.58530183727034	97.17305678815377	DIV	2026-05-15 08:25:05.112	{"layout": {"pageX": 335, "pageY": 19490, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6njr3300cdukir7anbm9hq	sess_4u17tczk164_1778805490627	CLICK	/	14.89583333333333	96.55980455701251	SPAN	2026-05-15 08:25:18.302	{"layout": {"pageX": 286, "pageY": 19367, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 20057}}
cmp6njsve00cfukirflyun4o8	sess_4u17tczk164_1778805490627	CLICK	/	28.125	97.45724684648751	DIV	2026-05-15 08:25:20.618	{"layout": {"pageX": 540, "pageY": 19547, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nkecf00chukir69qgitoe	sess_4u17tczk164_1778805490627	CLICK	/	8.976377952755906	96.8639377773346	FOOTER	2026-05-15 08:25:48.447	{"layout": {"pageX": 171, "pageY": 19428, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nnjx500cjukirjdjbl4gl	sess_4u17tczk164_1778805490627	CLICK	/	26.82414698162729	97.3425736650546	DIV	2026-05-15 08:28:15.64	{"layout": {"pageX": 511, "pageY": 19524, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nnma300clukir3lcyy33i	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:28:18.699	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6nns7t00cnukirlvgam1ro	sess_4u17tczk164_1778805490627	CLICK	/	15.98958333333333	96.52398299939283	BUTTON	2026-05-15 08:28:26.393	{"layout": {"pageX": 307, "pageY": 19077, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 19764}}
cmp6nntm300cpukir54wjibcb	sess_4u17tczk164_1778805490627	CLICK	/	29.53125	96.12604078376627	DIV	2026-05-15 08:28:28.203	{"layout": {"pageX": 567, "pageY": 19280, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nnuhy00crukirxbf3mnek	sess_4u17tczk164_1778805490627	CLICK	/	15.98958333333333	96.54484718552126	BUTTON	2026-05-15 08:28:29.35	{"layout": {"pageX": 307, "pageY": 19364, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nnve900ctukirt2j3gj7m	sess_4u17tczk164_1778805490627	CLICK	/	23.125	97.50710475145834	DIV	2026-05-15 08:28:30.513	{"layout": {"pageX": 444, "pageY": 19557, "innerWidth": 1920, "clientWidth": 1920, "innerHeight": 945, "scrollWidth": 1920, "clientHeight": 945, "scrollHeight": 20057}}
cmp6noxlp00cvukirw7nn90uv	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:29:20.029	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6noyrd00cxukirrrjhcscg	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:29:21.529	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6np2h800czukirxv25f6x7	sess_4u17tczk164_1778805490627	CLICK	/	28.3989501312336	92.27002448408534	DIV	2026-05-15 08:29:26.348	{"layout": {"pageX": 541, "pageY": 5276, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 5718}}
cmp6nphde00d1ukirgs97oeic	sess_4u17tczk164_1778805490627	CLICK	/	27.45406824146982	99.222216682455	DIV	2026-05-15 08:29:45.648	{"layout": {"pageX": 523, "pageY": 19901, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nr75x00d3ukiry4ohvmwr	sess_4u17tczk164_1778805490627	CLICK	/	31.0761154855643	97.6417210948796	DIV	2026-05-15 08:31:05.732	{"layout": {"pageX": 592, "pageY": 19584, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nrah800d5ukiry5oaevub	sess_4u17tczk164_1778805490627	CLICK	/	32.86089238845145	97.69157899985042	DIV	2026-05-15 08:31:10.029	{"layout": {"pageX": 626, "pageY": 19594, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nrcbf00d7ukir2f3odja4	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:31:12.412	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6nsyxq00d9ukirlksaw5qj	sess_4u17tczk164_1778805490627	CLICK	/	60.26246719160105	97.50211896096125	DIV	2026-05-15 08:32:28.38	{"layout": {"pageX": 1148, "pageY": 19556, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nx4rj00dbukircy6o3p9b	sess_4u17tczk164_1778805490627	CLICK	/	46.08923884514436	97.42234631300792	DIV	2026-05-15 08:35:42.559	{"layout": {"pageX": 878, "pageY": 19540, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20057}}
cmp6nxqoc00ddukirxjrcyqcz	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:36:10.956	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6nywod00dfukir4f8rbt1g	sess_4u17tczk164_1778805490627	CLICK	/	36.11548556430446	99.4715325555888	DIV	2026-05-15 08:37:05.389	{"layout": {"pageX": 688, "pageY": 19952, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20058}}
cmp6nywuz00dhukirh7xd3a2p	sess_4u17tczk164_1778805490627	CLICK	/	36.27296587926509	99.4715325555888	DIV	2026-05-15 08:37:05.627	{"layout": {"pageX": 691, "pageY": 19952, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20058}}
cmp6nzdu100djukirk2855494	sess_4u17tczk164_1778805490627	CLICK	/	32.70341207349081	98.34480007976867	DIV	2026-05-15 08:37:27.624	{"layout": {"pageX": 623, "pageY": 19726, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20058}}
cmp6o9fwz00dlukirv60xdycs	sess_4u17tczk164_1778805490627	CLICK	/	47.82152230971128	98.55491329479769	SPAN	2026-05-15 08:45:16.882	{"layout": {"pageX": 911, "pageY": 19778, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6o9fyp00dnukir5qcv34lv	sess_4u17tczk164_1778805490627	CLICK	/	47.82152230971128	98.55989635240184	SPAN	2026-05-15 08:45:16.945	{"layout": {"pageX": 911, "pageY": 19779, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6o9fyv00dpukir8sr2g8s4	sess_4u17tczk164_1778805490627	CLICK	/	47.82152230971128	98.55989635240184	SPAN	2026-05-15 08:45:16.951	{"layout": {"pageX": 911, "pageY": 19779, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6o9g4s00drukir6tmx433h	sess_4u17tczk164_1778805490627	CLICK	/	55.59055118110236	99.28243970500299	DIV	2026-05-15 08:45:17.164	{"layout": {"pageX": 1059, "pageY": 19924, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6o9sfo00dtukirwjlfyr58	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:45:33.108	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6o9tub00dvukir316kk40d	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:45:34.932	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6oaoq100dxukirrj1swr82	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:46:14.953	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6oapti00dzukir3tw3pt8a	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:46:16.375	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6oavjq00e1ukirhb4gp5p2	sess_4u17tczk164_1778805490627	CLICK	/	32.80839895013123	99.2076938409408	DIV	2026-05-15 08:46:23.798	{"layout": {"pageX": 625, "pageY": 19909, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6oayig00e3ukirx8ov3i4b	sess_4u17tczk164_1778805490627	CLICK	/	17.63779527559055	99.72094877416782	P	2026-05-15 08:46:27.639	{"layout": {"pageX": 336, "pageY": 20012, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20068}}
cmp6ocaxk00e5ukirnkccnoc3	sess_4u17tczk164_1778805490627	CLICK	/	20.20997375328084	99.69607891983459	P	2026-05-15 08:47:30.392	{"layout": {"pageX": 385, "pageY": 20010, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6ocb6o00e7ukiro5gyl1ed	sess_4u17tczk164_1778805490627	CLICK	/	29.08136482939633	99.691096607045	DIV	2026-05-15 08:47:30.721	{"layout": {"pageX": 554, "pageY": 20009, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6occm600e9ukirc6chgtby	sess_4u17tczk164_1778805490627	CLICK	/	77.3753280839895	94.9728463952967	BUTTON	2026-05-15 08:47:32.574	{"layout": {"pageX": 1474, "pageY": 19062, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6ocd2r00ebukir491c86xs	sess_4u17tczk164_1778805490627	CLICK	/	75.64304461942257	95.70026406257784	DIV	2026-05-15 08:47:33.171	{"layout": {"pageX": 1441, "pageY": 19208, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6odgqd00edukir4qic7n4s	sess_4u17tczk164_1778805490627	CLICK	/	47.50656167979002	98.55014697822729	SPAN	2026-05-15 08:48:24.565	{"layout": {"pageX": 905, "pageY": 19780, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6oeldw00efukirfx5uar75	sess_4u17tczk164_1778805490627	CLICK	/	81.83727034120734	97.82771162373574	DIV	2026-05-15 08:49:17.251	{"layout": {"pageX": 1559, "pageY": 19635, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6oezip00ehukirew9pey3v	sess_4u17tczk164_1778805490627	CLICK	/	46.40419947506562	98.42558915848737	DIV	2026-05-15 08:49:35.568	{"layout": {"pageX": 884, "pageY": 19755, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20071}}
cmp6oizbu00ejukirekweu4sg	sess_4u17tczk164_1778805490627	CLICK	/	57.74278215223097	97.79151503065955	DIV	2026-05-15 08:52:41.926	{"layout": {"pageX": 1100, "pageY": 19616, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6okb0g00elukir4yxdgh3x	sess_4u17tczk164_1778805490627	CLICK	/	91.91601049868765	98.07567675357694	FOOTER	2026-05-15 08:53:43.743	{"layout": {"pageX": 1751, "pageY": 19673, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6okuwj00enukirimx9892t	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:54:09.524	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6okzew00epukirmzd912hc	sess_4u17tczk164_1778805490627	CLICK	/	78.9501312335958	93.95782441796699	BUTTON	2026-05-15 08:54:15.368	{"layout": {"pageX": 1504, "pageY": 18847, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6ol0ka00erukirhxf0rtdr	sess_4u17tczk164_1778805490627	CLICK	/	75.48556430446195	95.4969022314008	DIV	2026-05-15 08:54:16.858	{"layout": {"pageX": 1438, "pageY": 18959, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 19853}}
cmp6omc5s00etukir6pg8yp5y	sess_12djgtb7yh9_1778835317027	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:55:18.544	{"referrer": "", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1"}
cmp6on65s00evukirpsgx1ra1	sess_12djgtb7yh9_1778835317027	CLICK	/	64.65116279069767	83.06664744606218	BUTTON	2026-05-15 08:55:57.424	{"layout": {"pageX": 278, "pageY": 17287, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6ondcv00exukir2a4lwkgt	sess_12djgtb7yh9_1778835317027	CLICK	/	93.95348837209302	89.98125991062419	DIV	2026-05-15 08:56:06.75	{"layout": {"pageX": 404, "pageY": 18726, "innerWidth": 430, "clientWidth": 430, "innerHeight": 815, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6onu3o00ezukirm2a8o5ky	sess_12djgtb7yh9_1778835317027	CLICK	/	89.30232558139535	98.93806160203738	DIV	2026-05-15 08:56:28.45	{"layout": {"pageX": 384, "pageY": 20590, "innerWidth": 430, "clientWidth": 430, "innerHeight": 815, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6oo09700f1ukirwretigx0	sess_12djgtb7yh9_1778835317027	CLICK	/	87.44186046511628	96.94392388640622	SPAN	2026-05-15 08:56:36.427	{"layout": {"pageX": 376, "pageY": 20175, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6ood2b00f3ukir83j6148n	sess_12djgtb7yh9_1778835317027	CLICK	/	32.09302325581395	96.01652971985969	BUTTON	2026-05-15 08:56:53.026	{"layout": {"pageX": 138, "pageY": 19982, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6oopfu00f5ukirir1b7d3w	sess_12djgtb7yh9_1778835317027	CLICK	/	12.09302325581395	89.8274950747201	BUTTON	2026-05-15 08:57:09.064	{"layout": {"pageX": 52, "pageY": 18694, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6oor4p00f7ukirro85rspd	sess_12djgtb7yh9_1778835317027	CLICK	/	3.255813953488372	89.54879630964395	DIV	2026-05-15 08:57:11.257	{"layout": {"pageX": 14, "pageY": 18636, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6oosu100f9ukirv2wnj7ou	sess_12djgtb7yh9_1778835317027	CLICK	/	93.72093023255815	88.16971793762913	svg	2026-05-15 08:57:13.465	{"layout": {"pageX": 403, "pageY": 18349, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6ootp700fbukirthmy5906	sess_12djgtb7yh9_1778835317027	CLICK	/	92.32558139534883	88.27062611119119	svg	2026-05-15 08:57:14.587	{"layout": {"pageX": 397, "pageY": 18370, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6oowhn00fdukirbki0ne7a	sess_12djgtb7yh9_1778835317027	CLICK	/	89.30232558139535	88.27543126231319	svg	2026-05-15 08:57:18.203	{"layout": {"pageX": 384, "pageY": 18371, "innerWidth": 430, "clientWidth": 430, "innerHeight": 775, "scrollWidth": 430, "clientHeight": 775, "scrollHeight": 20811}}
cmp6op46j00ffukir0664lf1o	sess_4u17tczk164_1778805490627	CLICK	/	43.98950131233596	97.88644633866707	DIV	2026-05-15 08:57:28.17	{"layout": {"pageX": 838, "pageY": 19637, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20061}}
cmp6op7aw00fhukir5znhmfsi	sess_4u17tczk164_1778805490627	CLICK	/	20.05249343832021	97.91614736527244	DIV	2026-05-15 08:57:32.216	{"layout": {"pageX": 382, "pageY": 19641, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6oq7ll00fjukirib4c4g9z	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:58:19.257	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6oq8mu00flukirgfdkx3as	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 08:58:20.599	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6oqvv200fnukir3tiz1sow	sess_4u17tczk164_1778805490627	CLICK	/	61.20734908136482	98.51356743814844	SPAN	2026-05-15 08:58:50.702	{"layout": {"pageX": 1166, "pageY": 19750, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20048}}
cmp6osn4200fpukirdrz1ld6r	sess_90aqoio1jn_1778806503284	PAGEVIEW	/	\N	\N	\N	2026-05-15 09:00:12.674	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400"}
cmp6osn4600frukir92l97shx	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 09:00:12.678	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6ou53q00ftukir5s47rl4b	sess_4u17tczk164_1778805490627	CLICK	/	44.98687664041995	98.86833840171494	P	2026-05-15 09:01:22.646	{"layout": {"pageX": 857, "pageY": 19832, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6ou60u00fvukir7wciyzs1	sess_4u17tczk164_1778805490627	CLICK	/	52.96587926509186	98.18036791465178	H4	2026-05-15 09:01:23.838	{"layout": {"pageX": 1009, "pageY": 19694, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6oujg300fxukir9v7eshi6	sess_4u17tczk164_1778805490627	CLICK	/	9.291338582677165	97.8064709108131	FOOTER	2026-05-15 09:01:41.233	{"layout": {"pageX": 177, "pageY": 19619, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6ouqbp00fzukiruj3j448u	sess_4u17tczk164_1778805490627	CLICK	/	45.35433070866141	98.76364724064011	P	2026-05-15 09:01:50.149	{"layout": {"pageX": 864, "pageY": 19811, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6ouqn300g1ukirgktnd3kl	sess_4u17tczk164_1778805490627	CLICK	/	58.32020997375328	98.75367665387108	P	2026-05-15 09:01:50.56	{"layout": {"pageX": 1111, "pageY": 19809, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6ow5ba00g3ukiroxkh2t1s	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/map	\N	\N	\N	2026-05-15 09:02:56.231	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6oxckn00g5ukir7vv3g4m0	sess_4u17tczk164_1778805490627	PAGEVIEW	/	\N	\N	\N	2026-05-15 09:03:52.295	{"referrer": "http://172.25.85.178:9002/", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
cmp6pjk9f00g7ukirr4i6hplt	sess_4u17tczk164_1778805490627	CLICK	/	12.38845144356955	97.49239742758861	DIV	2026-05-15 09:21:08.671	{"layout": {"pageX": 236, "pageY": 19556, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6pjntk00g9ukirwxacmws0	sess_4u17tczk164_1778805490627	CLICK	/	45.40682414698163	98.87830898848398	P	2026-05-15 09:21:13.305	{"layout": {"pageX": 865, "pageY": 19834, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6pjnzf00gbukirrjlewn5u	sess_4u17tczk164_1778805490627	CLICK	/	45.40682414698163	98.87830898848398	P	2026-05-15 09:21:13.515	{"layout": {"pageX": 865, "pageY": 19834, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6pjo4p00gdukirdnkxm5a4	sess_4u17tczk164_1778805490627	CLICK	/	45.40682414698163	98.87830898848398	P	2026-05-15 09:21:13.705	{"layout": {"pageX": 865, "pageY": 19834, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6pjofp00gfukir1bw6abnx	sess_4u17tczk164_1778805490627	CLICK	/	42.57217847769029	99.13255895109427	DIV	2026-05-15 09:21:14.101	{"layout": {"pageX": 811, "pageY": 19885, "innerWidth": 1920, "clientWidth": 1905, "innerHeight": 945, "scrollWidth": 1905, "clientHeight": 945, "scrollHeight": 20059}}
cmp6pkazl00ghukir2nqt61rs	sess_z531bofce1r_1778805488231	PAGEVIEW	/admin/settings	\N	\N	\N	2026-05-15 09:21:43.329	{"referrer": "http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}
\.


--
-- Data for Name: CaseStudy; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."CaseStudy" (id, "order", "tagZh", "tagEn", "titleZh", "titleEn", "descZh", "descEn", "imageUrl", brightness, "descriptionTextId", "tagTextId", "titleTextId", published) FROM stdin;
case_1778461325264	3	而且未		发我请问福大福额外容器而圈儿去而且厄齐尔而且打发打发七二七二提前额外让我去		发的发打发蛋糕热一天涂鸦街法国红酒分开法国红酒法国红酒让他也非常方便橙V百度分公司而问题而啊发的发都发地方阿道夫打发打发打发地方		http://localhost:9000/heovose-assets/uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg	\N	case_study_case_1778461325264_desc	case_study_case_1778461325264_tag	case_study_case_1778461325264_title	f
case_1778469214742	4	多发发		我日3 而额尔		发文问问父亲违法圈儿发穷恶放弃而且嗯发我f		http://localhost:9000/heovose-assets/uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg	\N	case_study_case_1778469214742_desc	case_study_case_1778469214742_tag	case_study_case_1778469214742_title	f
case_1778231480450	2	发顺丰的		发二分为发		圈儿去而且而12312 答复玩儿去而圈儿er		http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	\N	case_study_case_1778231480450_desc	case_study_case_1778231480450_tag	case_study_case_1778231480450_title	t
cmoibfi3k000buknut5a5e8tx	1	智慧零售	RETAIL	智能 POS 集成方案	Smart POS Integration	优化 500 多家门店的结账体验。	Optimizing checkout experiences across 500+ stores.	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	\N	case_study_cmoibfi3k000buknut5a5e8tx_desc	case_study_cmoibfi3k000buknut5a5e8tx_tag	case_study_cmoibfi3k000buknut5a5e8tx_title	t
\.


--
-- Data for Name: GalleryAsset; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."GalleryAsset" (id, title, url, "categoryId", "createdAt", "fileName", "fileSize", height, width, duration, "thumbnailUrl", type, brightness) FROM stdin;
asset_1777864944226_q9ko0_0	alibaba2023_x264	http://localhost:9000/heovose-assets/uploads/0af8547d-8b02-4615-ba22-59b3af72e7b3.mp4	cat_1777363045711	2026-05-04 03:22:01.499	uploads/0af8547d-8b02-4615-ba22-59b3af72e7b3.mp4	5294946	1080	1920	13.546667	\N	VIDEO	\N
asset_1777433984930_0	里面的笔记本电脑就换成图1，图2这个笔记本_2K_202604160904	http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	cat_1777363045711	2026-04-29 03:39:24.956	uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	409429	\N	\N	\N	\N	IMAGE	98.08732214425595
asset_1777433985864_1	Project Product-1	http://localhost:9000/heovose-assets/uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	cat_1777363045711	2026-04-29 03:39:25.769	uploads/9197ccfa-8621-49ab-834a-6b3c475335c5.png	148092	\N	\N	\N	\N	IMAGE	153.5249831929991
asset_1777433986677_2	Project Product-2	http://localhost:9000/heovose-assets/uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	cat_1777363045711	2026-04-29 03:39:26.697	uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	149750	\N	\N	\N	\N	IMAGE	72.38812706642966
asset_1777433987620_3	Wholesale Product	http://localhost:9000/heovose-assets/uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	cat_1777363045711	2026-04-29 03:39:47.95	uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	120752	\N	\N	\N	\N	IMAGE	84.3050616188004
asset_1777439484026_6	7	http://localhost:9000/heovose-assets/uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	cat_1777439509227	2026-04-29 05:11:03.825	uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg	186134	\N	\N	\N	\N	IMAGE	236.5291356649274
asset_1777439480942_3	4	http://localhost:9000/heovose-assets/uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	cat_1777439509227	2026-04-29 05:11:21.274	uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg	174062	\N	\N	\N	\N	IMAGE	236.4127034621336
asset_1777439479065_1	2	http://localhost:9000/heovose-assets/uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	cat_1777439509227	2026-04-29 05:11:19.407	uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg	175650	\N	\N	\N	\N	IMAGE	235.1297905471962
asset_1777439481828_4	5	http://localhost:9000/heovose-assets/uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	cat_1777439509227	2026-04-29 05:11:22.408	uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg	230501	\N	\N	\N	\N	IMAGE	242.921940413837
asset_1777439483111_5	6	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	cat_1777439509227	2026-04-29 05:11:02.812	uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	409595	\N	\N	\N	\N	IMAGE	200.6740637832585
asset_1777439479940_2	3	http://localhost:9000/heovose-assets/uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	cat_1777439509227	2026-04-29 05:11:20.387	uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg	240459	\N	\N	\N	\N	IMAGE	223.6047683049831
asset_1777439478092_0	1	http://localhost:9000/heovose-assets/uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	cat_1777439509227	2026-04-29 05:11:18.522	uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg	190446	\N	\N	\N	\N	IMAGE	245.0097957943053
asset_1777439485065_7	8	http://localhost:9000/heovose-assets/uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	cat_1777439509227	2026-04-29 05:11:04.767	uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg	182281	\N	\N	\N	\N	IMAGE	238.6865701398756
asset_1777439647319_0	2	http://localhost:9000/heovose-assets/uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	cat_1777439615716	2026-04-29 05:13:47.12	uploads/b0e3bfad-aefa-49b3-8054-e8d927bdd78c.jpg	160258	\N	\N	\N	\N	IMAGE	229.2053246521169
asset_1777439648403_1	3	http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	cat_1777439615716	2026-04-29 05:13:48.107	uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg	162211	\N	\N	\N	\N	IMAGE	221.7926958358433
asset_1777439649230_2	4+	http://localhost:9000/heovose-assets/uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	cat_1777439615716	2026-04-29 05:13:49.021	uploads/8b9795e0-119c-4404-a2ca-c1eb86f1e6d6.jpg	55232	\N	\N	\N	\N	IMAGE	249.0067191508075
asset_1777439650261_3	5	http://localhost:9000/heovose-assets/uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	cat_1777439615716	2026-04-29 05:13:49.944	uploads/67efc91b-0fb2-4144-9a18-16cdc9be8051.jpg	56115	\N	\N	\N	\N	IMAGE	248.7478280031207
asset_1777439651171_4	6	http://localhost:9000/heovose-assets/uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	cat_1777439615716	2026-04-29 05:13:50.95	uploads/18fe18d1-74f6-4534-be9f-729d05650074.jpg	141463	\N	\N	\N	\N	IMAGE	232.4409182667673
asset_1777439652265_5	7	http://localhost:9000/heovose-assets/uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	cat_1777439615716	2026-04-29 05:14:12.599	uploads/051df97b-d2a2-409f-8dec-a5255ce0ed52.jpg	95362	\N	\N	\N	\N	IMAGE	241.5088273448256
asset_1777439653179_6	8	http://localhost:9000/heovose-assets/uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	cat_1777439615716	2026-04-29 05:14:13.624	uploads/a1b65d43-04ef-4fef-83c0-b90312b839ae.jpg	141021	\N	\N	\N	\N	IMAGE	230.0757208239955
asset_1777439654287_7	9	http://localhost:9000/heovose-assets/uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	cat_1777439615716	2026-04-29 05:14:14.609	uploads/78023efa-ea99-49cb-a8e0-4b39fa4ed119.jpg	74627	\N	\N	\N	\N	IMAGE	246.3521080336952
asset_1777439656696_9	12	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	cat_1777439615716	2026-04-29 05:13:57.39	uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	214659	\N	\N	\N	\N	IMAGE	207.9415051799249
asset_1777448722825_ywqq1_0	MINI-PC-P-1	http://localhost:9000/heovose-assets/uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	cat_1777433109728	2026-04-29 07:45:24.644	uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg	108510	900	1100	\N	\N	IMAGE	245.5979201888512
asset_1777448725091_e2jyo_1	MINI-PC-P-2	http://localhost:9000/heovose-assets/uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	cat_1777433109728	2026-04-29 07:45:25.551	uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg	138300	900	1100	\N	\N	IMAGE	240.2653810094099
asset_1777448725958_dibm2_2	MINI-PC-P-3	http://localhost:9000/heovose-assets/uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	cat_1777433109728	2026-04-29 07:45:26.293	uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg	135571	900	1100	\N	\N	IMAGE	243.0144285677279
asset_1777448726694_4lxgr_3	MINI-PC-P-4	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	cat_1777433109728	2026-04-29 07:45:27.115	uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	123066	900	1100	\N	\N	IMAGE	241.891355275887
asset_1777448727513_ptx4a_4	MINI-PC-P-5	http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	cat_1777433109728	2026-04-29 07:45:27.837	uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	131588	900	1100	\N	\N	IMAGE	230.9062916267121
asset_1777448728217_q9vv7_5	MINI-PC-P-6	http://localhost:9000/heovose-assets/uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	cat_1777433109728	2026-04-29 07:45:28.628	uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	112783	900	1100	\N	\N	IMAGE	228.4073890677427
asset_1777448729015_xnnhf_6	MINI-PC-P-7	http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	cat_1777433109728	2026-04-29 07:45:29.336	uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	114772	900	1100	\N	\N	IMAGE	232.4326262626262
asset_1777865670277_vhy6j_0	1-1	http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg	cat_1777856782910	2026-05-04 03:34:06.167	uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg	352788	1792	2400	\N	\N	IMAGE	105.1519853532395
asset_1778118049515_63lwr_0	e42bd174-0a62-475d-ad9e-24aa75d3d5b6-stream	http://localhost:9000/heovose-assets/uploads/5fae3bc9-26a1-4a8b-b115-4edb7f8a04ba.mp4	cat_1777363045711	2026-05-07 01:40:30.342	uploads/5fae3bc9-26a1-4a8b-b115-4edb7f8a04ba.mp4	11277814	1080	1920	15	\N	VIDEO	\N
asset_1778118341006_vt8p8_0	Heovose	http://localhost:9000/heovose-assets/uploads/eb4dd77e-2084-45f8-847d-533ca8f40285.mp4	cat_1777363045711	2026-05-07 01:45:44.901	uploads/eb4dd77e-2084-45f8-847d-533ca8f40285.mp4	20578228	1080	1920	30.033333	\N	VIDEO	\N
asset_1777367981154_0	这是一个一体机电脑产品，帮我生成一张使用场景的场景图_202604151453	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	cat_1777363045711	2026-04-28 09:19:21.635	uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	626021	\N	\N	\N	\N	IMAGE	145.3545043162868
asset_1777439655277_8	10	http://localhost:9000/heovose-assets/uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	cat_1777439615716	2026-04-29 05:13:56.376	uploads/ccfe4f35-2bb6-4b74-a32f-e06200382c47.jpg	302898	\N	\N	\N	\N	IMAGE	206.4269232323232
asset_1777865671144_h08ot_1	2-2	http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	cat_1777856782910	2026-05-04 03:34:06.911	uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	310293	1792	2400	\N	\N	IMAGE	117.1303978077119
asset_1777865671890_gl0an_2	3-1	http://localhost:9000/heovose-assets/uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg	cat_1777856782910	2026-05-04 03:34:07.731	uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg	555093	1792	2400	\N	\N	IMAGE	118.892306244876
asset_1777865672716_qxpao_3	4-1	http://localhost:9000/heovose-assets/uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	cat_1777856782910	2026-05-04 03:34:08.474	uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	586300	1792	2400	\N	\N	IMAGE	116.3104274182851
asset_1777865673431_fk2gc_4	4-2	http://localhost:9000/heovose-assets/uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg	cat_1777856782910	2026-05-04 03:34:09.289	uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg	318675	627	901	\N	\N	IMAGE	161.7050810658425
asset_1777865674262_u8v16_5	5-1	http://localhost:9000/heovose-assets/uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg	cat_1777856782910	2026-05-04 03:34:10.008	uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg	299834	1125	1500	\N	\N	IMAGE	153.5070706786463
asset_1777865674969_e60nw_6	5-2	http://localhost:9000/heovose-assets/uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg	cat_1777856782910	2026-05-04 03:34:10.787	uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg	343537	801	1200	\N	\N	IMAGE	169.0218852816004
asset_1777865675740_6m9gw_7	6-1	http://localhost:9000/heovose-assets/uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg	cat_1777856782910	2026-05-04 03:34:11.48	uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg	243513	1200	900	\N	\N	IMAGE	127.1303367640249
asset_1777865733016_wzmi7_0	2-1	http://localhost:9000/heovose-assets/uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	cat_1777856782910	2026-05-04 03:35:08.707	uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	267782	1080	1620	\N	\N	IMAGE	160.5970128436285
asset_1777439296324_0	2-1	http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	cat_1777856782910	2026-04-29 05:08:16.776	uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	267782	\N	\N	\N	\N	IMAGE	160.5970128436285
asset_1777967239460_sk87r_0	一体机宣传海报	http://localhost:9000/heovose-assets/uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg	cat_1777363045711	2026-05-05 07:46:55.987	uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg	279781	1536	2752	\N	\N	IMAGE	209.5443273881463
asset_1777968533975_xlq7y_0	Image 3	http://localhost:9000/heovose-assets/uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg	cat_1777363045711	2026-05-05 08:08:29.02	uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg	648935	2143	3840	\N	\N	IMAGE	195.039479446144
asset_1778570531966_wp5xs_0	外墙 拷贝 (1)	heovose-assets/uploads/f3ce0bc4-6db5-45b2-83d7-6409b16f2a37.jpg	cat_1777363045711	2026-05-12 07:22:11.837	uploads/f3ce0bc4-6db5-45b2-83d7-6409b16f2a37.jpg	474186	0	0	\N	\N	IMAGE	\N
asset_1778651897086_o4m87_0	Heovose 倾斜5度  - 副本	heovose-assets/uploads/01857b10-a02b-42c4-95b6-840634359db6.svg	cat_1777363045711	2026-05-13 05:58:18.421	uploads/01857b10-a02b-42c4-95b6-840634359db6.svg	3435	0	0	\N	\N	IMAGE	\N
asset_1778651899786_nib61_1	Heovose 倾斜5度 	heovose-assets/uploads/76f7a0a4-ace3-4f66-892e-649defc7b0aa.svg	cat_1777363045711	2026-05-13 05:58:19.692	uploads/76f7a0a4-ace3-4f66-892e-649defc7b0aa.svg	3435	0	0	\N	\N	IMAGE	\N
asset_1778653757789_x0jjq	favicon	heovose-assets/uploads/3133f9bb-8136-414a-beb8-47e32747f88e.ico	cat_1777363045711	2026-05-13 06:29:17.318	uploads/3133f9bb-8136-414a-beb8-47e32747f88e.ico	4286	\N	\N	\N	\N	IMAGE	\N
asset_1778654151840_d85j9	桌面机全款式规格书-CN-V7	heovose-assets/uploads/f9e55894-d172-4855-a35b-2404eb6461f4.pdf	cat_1777363045711	2026-05-13 06:35:52.068	uploads/f9e55894-d172-4855-a35b-2404eb6461f4.pdf	2767526	\N	\N	\N	\N	DOCUMENT	\N
asset_1778653524402_trljg	icon_32	heovose-assets/uploads/47eb4eed-d322-4f14-a387-476d225c94b7.png	cat_1777363045711	2026-05-13 06:25:24.261	uploads/47eb4eed-d322-4f14-a387-476d225c94b7.png	2037	\N	\N	\N	\N	IMAGE	\N
asset_1778723435980_1pi8v_0	2	heovose-assets/uploads/510780ff-09f4-43e8-9e43-b89090c3cd13.jpg	cat_1778723384125	2026-05-14 01:50:36.366	uploads/510780ff-09f4-43e8-9e43-b89090c3cd13.jpg	216062	0	0	\N	\N	IMAGE	\N
asset_1778723438556_m16x4_1	4	heovose-assets/uploads/f2764eeb-88ea-41fe-b24c-e96a951e81c3.jpg	cat_1778723384125	2026-05-14 01:50:37.719	uploads/f2764eeb-88ea-41fe-b24c-e96a951e81c3.jpg	183781	0	0	\N	\N	IMAGE	\N
asset_1778723439801_r066w_2	1	heovose-assets/uploads/94f7c546-3973-441b-84fe-17e7e8539bca.jpg	cat_1778723384125	2026-05-14 01:50:39.072	uploads/94f7c546-3973-441b-84fe-17e7e8539bca.jpg	244017	0	0	\N	\N	IMAGE	\N
asset_1778723441080_p29qv_3	3	heovose-assets/uploads/4ed30ee1-046b-40b3-a7f1-ed5382646cf5.jpg	cat_1778723384125	2026-05-14 01:50:40.419	uploads/4ed30ee1-046b-40b3-a7f1-ed5382646cf5.jpg	204183	0	0	\N	\N	IMAGE	\N
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
cat_1778723369247	台式机	4	cmoibfi3u000duknufk1cj48i
cat_1778723384125	TH2	1	cat_1778723369247
\.


--
-- Data for Name: HomepageBentoItem; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."HomepageBentoItem" (id, "order", "titleZh", "titleEn", "tagZh", "tagEn", "imageUrl", "linkUrl", "gridSize", "createdAt", "updatedAt", brightness) FROM stdin;
cmotm03ar0001ukpw6epm8ifq	1	一体机电脑	All-In-One PC			http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	products?category=aio	large	2026-05-06 05:21:01.106	2026-05-08 07:15:17.198	200.6740637832585
cmotlyork0000ukpwy7tydtim	2	小主机	Mini PC			http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	products?category=minipc	wide	2026-05-06 05:19:55.615	2026-05-08 07:15:17.351	232.4326262626262
cmotmqkwq0002ukpwqqnjph4a	3	笔记本电脑	Notebook			http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	products?category=notebook	small	2026-05-06 05:41:36.986	2026-05-08 07:15:44.638	207.9415051799249
cmotn71fa0005ukpwe6rnf8cc	4	工业一体机				http://localhost:9000/heovose-assets/uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg	products?category=industrial	large	2026-05-06 05:54:24.885	2026-05-08 07:15:18.009	116.3104274182851
cmotn04vj0004ukpwxydympu1	5	会议平板	Whiteboard			http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg	products?category=whiteboard	wide	2026-05-06 05:49:02.766	2026-05-08 07:15:18.42	117.1303978077119
cmotnd8br0006ukpwxydqkv9o	6	核心配件	Core Components	批发业务	Wholesale	http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg	products?category=core	tall	2026-05-06 05:59:13.746	2026-05-08 07:15:18.651	160.5970128436285
cmotmy04s0003ukpwrv11j33q	7	显示器	Monitor			http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg	products?category=monitor	tall	2026-05-06 05:47:23.307	2026-05-08 07:15:18.793	230.9062916267121
\.


--
-- Data for Name: HomepageContent; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."HomepageContent" (id, "heroHeadlineEn", "heroHeadlineZh", "heroSubheadlineEn", "heroSubheadlineZh", "heroWholesaleButtonEn", "heroWholesaleButtonZh", "heroProjectButtonEn", "heroProjectButtonZh", "heroWholesaleCategoryId", "heroProjectCategoryId", "isVideoEnabled", "videoTitleEn", "videoTitleZh", "videoSubtitleEn", "videoSubtitleZh", "mapTitleEn", "mapTitleZh", "mapSubtitleEn", "mapSubtitleZh", "heroProjectDescriptionEn", "heroProjectDescriptionZh", "heroSlides", "heroWholesaleDescriptionEn", "heroWholesaleDescriptionZh", "videoUrl", "heroProjectBg", "heroWholesaleBg", "bentoSubtitleEn", "bentoSubtitleZh", "bentoTitleEn", "bentoTitleZh", "processSubtitleEn", "processSubtitleZh", "processTitleEn", "processTitleZh", "gallerySubtitleEn", "gallerySubtitleZh", "galleryTitleEn", "galleryTitleZh", "galleryItems", "casesSubtitleEn", "casesSubtitleZh", "casesTitleEn", "casesTitleZh", "casesSubtitleTextId", "casesTitleTextId", "processSubtitleTextId", "processTitleTextId", "mapSubtitleTextId", "mapTitleTextId") FROM stdin;
video	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	http://localhost:9000/heovose-assets/uploads/eb4dd77e-2084-45f8-847d-533ca8f40285.mp4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	CASES_SUBTITLE	CASES_TITLE	PROCESS_SUBTITLE	PROCESS_TITLE	MAP_SUBTITLE	MAP_TITLE
bento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Explore our diverse product range	探索我们的多元化产品系列	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	CASES_SUBTITLE	CASES_TITLE	PROCESS_SUBTITLE	PROCESS_TITLE	MAP_SUBTITLE	MAP_TITLE
gallery	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Featured Products	精选产品	[]	\N	\N	\N	\N	CASES_SUBTITLE	CASES_TITLE	PROCESS_SUBTITLE	PROCESS_TITLE	MAP_SUBTITLE	MAP_TITLE
map	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	Factory Address	工厂地址	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	CASES_SUBTITLE	CASES_TITLE	PROCESS_SUBTITLE	PROCESS_TITLE	MAP_SUBTITLE	MAP_TITLE
hero	Elevate Your Digital Horizon	提升您的数字视野	Next-Generation Hardware Solutions for Global Enterprises	面向全球企业的下一代硬件解决方案	Wholesale Products	批发产品	Project Products	项目产品	WHOLESALE	PROJECT	t	Our Craftsmanship	我们的工艺	\N	\N	Global Footprint	全球足迹	\N	\N	\N	\N	[{"id": "legacy-default", "bgImage": "http://localhost:9000/heovose-assets/uploads/633b89ab-91e2-4047-ab85-750df64c0ed3.jpg", "priority": 0, "brightness": 195.039479446144, "headlineEn": "Elevate Your Digital Horizon", "headlineZh": "提升您的数字视野", "subheadlineEn": "Next-generation hardware solutions for global enterprises", "subheadlineZh": "面向全球企业的下一代硬件解决方案"}, {"id": "slide_1777967445203", "bgImage": "http://localhost:9000/heovose-assets/uploads/b1b9ef74-fe06-45a0-93ee-f3f7283e8dfd.jpg", "priority": 1, "brightness": 209.5443273881463, "headlineEn": "F9-S Series All-in-one PC", "headlineZh": "F9-S系列 一体机电脑", "subheadlineEn": "Base supports lifting, lowering, and rotation, with brightness adjustment and a pop-up camera.", "subheadlineZh": "底座支撑升降旋转，支持亮度调节，弹出式摄像头"}, {"id": "slide_1778116448593", "bgImage": "http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg", "priority": 2, "brightness": 98.08732214425595, "headlineEn": "", "headlineZh": "", "subheadlineEn": "", "subheadlineZh": ""}]	\N	\N	\N	http://localhost:9000/heovose-assets/uploads/0c0e4c85-1a0a-4ec7-86ef-47726bfa924c.png	http://localhost:9000/heovose-assets/uploads/c61bd50a-2cc7-490d-8c67-13b30ba36753.png	\N	\N	\N	\N	\N	\N	Production Pipeline	生产流程	\N	\N	\N	\N	\N	Real-world impact of Heovose hardware solutions.	Heovose 硬件方案在全球的真实应用。	Success Stories	案例展示	CASES_SUBTITLE	CASES_TITLE	PROCESS_SUBTITLE	PROCESS_TITLE	MAP_SUBTITLE	MAP_TITLE
\.


--
-- Data for Name: Inquiry; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Inquiry" (id, name, email, phone, company, subject, message, "productId", status, "createdAt", "updatedAt", "emailViewedAt") FROM stdin;
cmp3c3h180006ukb3id59dclr	Test User	test@example.com	1234567890	Test Co	\N	Hello from automated test	\N	pending	2026-05-13 00:41:24.474	2026-05-13 00:41:24.474	\N
cmp3cfcxs002hukb3i7ezy38c	anthony	112233@qq.com	1577999	aldfjksjfla	\N	flajdlfja;ldjf;ajd;flja;lsdjf;aljsd;fkja;dkfjaksdj adFD尽量简单来说放假阿拉山口大姐夫拉屎的	\N	pending	2026-05-13 00:50:39.041	2026-05-13 00:50:39.041	\N
cmp3cnlol0052ukb3n6r784qs	发都发水电费	dfadfsd@qq.com	1231231412	312312312	\N	3123123123123	\N	pending	2026-05-13 00:57:03.621	2026-05-13 00:57:03.621	\N
cmp3cnurr005fukb3rwm3pjzs	发都发水电费	admin@heovose.com	2312312	3123123	\N	123123123123123	\N	pending	2026-05-13 00:57:15.399	2026-05-13 00:57:15.399	\N
cmp3co3ci005wukb3gbiuifqs	fadfaer	1572865506@qq.com	251231231	2512312	\N	3123125121323123	\N	pending	2026-05-13 00:57:26.515	2026-05-13 00:57:26.515	\N
cmp3cpkk5006bukb3i7rjwqkq	23124123123	12312@bb.com	6121241	251241231	\N		\N	pending	2026-05-13 00:58:35.477	2026-05-13 00:58:35.477	\N
cmp3cwcl90074ukb3n1248dgr	adsfsf	112233@qq.com	1231231412		\N	询盘详情窗口的布局已经调整完毕。\n\n改动清单：\n内容框对齐：为电子邮箱、公司名称、联系电话和提交时间的内容框统一设置了 h-14（56px）的固定高度，并配合 flex items-center 实现了完美的垂直对齐。\n文本样式优化：\n去引号：移除了咨询内容前后的双引号。\n去状态条：去掉了左侧的绝对定位装饰条。\n去倾斜：移除了之前的 italic 斜体样式，改用常规字体，阅读更清晰。\n日期格式精简：将提交时间从“yyyy年MM月dd日”改成了更干练的 yyyy-MM-dd HH:mm:ss 格式。\n验证建议： 再次打开任意一条询盘详情。你会发现顶部的四个信息块高度完全一致，底部的咨询内容区域也变得更加干净、专业。\n\n如果觉得哪里还需要微调，请随时告诉我。	\N	processed	2026-05-13 01:03:51.741	2026-05-13 01:05:26.959	\N
cmp3qgtg400g3uk3kmp0zmqyv	15411	1572865506@qq.com	295295259	295252	\N	29529522952592	\N	pending	2026-05-13 07:23:41.716	2026-05-13 07:23:41.716	\N
cmp3svlxf001suk1n01mvp7yh	123123	412312@qq.com	12312	3123123	\N	4123123123123	PROD_KIOSK_0505_E0XK	pending	2026-05-13 08:31:11.043	2026-05-13 08:31:11.043	\N
cmp3tbh6f003vuk1nny1s4krf	fadfaer	112233@qq.com	1577999	2512312	\N	65a1f51as5f1a6s51f	\N	pending	2026-05-13 08:43:31.383	2026-05-13 08:43:31.383	\N
cmp3trpr80050uk1nyiruffvn	Test Full name	test@qq.com	Test phone Number	Test Company name	\N	agadfadfwerqetqwerqeraljdlkajsdljalsd	\N	pending	2026-05-13 08:56:08.996	2026-05-13 08:56:08.996	\N
cmp3tvw1l005nuk1n6eo1zscq	Test Full name	test@qq.com	Test phone Number	Test Company name	\N	glajdjf124109283018923	\N	pending	2026-05-13 08:59:23.769	2026-05-13 08:59:23.769	\N
cmp3u0mgk006ouk1no788lvqb	anthony	12312@bb.com	1231231412	Test Company name	\N	据2026年《广东省普通高等学校招生工作规定》，全国统一高考考试科目包括语文、数学、外语3门科目，使用全国卷，由教育部教育考试院统一命题。\n\n外语选考语种为英语、俄语、日语、法语、德语、西班牙语中的一种。外语语种为英语的考生，须参加英语听说考试。英语听说考试由广东省自主命题、单独举行。\n\n3门广东省普通高中学业水平选择性考试科目，由考生在物理、历史2门科目中自主选择1门，在思想政治、地理、化学、生物学4门科目中自主选择2门组成（简称“四选二”）。上述考试科目由省教育考试院组织命题。\n\n英语听说及音乐类、舞蹈类、表（导）演类、播音与主持类、美术与设计类、书法类、体育类专业实行全省统一考试，试题命制及评分参考由省教育考试院制定。\n\n高校招生专业按普通类（物理）、普通类（历史）、艺体类划分。艺体类包含音乐类、舞蹈类、表（导）演类、播音与主持类、美术与设计类、书法类、戏曲类、体育类专业。	PROD_AIO_0504_987C	pending	2026-05-13 09:03:04.628	2026-05-13 09:03:04.628	\N
cmp3ubtku007fuk1n8ly6xld5	发都发水电费	112233@qq.com	1231231412	2512312	\N	更新细节：\n\n标识强化：邮件主题现统一前缀为 【官网询盘】。这能帮助您的员工在收件箱中快速通过关键词过滤和识别来自网站的正式商机。\n一键直达产品页：\n在邮件正文中，Product ID 现在是一个可点击的蓝色链接。\n点击该 ID 将直接在浏览器中打开官网上对应的产品详情页面，方便业务员第一时间了解客户感兴趣的具体型号。\n新增提交时间：\n正文底部新增了 Submission Time 字段。\n该时间严格锁定为北京时间 (Asia/Shanghai)，精确记录了客户点击发送的具体时刻，为您判断询盘时效性提供有力依据。\n排版微调：优化了字段的垂直对齐，确保在手机端和电脑端查看时，关键信息（姓名、邮箱、产品、时间）均能整齐排列。\n现在，您的每一封询盘转发邮件都变成了一份包含上下文、可跳转、有时间戳的完整业务简报。建议您提交一个测试询盘来查看效果。	PROD_AIO_0504_987C	pending	2026-05-13 09:11:47.07	2026-05-13 09:11:47.07	\N
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
psv_PROD_AIO_0504_987C_4_0	{"en": "Power Cable, Power Adapter, User Manual", "zh": "电源线，电源适配器，用户手册"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_4	{"en": "CPU", "zh": "CPU"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_5	{"en": "Memory", "zh": "内存"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_3	{"en": "Resolution", "zh": "分辨率"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_6	{"en": "SSD", "zh": "固态硬盘"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_7	{"en": "HDD", "zh": "机械硬盘"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_8	{"en": "Graphics Card", "zh": "显卡"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
psl_PROD_AIO_0504_987C_0_10	{"en": "System", "zh": "系统"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
prod_name_PROD_MONITOR_0504_FIA9	{"zh": "啊多发点范围打法打法打法地方阿道夫阿斯蒂芬阿道夫阿道夫阿斯顿"}	2026-05-05 02:11:57.117	2026-05-05 02:11:57.117
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
psl_PROD_AIO_0504_987C_0_1	{"en": "Screen Size", "id": "Ukuran Layar", "zh": "屏幕尺寸"}	2026-05-05 02:11:57.117	2026-05-15 07:13:18.7
hero_subheadline	{"en": "Professional Manufacturer", "id": "Produsen Profesional", "zh": "专业级制造商"}	2026-05-05 09:10:12.633	2026-05-05 09:10:12.633
hero_cta	{"en": "Explore Solutions", "id": "Jelajahi Solusi", "zh": "探索方案"}	2026-05-05 09:10:12.638	2026-05-05 09:10:12.638
cat_name_NOTEBOOK	{"en": "Notebook computer", "zh": "笔记本电脑"}	2026-05-05 02:11:57.117	2026-05-06 05:02:30.707
hero_slide_1778034103591_headline	{"en": "New Title", "zh": "新标题"}	2026-05-06 02:21:33.568	2026-05-06 05:53:36.152
hero_slide_1778034103591_subheadline	{"en": "New Subtitle", "zh": "新副标题"}	2026-05-06 02:21:33.571	2026-05-06 05:53:36.152
hero_wholesale_title	{"en": "Wholesale Products", "id": "Produk Grosir", "zh": "批发产品"}	2026-05-05 09:10:12.642	2026-05-12 06:36:40.759
hero_project_desc	{"en": "", "id": "", "zh": ""}	2026-05-05 09:10:12.653	2026-05-12 06:36:40.763
PRODUCTS_SUBTITLE	{"en": "", "zh": ""}	2026-05-06 09:07:44.54	2026-05-12 06:36:40.765
hero_wholesale_desc	{"en": "", "id": "", "zh": ""}	2026-05-05 09:10:12.646	2026-05-12 06:36:40.77
BADGE_NEW	{"en": "NEW", "id": "TERKINI", "zh": "新品"}	2026-05-07 01:45:18.746	2026-05-15 06:55:52.701
hero_project_title	{"en": "Project Products", "id": "Solusi Proyek", "zh": "项目产品"}	2026-05-05 09:10:12.649	2026-05-12 06:36:40.762
PRODUCTS_TITLE	{"en": "Explore our diverse product range", "zh": "探索我们的多元化产品系列"}	2026-05-06 09:07:43.901	2026-05-12 06:36:40.764
process_step_step_1778201589249_title	{"en": "Procurement", "zh": "采购"}	2026-05-08 08:07:00.318	2026-05-08 08:07:07.762
process_step_step_1778201589249_desc	{"en": "Strategic sourcing and purchasing of high-quality raw materials from certified suppliers.", "zh": "从供应商处战略性地采购优质原材料。"}	2026-05-08 08:07:00.324	2026-05-08 08:07:07.77
process_step_step_1778201616561_title	{"en": "Supplier", "zh": "供应商"}	2026-05-08 08:07:07.781	2026-05-08 08:07:07.781
process_step_step_1778201616561_desc	{"en": "Managing supplier relationships and ensuring timely delivery of components.", "zh": "管理供应商关系并确保零部件及时交付。"}	2026-05-08 08:07:07.785	2026-05-08 08:07:07.785
process_step_step_1778201602533_title	{"en": "Receiving", "zh": "接收"}	2026-05-08 08:07:07.793	2026-05-08 08:07:07.793
process_step_step_1778201602533_desc	{"en": "Receiving and verifying incoming materials against purchase orders.", "zh": "接收并核对到货物料与采购订单是否相符。"}	2026-05-08 08:07:07.797	2026-05-08 08:07:07.797
process_step_cmoibfi3p000cuknuihdblv62_title	{"en": "PMC Planning", "zh": "PMC规划"}	2026-05-08 08:07:07.804	2026-05-08 08:07:07.804
GALLERY_TITLE	{"en": "Featured Products", "zh": "精选产品"}	2026-05-06 09:07:44.56	2026-05-12 06:36:41.673
GALLERY_SUBTITLE	{"en": "", "zh": ""}	2026-05-06 09:07:44.655	2026-05-12 06:36:41.676
hero_slide_legacy-default_headline	{"en": "Elevate Your Digital Horizon", "id": "Tingkatkan Cakrawala Digital Anda", "zh": "提升您的数字视野"}	2026-05-06 01:53:56.258	2026-05-12 06:36:41.678
hero_slide_legacy-default_subheadline	{"en": "Next-generation hardware solutions for global enterprises", "zh": "面向全球企业的下一代硬件解决方案"}	2026-05-06 01:53:56.258	2026-05-12 06:36:41.679
hero_slide_1777967445203_headline	{"en": "F9-S Series All-in-one PC", "zh": "F9-S系列 一体机电脑"}	2026-05-06 01:53:57.069	2026-05-12 06:36:41.68
hero_slide_1777967445203_subheadline	{"en": "Base supports lifting, lowering, and rotation, with brightness adjustment and a pop-up camera.", "zh": "底座支撑升降旋转，支持亮度调节，弹出式摄像头"}	2026-05-06 01:53:57.071	2026-05-12 06:36:41.685
hero_slide_1778116448593_headline	{"en": "", "zh": ""}	2026-05-07 01:14:20.034	2026-05-12 06:36:42.157
hero_slide_1778116448593_subheadline	{"en": "", "zh": ""}	2026-05-07 01:14:20.042	2026-05-12 06:36:42.159
BADGE_HOT	{"en": "HOT", "id": "Panas", "zh": "热销"}	2026-05-07 01:45:18.756	2026-05-15 06:55:17.411
process_step_cmoibfi3p000cuknuihdblv62_desc	{"en": "Production and material control planning for optimal resource allocation and timeline management.", "zh": "生产和物料控制计划，以实现最佳资源配置和时间管理。"}	2026-05-08 08:07:07.808	2026-05-08 08:07:07.808
process_step_step_1778201650787_title	{"en": "Inspection", "zh": "检查"}	2026-05-08 08:07:07.814	2026-05-08 08:07:07.814
process_step_step_1778201650787_desc	{"en": "Comprehensive quality inspection ensuring all materials meet specifications.", "zh": "进行全面质量检验，确保所有材料均符合规格要求。"}	2026-05-08 08:07:07.817	2026-05-08 08:07:07.817
process_step_step_1778201661146_title	{"en": "Warehousing", "zh": "仓储"}	2026-05-08 08:07:07.825	2026-05-08 08:07:07.825
process_step_step_1778201661146_desc	{"en": "Secure storage of qualified materials in climate-controlled facilities.", "zh": "在温控设施中安全储存合格材料。"}	2026-05-08 08:07:07.829	2026-05-08 08:07:07.829
process_step_step_1778201672084_title	{"en": "Material Issuing", "zh": "材料发行"}	2026-05-08 08:07:07.836	2026-05-08 08:07:07.836
process_step_step_1778201672084_desc	{"en": "Systematic material requisition and distribution to production lines.", "zh": "系统地申请物料并将其分发到生产线。"}	2026-05-08 08:07:07.839	2026-05-08 08:07:07.839
process_step_step_1778201695830_title	{"en": "Manufacturing", "zh": "制造"}	2026-05-08 08:07:07.845	2026-05-08 08:07:07.845
process_step_step_1778201695830_desc	{"en": "Precision manufacturing using advanced equipment and strict quality protocols.", "zh": "采用先进设备和严格的质量控制流程进行精密制造。"}	2026-05-08 08:07:07.848	2026-05-08 08:07:07.848
process_step_step_1778201715793_title	{"en": "Pre-Shipment Inspection", "zh": "装运前检验"}	2026-05-08 08:07:07.855	2026-05-08 08:07:07.855
process_step_step_1778201715793_desc	{"en": "Final quality assurance before products leave the facility.", "zh": "产品出厂前的最终质量检验。"}	2026-05-08 08:07:07.859	2026-05-08 08:07:07.859
process_step_step_1778203371049_title	{"en": "Warehousing", "zh": "仓储"}	2026-05-08 08:07:07.868	2026-05-08 08:07:07.868
process_step_step_1778203371049_desc	{"en": "Product storage and inventory management before shipment.", "zh": "发货前的产品存储和库存管理。"}	2026-05-08 08:07:07.871	2026-05-08 08:07:07.871
process_step_step_1778203386487_title	{"en": "Shipment", "zh": "运输"}	2026-05-08 08:07:07.88	2026-05-08 08:07:07.88
process_step_step_1778203386487_desc	{"en": "Secure packaging and global distribution to customers worldwide.", "zh": "安全包装，全球配送，服务全球客户。"}	2026-05-08 08:07:07.884	2026-05-08 08:07:07.884
MAP_LOC_LOC_DEBUG_1_DESC	{"en": "Debug Desc En", "zh": "Debug Desc"}	2026-05-12 00:53:14.338	2026-05-12 00:53:14.338
CASES_TITLE	{"en": "Success Stories", "id": "Kisah Sukses", "vi": "Câu chuyện thành công", "zh": "案例展示"}	2026-05-08 08:30:46.114	2026-05-11 06:24:41.385
case_study_case_1778229658031_title	{"en": "", "zh": "儿玩阿道夫玩儿儿"}	2026-05-08 08:40:32.396	2026-05-08 08:40:32.396
case_study_case_1778229658031_tag	{"en": "", "zh": "发的开始"}	2026-05-08 08:40:32.42	2026-05-08 08:40:32.42
PROCESS_SUBTITLE	{"en": "", "zh": ""}	2026-05-11 00:57:05.525	2026-05-11 00:59:47.016
PROCESS_TITLE	{"en": "Production Pipeline", "id": "Jalur Produksi", "zh": "生产流程"}	2026-05-11 00:57:05.503	2026-05-11 01:00:36.864
case_study_case_1778230943052_desc	{"en": "", "zh": "放大圈儿确认企鹅人情恶我让玩儿去人3123 "}	2026-05-08 09:01:57.438	2026-05-08 09:01:57.438
case_study_case_1778230943052_title	{"en": "", "zh": "发的企鹅圈儿去23"}	2026-05-08 09:01:57.439	2026-05-08 09:01:57.439
case_study_case_1778230943052_tag	{"en": "", "zh": "阿德福韦"}	2026-05-08 09:01:57.464	2026-05-08 09:01:57.464
CASES_SUBTITLE	{"en": "", "id": "", "vi": "Tác động thực tế của giải pháp phần cứng Heovose.", "zh": ""}	2026-05-08 08:30:46.133	2026-05-11 06:24:41.387
case_study_case_1778461325264_desc	{"en": "", "zh": "发的发打发蛋糕热一天涂鸦街法国红酒分开法国红酒法国红酒让他也非常方便橙V百度分公司而问题而啊发的发都发地方阿道夫打发打发打发地方"}	2026-05-11 01:01:38.654	2026-05-12 05:40:33.68
case_study_case_1778469214742_title	{"en": "", "zh": "我日3 而额尔"}	2026-05-11 03:13:35.835	2026-05-12 05:40:39.224
MAP_LOC_LOC_1778547657316_TITLE	{"en": "Large-scale manufacturing facilities for large-sized products and commercial displays", "zh": "大尺寸及商显生产工厂"}	2026-05-12 01:00:57.17	2026-05-15 09:03:38.039
case_study_cmoibfi3k000buknut5a5e8tx_tag	{"en": "RETAIL", "id": "Retail", "zh": "智慧零售"}	2026-05-08 08:30:46.156	2026-05-15 06:53:51.847
case_study_cmoibfi3k000buknut5a5e8tx_title	{"en": "Smart POS Integration", "id": "Integrasi POS Cerdas (Smart POS Integration)", "zh": "智能 POS 集成方案"}	2026-05-08 08:30:46.15	2026-05-15 06:53:58.125
case_study_case_1778469214742_desc	{"en": "", "zh": "发文问问父亲违法圈儿发穷恶放弃而且嗯发我f"}	2026-05-11 03:13:35.836	2026-05-12 05:40:39.225
MAP_LOC_DEBUG_1_TITLE	{"en": "Debug Factory En", "zh": "Debug Factory"}	2026-05-12 00:52:18.725	2026-05-12 00:52:18.725
MAP_LOC_DEBUG_1_ADDR	{"en": "Debug Addr En", "zh": "Debug Addr"}	2026-05-12 00:52:19.148	2026-05-12 00:52:19.148
MAP_LOC_DEBUG_1_DESC	{"en": "Debug Desc En", "zh": "Debug Desc"}	2026-05-12 00:52:19.487	2026-05-12 00:52:19.487
MAP_NETWORK_LABEL	{"en": "Heovose Global Network", "zh": "全球网点布局"}	2026-05-11 08:59:06.516	2026-05-12 01:01:41.493
case_study_case_1778469214742_tag	{"en": "", "zh": "多发发"}	2026-05-11 03:13:35.837	2026-05-12 05:40:39.226
case_study_case_1778231480450_title	{"en": "", "zh": "发二分为发"}	2026-05-08 09:11:21.805	2026-05-12 05:41:10.985
case_study_case_1778231480450_tag	{"en": "", "zh": "发顺丰的"}	2026-05-08 09:11:21.806	2026-05-12 05:41:10.987
MAP_TITLE	{"en": "Factory Address", "zh": "工厂地址"}	2026-05-11 08:59:05.797	2026-05-12 01:01:40.8
MAP_LOC_LOC_DEBUG_1_TITLE	{"en": "Debug Factory En", "zh": "Debug Factory"}	2026-05-12 00:53:13.617	2026-05-12 00:53:13.617
MAP_LOC_LOC_DEBUG_1_ADDR	{"en": "Debug Addr En", "zh": "Debug Addr"}	2026-05-12 00:53:13.98	2026-05-12 00:53:13.98
MAP_SUBTITLE	{"en": "", "zh": ""}	2026-05-11 08:59:06.159	2026-05-12 01:01:41.152
MAP_LOC_LOC_1778548173311_TITLE	{"en": "12312312124", "zh": "5123123"}	2026-05-12 01:09:34.077	2026-05-12 01:14:43.236
MAP_LOC_LOC_1778548173311_ADDR	{"en": "123123", "zh": "125121241"}	2026-05-12 01:09:34.1	2026-05-12 01:14:43.236
MAP_LOC_LOC_1778548173311_DESC	{"en": "512512512", "zh": "25121321251212"}	2026-05-12 01:09:34.101	2026-05-12 01:14:43.239
MAP_LOC_LOC_1778548544943_DESC	{"en": "", "zh": ""}	2026-05-12 01:15:45.3	2026-05-12 07:22:26.549
case_study_case_1778229658031_desc	{"en": "Short hair services are more common, with the number 1231241 being associated with them.", "id": "Pelayanan pemotongan rambut pendek lebih umum dilakukan, dan angka 1231241 dikaitkan dengan pelayanan tersebut.", "zh": "短发多发点服务而1231241"}	2026-05-08 08:40:32.419	2026-05-15 06:56:32.296
case_study_cmoibfi3k000buknut5a5e8tx_desc	{"en": "Optimizing checkout experiences across 500+ stores.", "id": "Mengoptimalkan pengalaman proses pembelian di lebih dari 500 toko.", "zh": "优化 500 多家门店的结账体验。"}	2026-05-08 08:30:46.153	2026-05-15 06:53:23.37
MAP_LOC_LOC_1778548544943_TITLE	{"en": "", "zh": "小尺寸电脑设备工厂"}	2026-05-12 01:15:45.298	2026-05-12 07:22:26.547
MAP_LOC_LOC_1778548544943_ADDR	{"en": "", "zh": "广东省佛山市顺德区龙江镇新华西村华宝东路2号万洋万众园"}	2026-05-12 01:15:45.299	2026-05-12 07:22:26.548
MAP_LOC_LOC_1778547657316_DESC	{"en": "", "zh": ""}	2026-05-12 01:00:57.171	2026-05-15 09:03:38.061
case_study_case_1778461325264_tag	{"en": "", "zh": "而且未"}	2026-05-11 01:01:38.655	2026-05-12 05:40:33.681
case_study_case_1778461325264_title	{"en": "", "zh": "发我请问福大福额外容器而圈儿去而且厄齐尔而且打发打发七二七二提前额外让我去"}	2026-05-11 01:01:38.653	2026-05-12 05:40:33.682
case_study_case_1778231480450_desc	{"en": "", "zh": "圈儿去而且而12312 答复玩儿去而圈儿er"}	2026-05-08 09:11:21.807	2026-05-12 05:41:10.986
MAP_LOC_LOC_1778571197697_TITLE	{"en": "", "zh": "512312"}	2026-05-12 07:33:18.103	2026-05-12 07:33:18.103
MAP_LOC_LOC_1778571197697_ADDR	{"en": "", "zh": "3123123"}	2026-05-12 07:33:18.104	2026-05-12 07:33:18.104
MAP_LOC_LOC_1778571197697_DESC	{"en": "", "zh": "123123123"}	2026-05-12 07:33:18.13	2026-05-12 07:33:18.13
MAP_LOC_LOC_1778571244029_TITLE	{"en": "", "zh": "612312"}	2026-05-12 07:34:03.3	2026-05-12 07:34:03.3
MAP_LOC_LOC_1778571244029_ADDR	{"en": "", "zh": "31251231"}	2026-05-12 07:34:03.301	2026-05-12 07:34:03.301
MAP_LOC_LOC_1778571244029_DESC	{"en": "", "zh": "231231"}	2026-05-12 07:34:03.302	2026-05-12 07:34:03.302
INQUIRY_TITLE	{"en": "Send Inquiry", "id": "Kirim Pertanyaan", "vi": "Gửi yêu cầu báo giá", "zh": "在线发送询盘"}	2026-05-13 01:50:27.265	2026-05-13 01:50:27.265
INQUIRY_NAME	{"en": "Full Name", "id": "Nama Lengkap", "vi": "Họ và tên", "zh": "您的姓名"}	2026-05-13 01:50:27.277	2026-05-13 01:50:27.277
INQUIRY_EMAIL	{"en": "Email Address", "id": "Alamat Email", "vi": "Địa chỉ Email", "zh": "联系邮箱"}	2026-05-13 01:50:27.281	2026-05-13 01:50:27.281
INQUIRY_PHONE	{"en": "Phone Number (Optional)", "id": "Nomor Telepon (Opsional)", "vi": "Số điện thoại (Không bắt buộc)", "zh": "电话/微信 (可选)"}	2026-05-13 01:50:27.285	2026-05-13 01:50:27.285
INQUIRY_COMPANY	{"en": "Company Name", "id": "Nama Perusahaan", "vi": "Tên công ty", "zh": "公司名称"}	2026-05-13 01:50:27.289	2026-05-13 01:50:27.289
INQUIRY_MESSAGE	{"en": "Your Message", "id": "Pesan Anda", "vi": "Nội dung tin nhắn", "zh": "咨询内容"}	2026-05-13 01:50:27.297	2026-05-13 01:50:27.297
INQUIRY_SUBMIT	{"en": "SUBMIT INQUIRY", "id": "KIRIM PERTANYAAN", "vi": "GỬI YÊU CẦU", "zh": "立即提交询盘"}	2026-05-13 01:50:27.301	2026-05-13 01:50:27.301
INQUIRY_SUCCESS	{"en": "Your inquiry has been submitted successfully. Our team will contact you soon.", "id": "Pertanyaan Anda telah berhasil dikirim. Tim kami akan segera menghubungi Anda.", "vi": "Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm.", "zh": "询盘已成功送达，我们的专家将尽快为您回复。"}	2026-05-13 01:50:27.304	2026-05-13 01:50:27.304
INQUIRY_SENDING	{"en": "Processing...", "id": "Memproses...", "vi": "Đang xử lý...", "zh": "正在提交..."}	2026-05-13 01:50:27.308	2026-05-13 01:50:27.308
COOKIE_CONSENT_MESSAGE	{"en": "We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.", "id": "Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan terus mengunjungi situs ini, Anda menyetujui penggunaan cookie kami.", "jp": "クッキーを使用して、より良い体験を提供します。このサイトを引き続きご利用いただくことで、クッキーの使用に同意したものとみなされます。", "vi": "Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn. Bằng cách tiếp tục truy cập trang web này, bạn đồng ý với việc chúng tôi sử dụng cookie.", "zh": "我们使用 Cookie 来改善您的浏览体验。继续访问本网站即表示您同意我们使用 Cookie。"}	2026-05-13 09:20:14.285	2026-05-15 05:49:03.392
psv_PROD_KIOSK_0505_E0XK_4_1	{"en": "Dimensions:\\n19 inches: 495 (Length) × 145 (Width) × 450 (Height) mm\\n21.5 inches: 560 (Length) × 145 (Width) × 450 (Height) mm\\n23.8 inches: 600 (Length) × 145 (Width) × 450 (Height) mm\\n27 inches: -", "id": "19 inci: 495(L)×145(D)×450(H)mm  \\n21,5 inci: 560(L)×145(D)×450(H)mm  \\n23,8 inci: 600(L)×145(D)×450(H)mm  \\n27 inci: -", "zh": "19英寸：495(L)×145(D)×450(H)mm\\n21.5英寸：560(L)×145(D)×450(H)mm\\n23.8英寸：600(L)×145(D)×450(H)mm\\n27英寸：-"}	2026-05-05 05:09:56.122	2026-05-15 06:35:13.522
prod_name_PROD_ESSENTIALS_0514_1I7H	{"en": "E-sports Entertainment TH2 Series Gaming Office Computers", "id": "E-sports entertainment, TH2 series: gaming and office computers", "zh": "电竞娱乐 TH2系列 游戏办公电脑"}	2026-05-14 03:55:12.71	2026-05-15 05:46:26.417
prod_desc_PROD_ESSENTIALS_0514_1I7H	{"en": "Full tempered glass on the sides with side visibility; front panel features a grid design.  \\nSupports graphics cards up to 320mm in length.", "id": "Kaca tempered penuh di sisi-sisinya, yang memungkinkan visibilitas ke samping; panel depan memiliki desain berbentuk kisi-kisi (grid design).  \\nDapat mendukung kartu grafis dengan panjang hingga 320 mm.", "zh": "全钢化玻璃侧透，前面板栅格设计\\n支持最长320mm显卡"}	2026-05-14 03:55:13.335	2026-05-15 06:48:50.999
psv_PROD_KIOSK_0505_E0XK_4_0	{"en": "Power cord, power adapter, user manual", "id": "Kabel listrik, adaptor daya, manual pengguna", "jp": "電源コード、電源アダプター、ユーザーマニュアル", "zh": "电源线，电源适配器，用户手册"}	2026-05-05 05:09:56.124	2026-05-15 06:34:47.416
psv_PROD_KIOSK_0505_E0XK_4_2	{"en": "19 inches: 3.75kg  \\n21.5 inches: 5.4kg  \\n23.8 inches: 5.4kg  \\n27 inches: -", "id": "19 inch: 3.75 kg  \\n21.5 inch: 5.4 kg  \\n23.8 inch: 5.4 kg  \\n27 inch: -", "zh": "19英寸：3.75kg\\n21.5英寸：5.4kg\\n23.8英寸：5.4kg\\n27英寸：-"}	2026-05-05 05:09:56.123	2026-05-15 06:32:21.946
psl_PROD_AIO_0504_987C_0_0	{"en": "Model", "id": "Model", "zh": "型号"}	2026-05-05 02:11:57.117	2026-05-15 07:11:14.333
psg_PROD_KIOSK_0505_E0XK_3	{"en": "Connection parameters", "id": "Parameter koneksi", "zh": "连接参数"}	2026-05-05 05:09:49.865	2026-05-15 06:46:40.823
SITE_TITLE	{"en": "", "id": "SITE_TITLE", "zh": ""}	2026-05-13 06:14:00.699	2026-05-13 06:45:40.597
SITE_DESCRIPTION	{"en": "", "id": "SITE_DESCRIPTION", "zh": ""}	2026-05-13 06:14:00.7	2026-05-13 06:45:40.598
SITE_KEYWORDS	{"en": "", "id": "SITE_KEYWORDS", "zh": ""}	2026-05-13 06:14:00.701	2026-05-13 06:45:40.599
COMPANY_PHONE	{"en": "", "id": "COMPANY_PHONE", "zh": "13800138000"}	2026-05-13 06:14:00.699	2026-05-13 06:45:40.601
COMPANY_NAME	{"en": "Heovose Technology Co., Ltd.", "id": "Heovose Technology Co., Ltd.", "zh": "广州市瀚想计算机有限公司"}	2026-05-13 06:14:00.702	2026-05-13 06:45:40.6
COMPANY_ADDR	{"en": "", "id": "COMPANY_ADDR", "zh": ""}	2026-05-13 06:14:00.698	2026-05-13 06:45:40.6
COMPANY_EMAIL	{"en": "", "id": "COMPANY_EMAIL", "zh": "123456@heovose.com"}	2026-05-13 06:14:01.242	2026-05-13 06:45:40.978
COOKIE_CONSENT_ACCEPT	{"en": "Accept", "id": "Terima", "vi": "Chấp nhận", "zh": "接受"}	2026-05-13 09:20:14.304	2026-05-13 09:20:14.304
COOKIE_CONSENT_PRIVACY	{"en": "Privacy Policy", "id": "Kebijakan Privasi", "vi": "Chính sách bảo mật", "zh": "隐私政策"}	2026-05-13 09:20:14.308	2026-05-13 09:20:14.308
psv_PROD_KIOSK_0505_E0XK_3_3	{"en": "1 × Power Port\\n1 × High-Definition Multimedia Interface\\n1 × VGA/COM Port\\n1 × LAN Port\\n4 × USB Ports\\n1 × Audio Output\\n1 × Microphone Input", "id": "1 × Port Daya\\n1 × Port Multimedia HD\\n1 × VGA (COM)\\n1 × LAN\\n4 × USB\\n1 × Keluaran Audio\\n1 × Masukan Mikrofon", "jp": "1 × パワーポート\\n1 × 高解像度マルチメディアインターフェース\\n1 × VGA/COMポート\\n1 × LANポート\\n4 × USBポート\\n1 × オーディオ出力\\n1 × マイク入力", "zh": "1 × 电源端口\\n1 × 高清多媒体接口\\n1 × VGA(COM)\\n1 × LAN\\n4 × USB\\n1 × 音频输出\\n1 × 麦克风输入"}	2026-05-05 05:09:56.118	2026-05-15 07:45:44.664
MAP_LOC_LOC_1778547657316_ADDR	{"en": "No. 28, Sanle East Road, Shunjiang Community, Beijiao Town, Shunde District, Foshan City, Guangdong Province", "zh": "广东省佛山市顺德区北滘镇顺江社区三乐东路28号"}	2026-05-12 01:00:57.173	2026-05-15 09:03:38.038
cat_desc_CORE	{"en": "Motherboard, Memory, CPU, Hard Drive, Graphics Card", "id": "Motherboard, Memori (RAM), Prosesor (CPU), Hard Drive, Kartu Grafis", "zh": "主板、内存、CPU、硬盘、显卡"}	2026-05-05 02:11:57.117	2026-05-15 06:54:20.479
\.


--
-- Data for Name: MapLocation; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."MapLocation" (id, type, "titleZh", "titleEn", "addressZh", "addressEn", "descZh", "descEn", "imageUrl", "posTop", "posLeft", "homepageId", "addressTextId", "descTextId", "titleTextId", "order") FROM stdin;
loc_1778548544943	Factory	小尺寸电脑设备工厂		广东省佛山市顺德区龙江镇新华西村华宝东路2号万洋万众园				heovose-assets/uploads/f3ce0bc4-6db5-45b2-83d7-6409b16f2a37.jpg	50%	50%	map	MAP_LOC_LOC_1778548544943_ADDR	MAP_LOC_LOC_1778548544943_DESC	MAP_LOC_LOC_1778548544943_TITLE	0
loc_1778547657316	Factory	大尺寸及商显生产工厂	Large-scale manufacturing facilities for large-sized products and commercial displays	广东省佛山市顺德区北滘镇顺江社区三乐东路28号	No. 28, Sanle East Road, Shunjiang Community, Beijiao Town, Shunde District, Foshan City, Guangdong Province			http://localhost:9000/heovose-assets/uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	50%	50%	map	MAP_LOC_LOC_1778547657316_ADDR	MAP_LOC_LOC_1778547657316_DESC	MAP_LOC_LOC_1778547657316_TITLE	1
loc_1778548173311	R&D	5123123	12312312124	125121241	123123	25121321251212	512512512	http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg	50%	50%	map	MAP_LOC_LOC_1778548173311_ADDR	MAP_LOC_LOC_1778548173311_DESC	MAP_LOC_LOC_1778548173311_TITLE	4
loc_debug_1	Factory	Debug Factory	Debug Factory En	Debug Addr	Debug Addr En	Debug Desc	Debug Desc En	http://localhost:9000/heovose-assets/uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg	10%	20%	map	MAP_LOC_LOC_DEBUG_1_ADDR	MAP_LOC_LOC_DEBUG_1_DESC	MAP_LOC_LOC_DEBUG_1_TITLE	3
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."Product" (id, status, "nameTextId", "categoryId", "advantageTextIds", "createdAt", "descriptionTextId", "enabledLanguages", "galleryImageUrls", "localizedDetails", "mainImageUrl", "specGroups", "updatedAt", "galleryImageBrightnesses", "mainImageBrightness") FROM stdin;
PROD_MONITOR_0504_FIA9	published	prod_name_PROD_MONITOR_0504_FIA9	LED	\N	2026-05-04 07:15:13.105	prod_desc_PROD_MONITOR_0504_FIA9	{zh,en,id}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/37d8a977-98fc-46ac-8437-cd80d1dfb965.jpg	[]	2026-05-08 07:15:23.271	\N	160.5970128436285
cmoibfi320008uknuhbf1oyi0	published	prod_name_cmoibfi320008uknuhbf1oyi0	NOTEBOOK	\N	2026-04-28 07:39:36.398	prod_desc_cmoibfi320008uknuhbf1oyi0	{zh,id,en}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	[]	2026-05-08 07:15:23.434	\N	207.9415051799249
cmoibfi320007uknu4dcvlfch	published	prod_name_cmoibfi320007uknu4dcvlfch	MINIPC	\N	2026-04-28 07:39:36.398	prod_desc_cmoibfi320007uknu4dcvlfch	{zh,en,id}	{}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/2e2479d4-e456-4444-b3f9-7f47c1d1c877.jpg	[]	2026-05-08 07:15:23.56	\N	232.4326262626262
PROD_KIOSK_0505_E0XK	published	prod_name_PROD_KIOSK_0505_E0XK	KIOSK	\N	2026-05-05 05:09:56.611	prod_desc_PROD_KIOSK_0505_E0XK	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg,http://localhost:9000/heovose-assets/uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg,http://localhost:9000/heovose-assets/uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg,http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg}	{"en": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">Tutoring fee</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">Tutoring fee Adolf</strong></b></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">fa place is short hair short hair</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><img src=\\"http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg\\" alt=\\"Product image\\" width=\\"auto\\" height=\\"auto\\"></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">I</span></p>", "zh": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">辅导费</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">辅导费阿道夫</strong></b></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">fa地方是短发短发</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><img src=\\"http://localhost:9000/heovose-assets/uploads/614a66c7-acd1-48db-a0d9-c764f2f35617.jpg\\" alt=\\"Product image\\" width=\\"auto\\" height=\\"auto\\"></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">我</span></p>"}	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	[{"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_0_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_2"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_3", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_3"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_4", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_4"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_5", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_5"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_6", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_6"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_7", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_7"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_8", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_8"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_9", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_9"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_0_10", "valueId": "psv_PROD_KIOSK_0505_E0XK_0_10"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_0"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_1_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_1_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_1_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_1_2"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_1"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_2_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_2_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_2_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_2_1"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_2"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_3_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_2"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_3_3", "valueId": "psv_PROD_KIOSK_0505_E0XK_3_3"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_3"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_E0XK_4_0", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_0"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_4_1", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_1"}, {"labelId": "psl_PROD_KIOSK_0505_E0XK_4_2", "valueId": "psv_PROD_KIOSK_0505_E0XK_4_2"}], "titleId": "psg_PROD_KIOSK_0505_E0XK_4"}]	2026-05-08 07:15:26.273	{127.1303367640249,169.0218852816004,118.892306244876,117.1303978077119}	207.9415051799249
PROD_KIOSK_0505_95WB	published	prod_name_PROD_KIOSK_0505_95WB	KIOSK	\N	2026-05-05 05:20:19.018	prod_desc_PROD_KIOSK_0505_95WB	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/be56ed65-5e25-443a-8775-b54b59ecebae.jpg,http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg,http://localhost:9000/heovose-assets/uploads/85d4b221-af4a-4f81-8e4b-fcc73c3eb6a2.jpg,http://localhost:9000/heovose-assets/uploads/e30c9cfe-d6c1-41d3-a81c-7a84b96849d6.jpg,http://localhost:9000/heovose-assets/uploads/7986eb81-e9f3-4887-a764-169dcfe6eedd.jpg}	{"en": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><br></p>", "zh": ""}	http://localhost:9000/heovose-assets/uploads/4a74aae7-85aa-41e9-82f2-f8765d69719c.jpg	[{"items": [{"labelId": "psl_PROD_KIOSK_0505_95WB_0_0", "valueId": "psv_PROD_KIOSK_0505_95WB_0_0"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_1", "valueId": "psv_PROD_KIOSK_0505_95WB_0_1"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_2", "valueId": "psv_PROD_KIOSK_0505_95WB_0_2"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_3", "valueId": "psv_PROD_KIOSK_0505_95WB_0_3"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_4", "valueId": "psv_PROD_KIOSK_0505_95WB_0_4"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_0_5", "valueId": "psv_PROD_KIOSK_0505_95WB_0_5"}], "titleId": "psg_PROD_KIOSK_0505_95WB_0"}, {"items": [{"labelId": "psl_PROD_KIOSK_0505_95WB_1_0", "valueId": "psv_PROD_KIOSK_0505_95WB_1_0"}, {"labelId": "psl_PROD_KIOSK_0505_95WB_1_1", "valueId": "psv_PROD_KIOSK_0505_95WB_1_1"}], "titleId": "psg_PROD_KIOSK_0505_95WB_1"}]	2026-05-08 07:15:27.061	{230.9062916267121,241.891355275887,243.0144285677279,240.2653810094099,245.5979201888512}	228.4073890677427
PROD_AIO_0504_987C	published	prod_name_PROD_AIO_0504_987C	AIO	\N	2026-05-04 06:23:07.527	prod_desc_PROD_AIO_0504_987C	{zh,en,id}	{http://localhost:9000/heovose-assets/uploads/7dd3944b-9973-4e65-9649-353579cf4661.jpg,http://localhost:9000/heovose-assets/uploads/139f91d7-1cd2-448f-8461-d1b3d6251774.jpg,http://localhost:9000/heovose-assets/uploads/3eb25a8d-676e-404e-beea-6fbf69428e08.jpg,http://localhost:9000/heovose-assets/uploads/d967accc-5a8f-4b93-9976-bec5e24060f8.jpg,http://localhost:9000/heovose-assets/uploads/ba19c0be-1667-47cb-a031-e5e4e8751118.jpg,http://localhost:9000/heovose-assets/uploads/4eb0f28d-4c9a-4c38-a03c-7bef304908cf.jpg,http://localhost:9000/heovose-assets/uploads/15229520-358f-44a7-a5b7-d28cc552a89b.jpg}	{"en": "", "zh": ""}	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	[{"items": [{"labelId": "psl_PROD_AIO_0504_987C_0_0", "valueId": "psv_PROD_AIO_0504_987C_0_0"}, {"labelId": "psl_PROD_AIO_0504_987C_0_1", "valueId": "psv_PROD_AIO_0504_987C_0_1"}, {"labelId": "psl_PROD_AIO_0504_987C_0_2", "valueId": "psv_PROD_AIO_0504_987C_0_2"}, {"labelId": "psl_PROD_AIO_0504_987C_0_3", "valueId": "psv_PROD_AIO_0504_987C_0_3"}, {"labelId": "psl_PROD_AIO_0504_987C_0_4", "valueId": "psv_PROD_AIO_0504_987C_0_4"}, {"labelId": "psl_PROD_AIO_0504_987C_0_5", "valueId": "psv_PROD_AIO_0504_987C_0_5"}, {"labelId": "psl_PROD_AIO_0504_987C_0_6", "valueId": "psv_PROD_AIO_0504_987C_0_6"}, {"labelId": "psl_PROD_AIO_0504_987C_0_7", "valueId": "psv_PROD_AIO_0504_987C_0_7"}, {"labelId": "psl_PROD_AIO_0504_987C_0_8", "valueId": "psv_PROD_AIO_0504_987C_0_8"}, {"labelId": "psl_PROD_AIO_0504_987C_0_9", "valueId": "psv_PROD_AIO_0504_987C_0_9"}, {"labelId": "psl_PROD_AIO_0504_987C_0_10", "valueId": "psv_PROD_AIO_0504_987C_0_10"}], "titleId": "psg_PROD_AIO_0504_987C_0"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_1_0", "valueId": "psv_PROD_AIO_0504_987C_1_0"}, {"labelId": "psl_PROD_AIO_0504_987C_1_1", "valueId": "psv_PROD_AIO_0504_987C_1_1"}, {"labelId": "psl_PROD_AIO_0504_987C_1_2", "valueId": "psv_PROD_AIO_0504_987C_1_2"}], "titleId": "psg_PROD_AIO_0504_987C_1"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_2_0", "valueId": "psv_PROD_AIO_0504_987C_2_0"}, {"labelId": "psl_PROD_AIO_0504_987C_2_1", "valueId": "psv_PROD_AIO_0504_987C_2_1"}], "titleId": "psg_PROD_AIO_0504_987C_2"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_3_0", "valueId": "psv_PROD_AIO_0504_987C_3_0"}, {"labelId": "psl_PROD_AIO_0504_987C_3_1", "valueId": "psv_PROD_AIO_0504_987C_3_1"}, {"labelId": "psl_PROD_AIO_0504_987C_3_2", "valueId": "psv_PROD_AIO_0504_987C_3_2"}, {"labelId": "psl_PROD_AIO_0504_987C_3_3", "valueId": "psv_PROD_AIO_0504_987C_3_3"}], "titleId": "psg_PROD_AIO_0504_987C_3"}, {"items": [{"labelId": "psl_PROD_AIO_0504_987C_4_0", "valueId": "psv_PROD_AIO_0504_987C_4_0"}, {"labelId": "psl_PROD_AIO_0504_987C_4_1", "valueId": "psv_PROD_AIO_0504_987C_4_1"}, {"labelId": "psl_PROD_AIO_0504_987C_4_2", "valueId": "psv_PROD_AIO_0504_987C_4_2"}], "titleId": "psg_PROD_AIO_0504_987C_4"}]	2026-05-08 07:15:24.863	{238.6865701398756,236.5291356649274,223.6047683049831,235.1297905471962,236.4127034621336,242.921940413837,245.0097957943053}	200.6740637832585
PROD_ESSENTIALS_0514_1I7H	published	prod_name_PROD_ESSENTIALS_0514_1I7H	ESSENTIALS	\N	2026-05-14 03:55:15.331	prod_desc_PROD_ESSENTIALS_0514_1I7H	{zh,en}	{}	{"en": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><br></p>", "zh": "<p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><span style=\\"white-space: pre-wrap;\\">已经通过原子操作重写了&nbsp;</span><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><span class=\\"bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">translate-client.ts</span></code><span style=\\"white-space: pre-wrap;\\">。</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p><table class=\\"editor-table\\"><colgroup><col><col><col></colgroup><tbody><tr class=\\"editor-table-row\\"><th class=\\"editor-table-cell editor-table-cell-header\\" style=\\"width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">富文本深度保护模式</strong></b></p></th><th class=\\"editor-table-cell editor-table-cell-header\\" style=\\"width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">现在的代码会自动识别富文本（以&nbsp;</span><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><span class=\\"bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">{</span></code><span style=\\"white-space: pre-wrap;\\">&nbsp;开头但不是规格</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">&nbsp;</strong></b><b><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><strong class=\\"font-bold bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">text</strong></code></b><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">&nbsp;字段中的可见文字”</strong></b><span style=\\"white-space: pre-wrap;\\">。</span></p></th><th class=\\"editor-table-cell editor-table-cell-header\\" style=\\"width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><br></p></th></tr><tr class=\\"editor-table-row\\"><th class=\\"editor-table-cell editor-table-cell-header\\" style=\\"width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><span style=\\"white-space: pre-wrap;\\">123</span></p></th><td class=\\"editor-table-cell\\" style=\\"width: 75px; border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><span style=\\"white-space: pre-wrap;\\">4444</span></p></td><td class=\\"editor-table-cell\\" style=\\"width: 75px; border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p></td></tr><tr class=\\"editor-table-row\\"><th class=\\"editor-table-cell editor-table-cell-header\\" style=\\"width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\"><br></p></th><td class=\\"editor-table-cell\\" style=\\"width: 75px; border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p></td><td class=\\"editor-table-cell\\" style=\\"width: 75px; border: 1px solid black; vertical-align: top; text-align: start;\\"><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p></td></tr></tbody></table><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p><h3 class=\\"text-xl font-headline font-bold text-[#36578D] mb-4 mt-6\\" style=\\"text-align: start;\\"><span style=\\"white-space: pre-wrap;\\">为什么这次详情页翻译会恢复正常：</span></h3><ol class=\\"list-decimal pl-8 mb-4 space-y-1\\"><li value=\\"1\\" class=\\"text-[12px] text-slate-600\\"><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">富文本深度保护模式</strong></b><span style=\\"white-space: pre-wrap;\\">： 现在的代码会自动识别富文本（以&nbsp;</span><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><span class=\\"bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">{</span></code><span style=\\"white-space: pre-wrap;\\">&nbsp;开头但不是规格表格式）。它会给 AI 发送最高优先级的指令：</span><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">“禁止修改 JSON 结构，只准翻译&nbsp;</strong></b><b><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><strong class=\\"font-bold bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">text</strong></code></b><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">&nbsp;字段中的可见文字”</strong></b><span style=\\"white-space: pre-wrap;\\">。</span></li><li value=\\"2\\" class=\\"text-[12px] text-slate-600\\"><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">消除误判</strong></b><span style=\\"white-space: pre-wrap;\\">： 以前只要看到&nbsp;</span><code spellcheck=\\"false\\" style=\\"white-space: pre-wrap;\\"><span class=\\"bg-slate-100 px-1 rounded font-mono text-[11px] text-[#5F33CC]\\">{</span></code><span style=\\"white-space: pre-wrap;\\">&nbsp;就把它当成“坐标任务”，导致详情内容被 AI 强制重组成了一个错误的 JSON。</span></li><li value=\\"3\\" class=\\"text-[12px] text-slate-600\\"><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">格式保持</strong></b><span style=\\"white-space: pre-wrap;\\">： 解析器现在会完整提取 AI 返回的 JSON 树，并将其原封不动地交还给 Tiptap 编辑器。</span></li></ol><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><b><strong class=\\"font-bold\\" style=\\"white-space: pre-wrap;\\">请您再次点击详情介绍里的“智译”。</strong></b><span style=\\"white-space: pre-wrap;\\">&nbsp;</span></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><img src=\\"http://172.25.85.178:9002/admin/products/heovose-assets/uploads/76f7a0a4-ace3-4f66-892e-649defc7b0aa.svg\\" alt=\\"Product image\\" width=\\"auto\\" height=\\"auto\\"></p><p class=\\"mb-4 text-[12px] leading-relaxed text-slate-600 font-body\\" style=\\"text-align: start;\\"><br></p>"}		[]	2026-05-15 05:46:27.364	\N	\N
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."ProductCategory" (id, slug, "thumbnailImageUrl", "parentId", "nameTextId", "descriptionTextId", "order", "thumbnailBrightness") FROM stdin;
WHITEBOARD	whiteboard		PROJECT	cat_name_WHITEBOARD	cat_desc_WHITEBOARD	0	\N
CORE	core		WHOLESALE	cat_name_CORE	cat_desc_CORE	1	\N
MONITOR	monitor		WHOLESALE	cat_name_MONITOR	cat_desc_MONITOR	0	\N
ESSENTIALS	essentials		WHOLESALE	cat_name_ESSENTIALS	cat_desc_ESSENTIALS	0	\N
KIOSK	kiosk		PROJECT	cat_name_KIOSK	cat_desc_KIOSK	0	\N
INDUSTRIAL	industrial		PROJECT	cat_name_INDUSTRIAL	cat_desc_INDUSTRIAL	0	\N
LED	led		PROJECT	cat_name_LED	cat_desc_LED	0	\N
SHOWROOM	showroom		PROJECT	cat_name_SHOWROOM	cat_desc_SHOWROOM	0	\N
WHOLESALE	wholesale	http://localhost:9000/heovose-assets/uploads/6ee490d1-e5e8-4125-b5bf-ec76af05f192.jpeg	\N	cat_name_WHOLESALE	cat_desc_WHOLESALE	-1	145.3545043162868
MINIPC	minipc	http://localhost:9000/heovose-assets/uploads/c8eb3f01-a1ab-484f-b7f6-c2036c568fe3.jpg	WHOLESALE	cat_name_MINIPC	cat_desc_MINIPC	0	241.891355275887
AIO	aio	http://localhost:9000/heovose-assets/uploads/1d5e2af2-ef38-43a7-8d69-19644b36c16d.jpg	WHOLESALE	cat_name_AIO	cat_desc_AIO	-1	200.6740637832585
PROJECT	project	http://localhost:9000/heovose-assets/uploads/c7c4117f-144c-437b-894f-b2081d046560.jpg	\N	cat_name_PROJECT	cat_desc_PROJECT	0	98.08732214425595
NOTEBOOK	notebook	http://localhost:9000/heovose-assets/uploads/a91c1517-9c44-45f5-9aad-73c33f2be500.jpg	WHOLESALE	cat_name_NOTEBOOK	cat_desc_NOTEBOOK	0	207.9415051799249
\.


--
-- Data for Name: ProductionStep; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."ProductionStep" (id, "order", "titleZh", "titleEn", "descZh", "descEn", "imageUrls", brightnesses, "descriptionTextId", "titleTextId") FROM stdin;
step_1778201715793	9	装运前检验	Pre-Shipment Inspection	产品出厂前的最终质量检验。	Final quality assurance before products leave the facility.	{http://localhost:9000/heovose-assets/uploads/e7c66841-5309-43eb-abb3-aea7f8b64195.jpg,http://localhost:9000/heovose-assets/uploads/974db4dd-3375-4a63-97e6-c0d3f7f7c394.jpg}	{161.7050810658425,116.3104274182851}	process_step_step_1778201715793_desc	process_step_step_1778201715793_title
step_1778203371049	11	仓储	Warehousing	发货前的产品存储和库存管理。	Product storage and inventory management before shipment.	{http://localhost:9000/heovose-assets/uploads/feffb430-8e05-4d04-8b06-04e9b1711eaf.jpg,http://localhost:9000/heovose-assets/uploads/b9f5d5c4-7465-4e9f-90df-27b326f1f3f3.jpg}	{153.5070706786463,169.0218852816004}	process_step_step_1778203371049_desc	process_step_step_1778203371049_title
step_1778203386487	12	运输	Shipment	安全包装，全球配送，服务全球客户。	Secure packaging and global distribution to customers worldwide.	{http://localhost:9000/heovose-assets/uploads/35094d60-83d1-49de-b715-be94ae2459c4.jpg}	{127.1303367640249}	process_step_step_1778203386487_desc	process_step_step_1778203386487_title
step_1778201589249	2	采购	Procurement	从供应商处战略性地采购优质原材料。	Strategic sourcing and purchasing of high-quality raw materials from certified suppliers.	{http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg}	{105.1519853532395}	process_step_step_1778201589249_desc	process_step_step_1778201589249_title
step_1778201616561	3	供应商	Supplier	管理供应商关系并确保零部件及时交付。	Managing supplier relationships and ensuring timely delivery of components.	{http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg}	{105.1519853532395}	process_step_step_1778201616561_desc	process_step_step_1778201616561_title
step_1778201602533	4	接收	Receiving	接收并核对到货物料与采购订单是否相符。	Receiving and verifying incoming materials against purchase orders.	{http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg}	{105.1519853532395}	process_step_step_1778201602533_desc	process_step_step_1778201602533_title
cmoibfi3p000cuknuihdblv62	1	PMC规划	PMC Planning	生产和物料控制计划，以实现最佳资源配置和时间管理。	Production and material control planning for optimal resource allocation and timeline management.	{http://localhost:9000/heovose-assets/uploads/a86df304-a607-4ce1-8278-c45cdce9fddc.jpg}	{105.1519853532395}	process_step_cmoibfi3p000cuknuihdblv62_desc	process_step_cmoibfi3p000cuknuihdblv62_title
step_1778201650787	5	检查	Inspection	进行全面质量检验，确保所有材料均符合规格要求。	Comprehensive quality inspection ensuring all materials meet specifications.	{http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg}	{160.5970128436285}	process_step_step_1778201650787_desc	process_step_step_1778201650787_title
step_1778201661146	6	仓储	Warehousing	在温控设施中安全储存合格材料。	Secure storage of qualified materials in climate-controlled facilities.	{http://localhost:9000/heovose-assets/uploads/7062814e-9aa1-44bd-950c-0e1fc062cb2f.jpg}	{160.5970128436285}	process_step_step_1778201661146_desc	process_step_step_1778201661146_title
step_1778201672084	7	材料发行	Material Issuing	系统地申请物料并将其分发到生产线。	Systematic material requisition and distribution to production lines.	{http://localhost:9000/heovose-assets/uploads/22811330-25ce-4b07-b7c6-f8e9554668d1.jpg}	{117.1303978077119}	process_step_step_1778201672084_desc	process_step_step_1778201672084_title
step_1778201695830	8	制造	Manufacturing	采用先进设备和严格的质量控制流程进行精密制造。	Precision manufacturing using advanced equipment and strict quality protocols.	{http://localhost:9000/heovose-assets/uploads/a74635cb-af32-457a-b8c9-3fa19e8ffa07.jpg}	{118.892306244876}	process_step_step_1778201695830_desc	process_step_step_1778201695830_title
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
smtp_password	etbolxgipgjvhgge
smtp_secure	false
navigation	{"navbarMaterial":"level-03","showBorder":true,"showShadow":true,"megaMenuColumns":3,"megaMenuGap":12,"featuredText":"立即下载手册","featuredDownloadUrl":"/files/catalog_2026.pdf","featuredCoverUrl":"/image/catalog-placeholder.png"}
site	{"logoStandard":"heovose-assets/uploads/76f7a0a4-ace3-4f66-892e-649defc7b0aa.svg","logoInverted":"heovose-assets/uploads/01857b10-a02b-42c4-95b6-840634359db6.svg","favicon":"heovose-assets/uploads/47eb4eed-d322-4f14-a387-476d225c94b7.png","socialLinks":[{"platform":"YouTube","url":"http://www.heovose.com"},{"platform":"Facebook","url":"http://www.heovose.com"},{"platform":"LinkedIn","url":"http://www.heovose.com"}]}
languages	{"supportedLanguages":[{"code":"zh","label":"中文"},{"code":"en","label":"English"},{"code":"id","label":"Indonesian"},{"code":"jp","label":"日本語"}]}
inquiry_forward_email	1572865506qq@gmail.com
smtp_host	smtp.qq.com
smtp_port	587
smtp_user	1572865506@qq.com
ai	{"isEnabled":true,"providers":[{"type":"browser-local","isActive":false,"isPrimary":true,"model":"hunyuan-mt-7b","name":"本地HY-MT7B","apiKey":"12345","baseUrl":"http://localhost:1234/v1","id":"prov_1778729855166","lastTest":{"status":"success","latency":472,"timestamp":"2026-05-15T01:07:06.901Z"}},{"type":"local","isActive":true,"isPrimary":false,"model":"hunyuan-mt-7b","name":"HY-MT1.5","apiKey":"12345","baseUrl":"http://172.25.80.1:1234/v1","id":"prov_1778727320890","lastTest":{"status":"success","latency":629,"timestamp":"2026-05-15T07:52:33.830Z"}},{"type":"google","model":"gemini-2.5-flash","baseUrl":"http://192.168.1.190:1234/v1/models","name":"Gemini","id":"prov_1778726721927","isActive":false,"isPrimary":false,"apiKey":"AIzaSyCdor09jDPt3aKX-zE5FSSF4ZLblTvkcJ8","lastTest":{"status":"success","latency":1937,"timestamp":"2026-05-15T07:05:50.163Z"}}],"fallbackStrategy":"none","systemInstruction":"你是一位专业的工业硬件制造专家，擅长将复杂的计算机硬件规格（如一体机、迷你电脑、工业显示器）翻译成地道、专业的商务语言。请保持术语的准确性，并统一单位。"}
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

COPY public."User" (id, name, email, "emailVerified", image, password, role, "createdAt", "updatedAt", permissions, "lastSeen") FROM stdin;
cmp3pg7qu007quk3keeu406vd	Anthony	12345@heovose.com	\N	\N	$2b$10$sCbN4rNrp/8rBQfD..H/BOJxMwXL8JHuim9czY1E3b/cqPuBQSBUu	editor	2026-05-13 06:55:13.974	2026-05-14 03:35:23.59	["products_view", "products_edit", "categories_manage", "gallery_manage", "home_config", "map_manage", "cases_manage", "steps_manage", "nav_manage", "inquiries_view", "analytics_view", "heatmap_view", "inquiries_reply", "inquiries_manage"]	2026-05-14 03:35:23.58
cmoibfi230000uknuxbuglkp0	Admin User	admin@heovose.com	\N	\N	$2b$10$YpgPo2dhecCziS5OpYg1MukcgdBvn7huiEHFvbS20hnh748Kz24jq	superadmin	2026-04-28 07:39:36.361	2026-05-15 06:03:45.401	[]	2026-05-15 06:03:45.393
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: VisitorSession; Type: TABLE DATA; Schema: public; Owner: heovose
--

COPY public."VisitorSession" (id, "visitorId", ip, country, city, "userAgent", referrer, "createdAt", "lastPath", "updatedAt") FROM stdin;
sess_s8iyecsd0xb_1778633245089	vis_z386l2jsldo_1778633245088	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400		2026-05-13 00:47:25.777	/	2026-05-13 06:42:40.054
sess_kl7qarqfh5_1778636508194	vis_tzmzpf0mya_1778636508181	\N	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1		2026-05-13 01:41:50.754	/	2026-05-13 01:41:50.754
sess_0qggctx05ej8_1778657150750	vis_pszhalh0fip_1778657150749	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 07:25:50.342	/	2026-05-13 07:25:50.342
sess_sddpy9ni4u_1778664260185	vis_ifawu73m3z_1778664260185	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 09:24:21.458	/	2026-05-13 09:24:21.458
sess_lu8v8pfbpvr_1778719353774	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	http://172.25.85.178:9002/admin/inquiries	2026-05-14 00:42:34.277	/admin/settings/ai	2026-05-14 09:21:39.622
sess_pwpwxi3kg4q_1778657157296	vis_j5at2g85q3_1778657157296	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 07:25:57.087	/admin	2026-05-13 08:35:08.05
sess_i8ez3c5ktcp_1778661320414	vis_stjoz5mkax_1778661320413	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 08:35:20.278	/	2026-05-13 08:35:20.278
sess_r0krawi1bq_1778633713095	vis_zc48lfdvrml_1778633713094	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0		2026-05-13 00:55:12.343	/	2026-05-13 00:55:12.343
sess_f5l8687k2gk_1778661325878	vis_frsjmusw8j7_1778661325878	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 08:35:26.08	/admin	2026-05-13 08:35:37.468
sess_yqiejy75aqj_1778632761370	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	http://172.25.85.178:9002/	2026-05-13 00:39:23.964	/	2026-05-13 09:25:13.068
sess_7bt5913oswt_1778655406936	vis_se6y958w8hl_1778655406936	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 06:56:47.147	/	2026-05-13 06:56:47.147
sess_aoypdp8jmn_1778632764381	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 00:39:24.897	/design-system	2026-05-13 09:25:20.382
sess_wgmok0exs1i_1778655411453	vis_z8d1fcm3atj_1778655411452	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 06:56:51.863	/admin	2026-05-13 07:21:00.568
sess_ohyv172vena_1778719480073	vis_0adca4rh6qed_1778719480073	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36		2026-05-14 00:44:41.052	/admin/analytics	2026-05-14 01:24:50.848
sess_xtocm6aw9e_1778663559918	vis_z386l2jsldo_1778633245088	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400		2026-05-13 09:12:39.511	/products/PROD_AIO_0504_987C	2026-05-13 09:12:39.511
sess_t1t3b6ulx19_1778632761310	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	http://172.25.85.178:9002/admin/inquiries	2026-05-13 00:39:23.383	/admin/users	2026-05-13 09:27:21.013
sess_ge4hcbj8iee_1778656957764	vis_w6miqg2akzr_1778656957763	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0		2026-05-13 07:22:44.758	/	2026-05-13 07:24:30.803
sess_bguje8pxoi_1778664119473	vis_3c5mai0lxib_1778664119473	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 09:21:58.83	/	2026-05-13 09:23:07.44
sess_1z5au53aarxj_1778664204502	vis_b2y9cawkoil_1778664204501	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36		2026-05-13 09:23:25.57	/en	2026-05-13 09:23:25.57
sess_pwo94kq814r_1778719357446	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36		2026-05-14 00:42:38.847	/design-system	2026-05-14 00:42:38.847
sess_1dvfphm1s6z_1778729678451	vis_w6miqg2akzr_1778656957763	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0		2026-05-14 03:34:41.071	/admin/products/editor	2026-05-14 05:09:08.848
sess_yoszl2w9hg9_1778723812673	vis_sbe43oi2g8_1778723812672	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400	http://172.25.85.178:9002/	2026-05-14 01:56:52.471	/	2026-05-14 01:56:52.471
sess_0f4pnfokxib_1778719353876	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	http://172.25.85.178:9002/	2026-05-14 00:42:35.914	/	2026-05-14 03:10:35.429
sess_q8ozwfz707f_1778824168276	vis_uyiptkoxa5l_1778824168276	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36		2026-05-15 05:49:29.003	/	2026-05-15 05:55:13.874
sess_k7dyh8fxrdg_1778824572463	vis_ltx9ziz3yi_1778824572463	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36		2026-05-15 05:56:13.177	/	2026-05-15 05:56:13.177
sess_z531bofce1r_1778805488231	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	http://172.25.85.178:9002/admin/products/editor?id=PROD_ESSENTIALS_0514_1I7H	2026-05-15 00:38:06.839	/admin/settings	2026-05-15 09:21:43.318
sess_ars3axxhb3_1778805491781	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36		2026-05-15 00:38:11.453	/admin/products/editor	2026-05-15 07:37:24.08
sess_90aqoio1jn_1778806503284	vis_sbe43oi2g8_1778723812672	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 QQBrowser/21.0.8365.400	http://172.25.85.178:9002/	2026-05-15 00:55:03.496	/	2026-05-15 09:00:12.408
sess_12djgtb7yh9_1778835317027	vis_tzmzpf0mya_1778636508181	\N	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1		2026-05-15 08:55:18.537	/	2026-05-15 08:55:18.537
sess_o7rztcebcpi_1778825019802	vis_w6miqg2akzr_1778656957763	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0		2026-05-15 06:03:43.281	/admin/settings/ai	2026-05-15 07:52:24.27
sess_4u17tczk164_1778805490627	vis_k7vw8zmmt2o_1778576463246	\N	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	http://172.25.85.178:9002/products?line=wholesale	2026-05-15 00:38:08.683	/	2026-05-15 09:03:52.283
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
457ede1e-5a2a-44da-9ced-b5a8f168ed1c	ebf71310fc6630b6a4f392b10b5d81f61f6ab0fef73fe67060db0468d6aeab68	2026-05-07 00:48:43.541452+00	20260507004045_unify_localizations		\N	2026-05-07 00:48:43.541452+00	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (provider, "providerAccountId");


--
-- Name: AnalyticsEvent AnalyticsEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."AnalyticsEvent"
    ADD CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY (id);


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
-- Name: Inquiry Inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY (id);


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
-- Name: VisitorSession VisitorSession_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."VisitorSession"
    ADD CONSTRAINT "VisitorSession_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AnalyticsEvent_sessionId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "AnalyticsEvent_sessionId_idx" ON public."AnalyticsEvent" USING btree ("sessionId");


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
-- Name: VisitorSession_visitorId_idx; Type: INDEX; Schema: public; Owner: heovose
--

CREATE INDEX "VisitorSession_visitorId_idx" ON public."VisitorSession" USING btree ("visitorId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnalyticsEvent AnalyticsEvent_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: heovose
--

ALTER TABLE ONLY public."AnalyticsEvent"
    ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."VisitorSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict FO1gC0sjkgUFfb9DXlhNDe0PV3Q409XWJRdmaHhTZOc9hqGcyoeeaid5WvZgmvS

