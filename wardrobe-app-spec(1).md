# Sustainable Wardrobe App: Project Spec

Paste this at the start of every AI coding session.

## Purpose
A web app (PWA, later wrapped with Capacitor for Google Play) that helps people own fewer, better-fitting clothes and keep them longer. The core loop is:

**Catalog → Gap analysis → Care and repair → Sustainable replacement**

## Stack
- Next.js (React) + Tailwind
- Supabase: Postgres, Auth, Storage (photos)
- PWA: manifest + service worker, offline-friendly catalog
- Compress photos client-side before upload (max ~1200px, JPEG ~0.8)

### Prototype authentication setup
The static prototype uses Supabase Auth for sign-up, sign-in, sign-out, and password recovery. Set `THRIFI_SUPABASE_URL` and `THRIFI_SUPABASE_ANON_KEY` in `auth-config.js` to the project's URL and public anon/publishable key; never put a `service_role` key in browser code. Allow the local and deployed app URLs in Supabase Auth's site URL and redirect URL settings. Closet content remains in browser storage and is separated by signed-in account; it is not synced to Supabase.

## Build order
1. Catalog + wear tracking (this spec's Phase 1)
2. Care and repair guides linked to fabric
3. Fit profile + brand size charts
4. Needs questionnaire + gap analysis
5. Sustainable replacement suggestions

## Data model

### profiles
| column | type | notes |
|---|---|---|
| id | uuid PK | = auth user id |
| climate | text | hot, temperate, cold, mixed |
| laundry_per_week | int | drives how many pieces are needed |
| dress_code | text | casual, smart_casual, formal |
| activities | text[] | hiking, gym, commuting, etc. |
| created_at | timestamptz | |

### items
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK profiles | row-level security: owner only |
| name | text | |
| category | text | tops, bottoms, dresses, outerwear, shoes, accessories |
| color | text | hex |
| brand_id | uuid FK brands, nullable | |
| size_label | text | as printed on the tag |
| fit_feedback | text | fits_well, runs_small, runs_large |
| condition | text | new, good, worn, needs_repair |
| source | text | new, secondhand, swapped, gifted |
| year_acquired | int | when it came to you |
| note | text | optional memory or story |
| review_status | text | love, needs_repair, doesnt_fit, ready_to_pass_on |
| last_checked_in | timestamptz | last mindful check-in |
| photo_url | text | Supabase Storage path |
| status | text | active, donated, sold, discarded |
| created_at | timestamptz | |

### item_fabrics (an item can be a blend)
| column | type | notes |
|---|---|---|
| item_id | uuid FK | |
| fabric_id | uuid FK | |
| percent | int | optional |

### fabrics
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | cotton, wool, denim, linen, synthetic, leather, silk |
| care_guide_id | uuid FK | links to care_guides |

### wear_logs
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| item_id | uuid FK | |
| worn_on | date | |
| feeling | text, nullable | great, fine, off |

Wear count = count of wear_logs rows. Last worn = latest worn_on.

### care_guides and repair_guides
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| fabric_id | uuid FK, nullable | |
| problem | text, nullable | e.g. missing_button, hole, stain, shrunk |
| body_md | text | markdown content |
| difficulty | text | easy, medium, tailor_recommended |

### brands
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| sustainability_notes | text | why it is vetted |
| url | text | |
| repair_program | bool | |
| secondhand_program | bool | |

### brand_size_charts (Phase 3)
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| brand_id | uuid FK | |
| garment_type | text | |
| size_label | text | |
| chest_cm, waist_cm, hip_cm, inseam_cm | numeric | store metric, convert for display |

### body_measurements (Phase 3, sensitive)
Per-user chest, waist, hips, inseam, shoulder, foot length in cm. Owner-only access, deletable in one tap.

## Key calculations
- **Time owned:** current year minus year_acquired ("With you 4 years")
- **Check-in due:** not worn or checked in for 60+ days, then ask "Still love it?" (keep, needs a fix, pass it on)
- **Surplus or gap (Phase 4):** target range per category from the questionnaire, minus owned active items per category
- **Replacement order (Phase 5):** repair, then borrow or swap, then secondhand, then new from a vetted brand

## Rules for the AI
- Keep one component per file and name things after the data model above.
- Never store secrets in client code. Use row-level security on every table.
- Do not store or display prices or money anywhere. Frame everything around care, use and reflection.
- Show empty states with a clear next action.
- Mobile-first layout, keyboard accessible, supports light and dark mode.
- Recommendations about size and need are estimates. Say so in the interface.
- Ask before changing the schema.

## Phase 1 acceptance checklist
- [ ] Sign up and log in
- [ ] Add, edit, remove an item with photo
- [ ] "Worn today" creates a wear log and offers a one-tap feeling
- [ ] Item list filters by category
- [ ] Stats: total pieces, pieces kept 3+ years, pieces not bought new, check-ins waiting
- [ ] Fabric shows a linked care tip
- [ ] Works as an installable PWA
