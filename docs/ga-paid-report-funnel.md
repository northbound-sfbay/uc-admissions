# GA Paid Report Funnel Checklist

Use this when checking whether users are interested in paid reports.

## Main Events

Check `Reports > Engagement > Events`.

- `report_preview_open`: user opened a paid report preview.
- `report_cta_click`: user clicked the paid-report CTA inside the preview.
- `lead_or_capture_click`: broader lead/capture click; useful but less specific.
- `comparison_intent`: comparison-tool activity; useful upstream intent, not purchase intent.
- `school_page_view`: school-page engagement before report interest.

## Event Parameters / Custom Dimensions

Open an event, then inspect these dimensions if available:

- `report_type`: `single_school` or `comparison`.
- `price`: expected paid-report price, such as `19` or `39`.
- `school_slug`: which school drove interest.
- `school_name`: readable school name.
- `school_count`: comparison report school count.
- `source`: CTA/source location if available.

If these do not show in standard reports, check `Admin > Data display > Custom definitions` and confirm they are registered as event-scoped custom dimensions.

## Core Ratios

Track these manually at first:

- Preview open rate = `report_preview_open users / school_page_view users`.
- CTA click rate = `report_cta_click users / report_preview_open users`.
- Total paid-report interest rate = `report_cta_click users / total users`.
- Comparison interest = `comparison_intent users / total users`.

Early interpretation:

- `<1%` CTA click rate from preview: offer or positioning is weak.
- `1-3%`: some interest, needs better copy/product proof.
- `3-8%`: promising fake-door signal.
- `8%+`: strong, but check whether clicks are internal/test traffic.

## GA Screens To Use

- `Reports > Engagement > Events`: event counts and users.
- `Reports > Engagement > Pages and screens`: filter page path contains `/report/`.
- `Reports > Acquisition > Traffic acquisition`: check whether interested users came from organic, direct, referral, etc.
- `Explore > Free form`: best place to break down events by `report_type`, `price`, and `school_slug`.
- `Reports > Realtime` or `DebugView`: use only to verify events are firing, not to judge demand.

## Minimum Readout

For each check-in, write down:

- Date range.
- Total users.
- `school_page_view` users.
- `report_preview_open` users.
- `report_cta_click` users.
- Top `school_slug` values for `report_cta_click`.
- `report_type` split: single-school vs comparison.
- Traffic source for users who clicked the CTA.

## Caveats

- Exclude your own testing if possible.
- Use users, not only event count; repeated clicks can inflate event count.
- Do not judge product demand from `page_view` alone.
- Treat the first few dozen users as directional only.
