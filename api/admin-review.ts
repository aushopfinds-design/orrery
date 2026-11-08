import { reviewHandler } from '../server/admin-review/handler.ts'

// Server-only page and API. Absent configuration or a production target returns 404.
export default { fetch: reviewHandler() }
