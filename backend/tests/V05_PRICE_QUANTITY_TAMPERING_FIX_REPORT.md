# V05 Vulnerability Fix Report
## Client-Side Price and Quantity Tampering - OWASP A04: Insecure Design

**Report Date:** September 26, 2026  
**Application:** Funeral Management System (MERN Stack)  
**Vulnerability ID:** V05  
**Severity:** HIGH  
**Status:** Remediated in the inspected workspace

## Executive Summary

The order/payment flow trusted client-controlled monetary data in several places. The order creation controller had a client-price fallback, the Stripe payment-intent endpoint used a client-submitted amount, order updates passed the request body directly to MongoDB, and payment completion could mark an order paid without confirming Stripe reported a successful payment for the exact order total.

The backend now derives order prices and payment-intent amounts from persisted database data, validates quantities and stock, restricts editable order fields, and verifies the Stripe intent before completing an order. The frontend no longer submits prices, totals, or payment amounts as authoritative values.

## Findings and Remediation

### Order creation

- **File:** `backend/controllers/orderController.js`
- **Endpoint:** `POST /api/orders`
- Removed the fallback that accepted `item.price` and `item.productName` from the client.
- Requires each item to reference a valid Product ID and fetches the active Product from MongoDB.
- Copies the product name and price from the database and calculates the order total on the server.
- Validates that items are present and capped at 50 per order.
- Validates each quantity as a safe integer from 1 through 100 and rejects quantities exceeding product stock.
- Aggregates duplicate lines for the same product when checking available stock.
- Rejects missing/invalid stock, invalid or negative prices, and non-finite order totals.

### Order updates

- **File:** `backend/controllers/orderController.js`
- **Endpoint:** `PUT /api/orders/:id`
- Removed the direct `findByIdAndUpdate(..., req.body)` behavior.
- Only pending orders may be updated, and the controller accepts only a shipping-address change. Submitted `items`, `price`, `quantity`, and `totalAmount` fields are not applied.

### Stripe payment intent and completion

- **File:** `backend/controllers/paymentController.js`
- **Endpoints:** `POST /api/payments/create-intent` and `POST /api/payments/:orderId/complete`
- Intent creation accepts the order ID, checks the order exists, checks ownership (or admin/manager access), and requires a pending, non-cancelled order.
- Stripe amount is derived from the persisted order total in cents; a client-supplied `amount` is ignored.
- Completion checks order access and pending state, then retrieves the PaymentIntent from Stripe.
- Requires matching order/user metadata, successful intent status, USD currency, exact expected amount, and exact amount received before creating a payment record or marking the order paid.

### Legacy direct payment path

- **File:** `backend/controllers/paymentController.js`
- **Endpoint:** `POST /api/payments/process`
- Disabled with HTTP 410 because this path previously marked orders paid without verifying a successful payment with Stripe.

### Frontend checkout

- **Files:** `frontend/src/pages/orders/OrderForm.jsx`, `frontend/src/components/Payment/StripePayment.jsx`
- Order submission sends only product IDs and quantities (plus shipping/payment-method data); it no longer sends the client-calculated total or item prices.
- Payment-intent creation sends only the order ID; the server determines the payment amount.

## Verification

- Mocked controller test confirmed a forged client item price and total are ignored in favor of the Product database price.
- Negative, duplicate-line over-stock, and invalid-stock cases were rejected.
- Mocked update test confirmed submitted item and total changes do not overwrite stored order values.
- Mocked payment tests confirmed the Stripe intent amount comes from the stored order, an incomplete intent is rejected, and a successful matching intent records the expected amount.
- `node --check` passed for the order and payment controllers.
- ESLint passed for `StripePayment.jsx`. `OrderForm.jsx` still reports pre-existing unused-variable errors and a hook-dependency warning.
- `git diff --check` passed.
- A frontend production build transformed 12,929 modules but did not complete bundling before it was stopped; a successful production build was not verified.
- No live Stripe charge or end-to-end authenticated order was performed.

## Residual Risks and Deployment Notes

- Stock is checked at order creation but is not reserved or decremented. Concurrent or repeated orders can still oversell inventory if `Product.stock` represents available inventory. Implement an atomic reservation/decrement if stock must be guaranteed.
- The order update endpoint now accepts shipping-address updates only while an order is pending; clients that previously relied on updating other fields must use an appropriate privileged workflow.
- Payment completion checks state before writing records, but concurrent completion requests should be protected with a database transaction or idempotency constraint to prevent duplicate payment records/races.
- Validate the behavior in a test environment with a valid user token and Stripe test mode before deployment.