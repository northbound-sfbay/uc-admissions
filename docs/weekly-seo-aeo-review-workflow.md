# Weekly SEO/AEO Review Workflow

Use this once per week to decide what to publish, update, internally link, or measure for `collegeacceptance.info`.

## Goal

Find the highest-leverage search opportunities, especially queries where the site already has impressions, then turn them into tool-first articles, route pages, or internal-link improvements.

## Cadence

- Frequency: weekly.
- Suggested day: Monday or Tuesday.
- Lookback windows: last 7 days, last 28 days, and compare to previous period.
- Output: one short weekly note with actions for the next publishing cycle.

## Weekly Publish Schedule

- Monday: review Search Console and GA, then pick one topic.
- Tuesday: write the article brief using `docs/article-brief-template.md`.
- Wednesday: draft the article locally.
- Thursday: review data accuracy, SEO/AEO structure, internal links, and CTA tracking.
- Friday: publish, submit the URL in Search Console, and add the page to `docs/content-calendar.md`.

Default pace: one article or meaningful content update per week.

## Inputs

Google Search Console:

- Queries.
- Pages.
- Clicks.
- Impressions.
- CTR.
- Average position.
- Page/query pairs.

Google Analytics:

- Landing page users.
- Engagement time.
- Scroll and click events.
- `article_cta_click`.
- `comparison_intent`.
- `school_page_view`.
- `report_preview_open`.
- `report_cta_click`.

Site context:

- New pages published.
- Pages changed.
- Known SEO targets: `/`, `/uc-admission-rates`, school pages, feeder pages, county pages, future `/insights/` articles.

## Search Console Review

Check `Performance > Search results`.

Filters:

- Search type: Web.
- Date: last 28 days.
- Optional country: United States.

Questions to answer:

- Which queries have high impressions but low CTR?
- Which queries rank positions 6-15 and could move to page 1?
- Which queries rank positions 16-30 and need a dedicated article or stronger internal links?
- Which pages receive impressions for queries they are not designed to answer?
- Are broad queries such as `uc admission rates`, `uc acceptance rates`, or `ucla feeder schools` increasing?
- Are school-specific queries appearing for schools without strong pages or report previews?

Opportunity buckets:

- Improve snippet: position 1-5, low CTR.
- Add internal links: position 6-15, good page exists.
- Publish article: position 10-30, intent is informational.
- Build route page: repeated query pattern needs scalable page type.
- Ignore: irrelevant, unsupported, or too broad.

## GA Review

Check `Reports > Engagement > Pages and screens`.

Filters:

- Page path contains `/uc-admission-rates`, `/school/`, `/feeder-schools/`, `/county/`, and future `/insights/`.
- For article pages, segment traffic source = organic search when possible.

Questions to answer:

- Which landing pages bring engaged users?
- Which articles drive `article_cta_click`?
- Which pages create downstream `comparison_intent` or `school_page_view`?
- Which pages create `report_preview_open` or `report_cta_click`?
- Are users clicking from informational pages into the tool?
- Are there pages with traffic but weak engagement or no downstream action?

Key ratios:

- Article CTA rate = `article_cta_click users / article landing page users`.
- Tool intent rate = `comparison_intent users / landing page users`.
- School-page progression = `school_page_view users / landing page users`.
- Report preview rate = `report_preview_open users / landing page users`.
- Report CTA rate = `report_cta_click users / report_preview_open users`.

## Weekly Output Template

Date range:

Top wins:

- Query/page:
- What changed:
- Why it matters:

Top opportunities:

| Priority | Query | Page | Impressions | Clicks | CTR | Avg position | Action |
|---|---:|---:|---:|---:|---:|---:|---|
| P1 |  |  |  |  |  |  |  |
| P2 |  |  |  |  |  |  |  |
| P3 |  |  |  |  |  |  |  |

Publishing decision:

- New article to write:
- Existing page to update:
- Internal links to add:
- Page to monitor:

Conversion readout:

- Organic landing page users:
- `article_cta_click` users:
- `comparison_intent` users:
- `school_page_view` users:
- `report_preview_open` users:
- `report_cta_click` users:
- Notes:

Next actions:

- Action:
- Owner:
- Due:

## Decision Rules

- If a query has impressions and average position 6-15, first try improving title/meta/H1/internal links before writing a new article.
- If a query has impressions and average position 16-30 with clear informational intent, consider an article.
- If many queries follow the same pattern, consider a scalable page template instead of one-off articles.
- If an article gets traffic but no tool clicks, improve CTA placement and internal links before writing more similar articles.
- If an article ranks but overlaps with a product page, consolidate or repoint internal links to avoid cannibalization.

## Automation Later

When GA/Search Console API access is available, automate:

- Weekly export of GSC query/page rows.
- Weekly export of GA landing-page and event rows.
- Opportunity scoring.
- Draft brief generation for the top 3 article/update candidates.
