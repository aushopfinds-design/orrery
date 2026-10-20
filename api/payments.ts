import { paymentHandler } from '../server/payments/handler.ts'
import { paymentService } from '../server/payments/runtime.ts'

// One function keeps checkout, signed notifications and private order status together.
export default { fetch: paymentHandler(paymentService) }
