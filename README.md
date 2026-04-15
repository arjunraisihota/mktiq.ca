# mktIQ

SEO-first Next.js real estate intelligence site generated from Ontario city JSON files.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Static generation for city and neighbourhood routes

## Data Location

Preferred folder:

- data/cities/*.json

Current fallback folders supported by code:

- output/*.json
- ../output/*.json

This allows immediate use with scraped files already present in the parent workspace output folder.

## Run

1. npm install
2. npm run sync:data
3. npm run dev
4. Open http://localhost:3000

## Build

- npm run build:with-data
- npm run start

`build:with-data` first syncs JSON city files into `data/cities` and then runs a production build.

## Route Pattern

- / (homepage)
- /{city}
- /{city}/{neighbourhood}

Examples:

- /oakville
- /oakville/bronte-east
- /milton

## SEO Features

- Per-route metadata generation
- Canonical-aware route design
- Breadcrumb schema
- FAQ schema
- Organization schema
- Dynamic sitemap and robots routes
