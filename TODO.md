# TODO
17. Once all old offers without token_hash have expired, make token_hash non-nullable in DB,
    and remove code that works with null token_hash:
    - api: Offer::tokenIsValid(), testLegacyOffersWithoutTokenCanBeUpdated()
    - ui: OfferCard() { const canEdit; }, types.ts/Offer.token_hash

# DONE!
01. Set up CI/CD
12. Fix: Unify error handling (i.e. leverage ErrorBoundary)
13. Refact: use loader's return values rather than re-query
11. Fix favicon
05. Better nav (use NavLinks)
    * breadcrumbs
08. Show event name/image in offer form
09. Show event name in page meta title
03. Trash button on offer form in edit mode
13. Make /events/:eventhash/offers/:id navigable (open corresponding marker's popup on map)
    * if offer :id doesn't exist, fall back to /offers
15. Add api feature test suite
10. Move event images to file storage for static serving
16. Add ui- and api- test jobs + psalm check to CI pipeline
02. Add unit tests (both api and ui)
04. Token-based security for editing offers
06. Translations (EN, FR)
07. Add Admin pages
14. Add notification snack bar (flash toasts)
