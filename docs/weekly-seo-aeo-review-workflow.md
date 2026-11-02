# Weekly search and ad-revenue review

Updated November 2, 2026. Useful reading and ad revenue are the business objectives. This workflow supersedes the earlier weekly-article quota and paid-report conversion plan. Keep private account metrics in the locally excluded `docs/growth-reviews/` directory, never in this public repository.

## Repeatable growth pattern

1. Find a real question in Search Console page/query pairs. Prefer relevant queries with impressions and positions 6–30. Inspect the existing destination first.
2. Improve that page when it already answers the intent. Publish a separate analysis only for a distinct question, original calculation and useful next action.
3. Explain the finding with comparable groups, counts, denominators, years, sources and limitations. Link to the relevant school, campus, county or comparison tool. Use normal navigation between real pages; never turn filters into artificial page views.
4. Link from the visible Insights hub and relevant existing pages. Verify source calculations, mobile reading, events, metadata, canonical and sitemap before launch.
5. Review at 7, 28 and 90 days. Expand patterns that earn relevant discovery and useful onward reading. Revise weak pages before increasing volume.

## Cadence and expense discipline

The scheduled review runs Mondays at 10 a.m. America/Los_Angeles. The run falling on calendar day 3–9 also includes the previous month's business review. Each review recommends one existing-page improvement and, if justified, one next brief. Reviews do not authorize publishing, outreach, purchases or account changes.

After the initial three-story release, cap new analyses at two per month during the 90-day pilot. There is no minimum quota. Record hours and incremental cost privately. Prefer useful public resources and separately approved sharing over buying traffic to earn display-ad revenue.

## Inputs and definitions

- Journey: revenue, page views, sessions, impressions, page RPM and session RPM. State exact dates and traffic definition.
- GA: use the single reporting property in the private runbook. Inspect organic and AI landing sessions, engagement, device mix, return visits and actual onward page loads. `article_cta_click`, `school_search_select`, `internal_navigation` and `comparison_intent` measure intent; a click is not a completed second page. Since the November release, `school_search_complete` requires loaded tool data or a confirmed profile arrival; compare pre-release and post-release counts cautiously.
- Search Console: queries and destinations, clicks, impressions, CTR, position, country and device. Distinguish adjacent-topic hypotheses from proven exact-query demand.
- Site: publication date, cohort URLs, changed links, canonical/sitemap, data releases, rendering/ad regressions and concurrent deployments.

Page RPM = Journey revenue / Journey page views × 1,000. Session RPM = Journey revenue / Journey sessions × 1,000. Views/session = Journey page views / Journey sessions. Never mix sources, periods, or monetizable-only and all-traffic denominators.

Calculate article-to-school progression only with an ordered same-session funnel and the same eligible landing-session denominator. Missing reports or custom dimensions are unavailable, not zero. Unrelated event-user ratios are not conversion rates.

## Readouts

| Readout | Question | Action |
|---|---|---|
| 7 days | Do pages render, link and track correctly? Are discovery signals present? | Repair technical problems; avoid verdicts from tiny samples. |
| 28 days | Which questions attract relevant readers who continue into school/campus data? | Compare with the preceding period and existing-page cohort. Improve weak answers, snippets or next steps; choose the next distinct brief from evidence. |
| 90 days | Did rolling-30-day traffic and revenue targets in the private runbook materialize? | Keep, revise or stop each pattern; set the next target from acquisition, depth and page RPM. |

Weekly: seven fully reported days versus the preceding seven, plus a separate rolling-30-day scorecard. Monthly: full calendar months plus per-day figures. Account for admissions seasonality, source/device mix, lag, small samples and concurrent Texas changes. This bundled release is not a randomized experiment.

## Decision rules

- Relevant query at positions 6–15 with a suitable page: strengthen its direct answer and contextual links first.
- Distinct question with original data: brief the query evidence, audience, finding, chart, cohort rules, links, caveats and measurement dates.
- Relevant landings but weak onward reading: improve the next action and mobile placement. Assess engagement and revenue/session together.
- Impressions but low CTR: inspect intent and position before testing an accurate title/description. No unsupported years or claims.
- Little discovery after 28 days: check indexability and links, then reassess demand. Allow the 90-day window rather than mass-producing variants.
- Overlap with a stronger page: consolidate the answer or improve links instead of creating competing thin pages.

## Weekly output

Save a private note with exact windows, actuals versus target, acquisition/depth/yield diagnosis, cohort results, limitations and three next actions. Each action needs a specific page, evidence, proposed change and review date. Give mature experiments a keep/revise/stop decision. Maintain the public calendar using publication facts only.

## November navigation measurement

- `school_profile_open`: a real school profile mounted after a matching same-tab link/search, within five minutes, with a matching internal referrer. Direct arrivals, reloads, new tabs, blocked storage/referrers, and mismatched destinations do not qualify. This conservative event can undercount; it does not replace `page_view` or `school_page_view`.
- `school_search_complete`: selected data loaded in the tool (`destination=interactive_tool`) or quick search reached its profile (`destination=school_profile`). Quick-finder clicks separately emit `school_search_select`.
- `comparison_loaded`: two or more selected histories loaded, excluding the untouched example. Shared explicit comparisons qualify. Repeated filter changes do not produce another completion; a changed school set does. This measures loaded data, not chart paint or time spent reading.
- Use `interaction_source` for UI placement; the reserved acquisition-like `source` parameter is no longer sent by search. Keep both established analytics destinations until there is a separate retention decision.

For an article-to-school rate, restrict to sessions landing on the selected `/insights/` cohort, require the initial article `page_view` before `school_profile_open`, match its `origin_page` to that landing article, and use the same GA session identifier. Count each qualifying session once. Numerator and denominator must share dates, device/source filters, consent availability and reporting property. A user-scoped funnel spanning multiple sessions is not this rate. If the reporting interface cannot enforce the session boundary or expose the required parameter, report the rate as unavailable and list event counts separately. Do not infer the rate from a ratio of event totals or fabricate a historical baseline for new events.

Check the main sitemap and focused `/insights-sitemap.xml` processing independently. Submission acceptance is not crawl or indexing success. The focused sitemap preserves the existing main URL inventory and makes article discovery easier to diagnose.
