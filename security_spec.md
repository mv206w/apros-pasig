# Security Specification — Apros Wellness Spa CMS

## 1. Data Invariants
1. All storefront catalog data (`/siteConfig/main`, `/categoryCovers/*`, `/services/*`, `/spaGallery/*`) is public read-only (no PII stored).
2. All writes (`create`, `update`, `delete`) across every CMS collection are strictly limited to verified admins (`isAdmin()` requiring `request.auth != null`, `request.auth.token.email_verified == true`, and either bootstrapped admin email `melmarvelasco@gmail.com` or an existing `/admins/$(request.auth.uid)` record).
3. `/admins/{userId}` contains email PII and must reject public reads/lists and all client-side self-escalation writes.
4. Every document write validates strict required + allowed keys (`hasAll` + `hasOnly`), string length bounds (`.size()`), numeric range bounds, enum membership, and server timestamp integrity (`updatedAt == request.time`).
5. Every document ID path variable is validated via `isValidId(id)` (`size() <= 128` and `^[a-zA-Z0-9_\-]+$`) on single-document operations (`get`, `create`, `update`, `delete`), never on `list`.

## 2. "Dirty Dozen" Adversarial Payloads (Must All Return `PERMISSION_DENIED`)
1. Unauthenticated write to `/siteConfig/main`.
2. Signed-in non-admin user attempting to `create` or `update` `/services/massage-liknayan`.
3. Signed-in user with matching admin email (`melmarvelasco@gmail.com`) where `email_verified` is `false` (Email Spoofing attack).
4. Admin attempting to inject a shadow field (`isFeatured: true`) into `/services/new-item` (`hasOnly` rejection).
5. Client attempting self-elevation by creating `/admins/{uid}`.
6. Unauthenticated or non-admin user attempting `list` or `get` on `/admins`.
7. Resource-poisoning attack with an oversized ID (> 128 chars) or invalid characters in `/services/{serviceId}`.
8. Oversized URL string (> 2048 chars) in `heroImageUrl` or `spaGallery.imageUrl`.
9. Negative `price` (`-500`) or non-numeric `price` (`"free"`) in `/services/{serviceId}`.
10. Invalid `categoryId` (`"unknown-category"`) in `/services/{serviceId}` or `/categoryCovers/{categoryId}`.
11. Unbounded array (> 10 items) in `includes`, `addOnAOptions`, `addOnBOptions`, or `homeRates`.
12. Client-spoofed `updatedAt` timestamp not equal to `request.time`.
