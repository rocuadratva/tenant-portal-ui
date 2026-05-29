# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tenant Property Management Portal — Claude Context

This is a Tenant Property Management Portal built for a single mixed-use property. It replaces heavily manual property management processes with a digital system. It serves as both a real operational tool and a freelance portfolio/pitch piece.

## Project Purpose
- Digitize tenant onboarding (replacing paper-based ID and info collection)
- Provide tenants a portal to view documents, receipts, and submit maintenance requests
- Give the property owner a structured backend (Notion) as the command center
- Automate payment receipts, Drive folder creation, and lease expiry reminders via n8n

## Stack
- **Frontend:** Plain HTML / CSS / JS — no frameworks
- **Backend:** n8n webhooks (hosted at https://n8n.srv1326537.hstgr.cloud)
- **Command center:** Notion (owner view)
- **Storage:** Google Drive (documents, receipts, IDs)
- **Notifications:** Gmail + Telegram

## GitHub
- **Repo:** https://github.com/rocuadratva/tenant-portal-ui
- All UI pushes go here. Init with `git init` in the project root if not already a repo.

## Folder Structure
```
Tenant Property Management/
├── CLAUDE.md                      ← You are here
├── .mcp.json                      ← n8n + Notion MCP servers
├── .claude/
│   ├── settings.json              ← Claude Code settings (skills, schema)
│   └── skills/
│       └── brainstorming/
│           └── SKILL.md           ← Brainstorming skill runbook
├── UI/                            ← All frontend pages
│   ├── CLAUDE.md                  ← UI design system reference
│   ├── index.html                 (login / access code entry)
│   ├── dashboard.html             (tenant home)
│   ├── onboarding.html            (first-time setup form)
│   ├── documents.html             (view lease + receipts)
│   ├── maintenance.html           (submit maintenance request)
│   ├── contact.html               (message the owner)
│   ├── css/style.css              (shared styles)
│   └── js/main.js                 (shared logic)
└── Backend/
    ├── workflows/                 (exported n8n JSON workflows)
    ├── templates/                 (receipt PDF + email templates)
    ├── _archive/                  (legacy/unused workflow files)
    └── env.example                (required environment variables)
```

## Notion Databases (already set up)
- **Tenants** — `collection://719fe5aa-f2f6-465d-b75c-1749dce3ab31`
- **Payments** — `collection://03e498b9-be22-4cb6-a059-e2d1d7f5f5b2`
- **Maintenance and Repair Request** — `collection://91bd3cc4-7fd6-4bb9-8a0d-85676e85b040`
- **Workers** — `collection://8b0e5d18-6df3-4a2b-bd28-b45323932d5b`
- All live under the **Property Maintenance System** page in Notion

## Portal Access Model
- Code-gated — tenants receive a unique access code tied to their unit
- No user accounts or passwords — just the access code

## Open Items (Blockers)
- **Drive folder ID** — `01b-tenant-onboarding.json` (n8n ID: `nmsXVYER7LZwNfh6`) has `TENANTS_DRIVE_FOLDER_ID_HERE` placeholder in the Google Drive upload node. Replace with the actual folder ID before testing onboarding.
- ~~**Workflow 08 not imported**~~ — **RESOLVED.** Workflow is live in n8n at ID `LTk2ivpWzzVbB6Y2`, active on `/webhook/new-tenant-registration`.
- **DEV NAV TOOLBAR** — `UI/index.html` lines 190–198 contain a hardcoded orange dev nav bar. Remove before any real tenant use or portfolio demo.
- **Demo button** — `UI/index.html:158` has a "Preview Demo" button that sets `accessCode = 'DEMO'` and redirects to `dashboard.html` without hitting n8n. This is intentional for demos but will show empty data unless a DEMO tenant record exists in Notion.

## Build Phases
| Phase | What | Status |
|-------|------|--------|
| 1 | Tenant Onboarding Form + n8n workflow | Done |
| 2 | Portal shell: login, dashboard, navigation | Done |
| 3 | Document Center (tenant view of Drive docs) | Done |
| 4 | Payment Receipt System | Done |
| 5 | Maintenance Request (v1 migrated) | Done |
| 6 | Lease Expiry Reminder (n8n cron) | Done |

## Tenant Onboarding Form Fields
- Full name, email, phone
- Emergency contact name + number (separate fields)
- Unit / Room number
- Government ID upload (image)
- Lease start date, lease end date
- Monthly rent amount, security deposit amount

## Design Direction
- Clean, modern, professional — not flashy
- Mobile-first responsive layout
- Card-based sections with subtle shadows
- Multi-step forms with visible progress indicator
- **Primary accent:** `#4A6FA5` (slate blue) · **Brand dark:** `#1e3558` (navy)
- Full design system (color tokens, typography, components) documented in `UI/CLAUDE.md`

## n8n Workflow Index

All workflows live in `Backend/workflows/`. Each is an importable n8n JSON.

**These are the canonical (v2) workflows.** They are live in n8n and their DB IDs are already patched. Use these IDs when editing via MCP tools.

| File | n8n ID | Webhook path | Purpose |
|------|--------|-------------|---------|
| `01-verify-access-code.json` | `n00Jj0xY90KFcx2e` | `/webhook/verify-access-code` | Looks up tenant by access code; returns `{ valid, tenant }` where `tenant.onboarded` drives login routing |
| `01b-tenant-onboarding.json` | `nmsXVYER7LZwNfh6` | `/webhook/tenant-onboarding` | Accepts onboarding form, uploads government ID to Drive, sets `onboarded: true` in Notion |
| `02-get-tenant-info.json` | `0Z2RuduQmbjtBp1p` | `/webhook/get-tenant-info` | Returns full tenant record for the dashboard |
| `03-get-tenant-documents.json` | `E3pE5QT8bCIAiYt9` | `/webhook/get-tenant-documents` | Returns Drive file links for the tenant's lease + receipts |
| `04-record-payment.json` | `VAQf2knClSiLiGOR` | `/webhook/record-payment` | Creates a payment record in Notion, generates receipt, emails tenant |
| `05-maintenance-request.json` | `Hb2MGCf6dZByX8Rk` | `/webhook/maintenance-request` | Creates a Maintenance and Repair Request row in Notion, assigns worker via AI, notifies owner |
| `06-lease-expiry-reminder.json` | `o6Vy05GbpSTZbLU0` | _(cron, no webhook)_ | Scheduled — queries Notion for leases expiring within 30 days and emails tenants |
| `07-tenant-contact.json` | `UmLHUN5z3OlMTEt6` | `/webhook/tenant-contact` | Relays tenant message to owner via Gmail/Telegram |
| `00-credentials-test.json` | `FODBTtOZJNgCVGR3` | _(manual trigger)_ | Smoke test — run manually in n8n UI to verify Notion + Gmail + Drive credentials |
| `08-new-tenant-registration.json` | `LTk2ivpWzzVbB6Y2` | `/webhook/new-tenant-registration` | Creates a new tenant record in Notion with auto-generated access code; use before onboarding |

**Legacy v1 workflows (do not edit, do not confuse with v2):** There are older PM workflows (names "PM — 1", "PM — 2 v2", "PM — 4", etc.) still active in n8n on different webhook paths (`/webhook/verify-access`, `/webhook/maintenance-submit-v2`). The UI does NOT call these paths. Leave them alone.

**Open item:** `PM — 01B: Tenant Onboarding` still has `TENANTS_DRIVE_FOLDER_ID_HERE` placeholder in the Google Drive upload node. Replace with the Drive folder ID where tenant government IDs should be stored before testing the onboarding flow.

## Auth / Session Flow

```
index.html → POST /verify-access-code → { valid: true, tenant: { onboarded: bool, ... } }
  └─ onboarded: false → onboarding.html
  └─ onboarded: true  → dashboard.html
```

- The `tenant.onboarded` boolean (returned by `verify-access-code`) is the only routing signal — if missing or `false`, user goes to onboarding regardless of anything else
- Access code stored in `sessionStorage.accessCode`; tenant data stored in `sessionStorage.tenantData`
- `requireAuth()` (in `main.js`) redirects to `index.html` if no code. **Dev bypass:** auto-sets `accessCode = 'DEV-MODE'` when running on `file://` or `localhost`
- All protected pages must call `requireAuth()` at the top of their inline `<script>`
- `initNavbar()` and `initLogout()` run automatically on every page via `DOMContentLoaded` in `main.js` — no need to call them manually

## MCP Servers

`.mcp.json` (project root) is the active config — it wires both **n8n MCP** and **Notion MCP**.

## Backend Workflow Work

### n8n Skills — When to Use Each

| Task | Skill to invoke |
|---|---|
| Building or designing a new workflow | `n8n-workflow-patterns` |
| Any n8n MCP tool call | `n8n-mcp-tools-expert` (consult FIRST) |
| Configuring a specific node | `n8n-node-configuration` |
| Writing a Code node (JS) | `n8n-code-javascript` |
| Writing a Code node (Python) | `n8n-code-python` |
| Data mapping / `{{ }}` expressions | `n8n-expression-syntax` |
| Fixing validation errors | `n8n-validation-expert` |

### Standard Workflow Build Process

Follow this order every time you build or edit a workflow:

1. **Pattern** — invoke `n8n-workflow-patterns` to choose the right architecture
2. **Find nodes** — invoke `n8n-mcp-tools-expert`, then use `search_nodes` + `get_node`
3. **Configure nodes** — invoke `n8n-node-configuration` for required fields per operation
4. **Map data** — invoke `n8n-expression-syntax` for all `{{ }}` references
5. **Code nodes** — invoke `n8n-code-javascript` for any Code node logic
6. **Validate** — run `n8n_validate_workflow` via MCP, then invoke `n8n-validation-expert` to interpret results
7. **Export** — save the workflow JSON to `workflows/` matching the file naming convention

### Conventions

- **File naming:** `NN-kebab-name.json` (e.g. `01-verify-access-code.json`)
- **Webhook paths:** all under `/webhook/` on the n8n instance
- **No hardcoded credentials** — always use n8n credential references
- **Notion field names** must match column names exactly (case-sensitive)
- **Tenant access code** is stored in the Tenants database; it drives all auth routing

### MCP + File Sync Rule

- Live workflows are readable and editable via n8n MCP tools (`n8n_get_workflow`, `n8n_update_partial_workflow`, etc.)
- `workflows/` JSON files are the exportable source-of-truth backups
- After any MCP edit to a live workflow, export it and overwrite the matching file in `Backend/workflows/`

## Claude's Rules for This Project
- Always use plain HTML/CSS/JS — no React, Vue, or other frameworks
- Keep CSS in `css/style.css` and JS in `js/main.js` (shared across pages)
- n8n webhook URLs go in `js/main.js` as constants at the top
- Never hardcode credentials in frontend files
- When building forms, match field names exactly to the Notion database column names
- Full design system (components, tokens, JS utilities) is in `UI/CLAUDE.md` — read it before touching any UI file
- After completing any UI file: run `/simplify`, `/security-review`, then `/run`
