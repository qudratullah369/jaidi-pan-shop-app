# Changelog

## v1.0.1 – Production Hardening (2026-08-02)

### Security
- Added `firestore.rules` with staff-gated writes, constrained customer updates, and notification outbox rules
- Added `firestore.indexes.json` for menu/promotions/notifications queries
- Loyalty stamp **add** and **redeem** use Firestore **transactions** (atomic)

### Push / backend
- Production-ready Cloud Function entry: `firebase/functions/index.js`
- `firebase/functions/package.json` + root `firebase.json` for deploy

### App fixes
- Notification deep links only navigate to known screens (Home/Menu/Cart/Rewards/Contact)
- Active **promotions** shown on Home
- About copy surfaced on Contact (AboutScreen no longer the only place for story)

### Quality
- Pure helpers: `src/utils/phone.ts`, `src/utils/cartMath.ts`
- Jest unit tests for phone normalization and cart math
- App version bumped to **1.0.1**

### Still required before public pilot
- [ ] Paste real Firebase config (app + admin)
- [ ] `firebase deploy --only firestore:rules,firestore:indexes,functions`
- [ ] Replace solid-color icon/splash assets
- [ ] `eas build --profile preview` + physical device test checklist (see BUILD.md)
