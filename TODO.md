# TODO
32. Let admin pages redirect to admin/login for unauthenticated users.
27. In admin/event edit form, show a table of offers, with edit link.
28. Remove DB-storage of event images and clean up all related code.
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
18. Fix console complaint about missing fallbackElement
20. Perf: split map bundle and optimise hydration
21. Add event map to admin event form.
23. Refactor mutation error handling to show notification instead of error page.
19. Refactor events import system
22. In AdminEventsPage, append " (private)" to private events' name
25. update ci/cd to deploy to staging and production environments sequentially
30. When clicking on offer card's marker locator button, make sure to
    scroll up to top of map, so that the target offer is visible.
31. Make notification flash toast visible over map (update z-index).
26. Allow logged-in admins to update/delete any existing offer.

