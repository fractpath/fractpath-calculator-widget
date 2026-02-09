# WGT-020 — Share semantics (marketing vs app)

## Sprint
Sprint 0 (rewrite) → Sprint 5 (implementation)

## Objective
Define share behavior and payload semantics distinctly for:
- Marketing share (unauth, branded email summary + magic link to proto deal)
- App share (auth, permissioned read-only access to real deal)

Widget must produce share-safe summaries but must not own delivery.

## Marketing Share (mode="marketing")
### What the widget does
- Produces `ShareSummary` that is safe for unauth sharing:
  - persona
  - sanitized headline outputs (Basic Results only)
  - input highlights (non-sensitive)
  - disclaimers / non-binding language hook (if required by legal copy)

- Calls `onShareSummary(summary)`.

### What the host (marketing) does
- Calls marketing `/api/share` to send email summary + magic link.
- The magic link points to app `/resume?token=...` or a marketing-safe landing that forwards to app.

### Constraints
- No real deal identifiers in ShareSummary.
- No sensitive or permissioned fields.
- Must not look like a binding offer.

## App Share (mode="app")
### What the widget may do
- If used in app mode, may render share UI state and/or produce a share intent payload.

### What the app does
- Creates permissioned share artifacts server-side.
- Ensures access control and logging.
- Provides read-only deal view.

## Acceptance Criteria
- Marketing vs app share semantics are explicitly separated.
- ShareSummary field list is explicit or referenced to contract section.
- Widget never sends emails or calls host APIs directly.

## Dependencies
- WGT-031 (gating)
- WGT-INT-001 (public interface locked)
