# Floza Static Content

Site content is separated from code (docs/05_DATA_MODEL.MD): adding a project, demo, or
service only requires editing the matching JSON file — no component changes.

| File               | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `projects.json`    | Portfolio projects (cards + case study source)   |
| `demos.json`       | Interactive demo listings                        |
| `services.json`    | Service offerings                                |
| `site.json`        | Site-wide config (contact details for footer + contact page) |

> Note: image paths in `projects.json` reference assets that will be added under
> `public/projects/` in a later phase.
