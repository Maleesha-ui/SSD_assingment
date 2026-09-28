# V05 and V08 demonstration runbook

## Reliable offline demonstration

Use the controller regression suite for the five-minute presentation. It needs Node and Git, but no secrets or external services. Show the source revision and one negative test, then the fixed result. Use saved real terminal captures if switching windows would consume the slot. Label every capture **isolated controller test; dependencies mocked**.

1. Show `git log -2 --oneline 9bc0f17` to connect V05 and V08 to the two production commits.
2. Run `node backend/security-checks/run.cjs --ref 4886120 --only v05-price`. Explain the expected failures before the V05 fix.
3. Run `node backend/security-checks/run.cjs --ref 7135c5b --only v08`. Explain the expected failures before the receipt fix.
4. Run `node backend/security-checks/run.cjs --ref 9bc0f17`. The prepared suite returns 46 passes.
5. Show your new commits with `git log --oneline origin/Test5..HEAD` after you have actually committed the work.

Do the historical runs before recording and keep a short screenshot of each; the full console is too long for a five-minute talk. Never relabel these as Postman screenshots or a live database demonstration.

## Optional local API reproduction

These are instructions for a separate integration exercise, not a claim that it has been performed. Use a disposable local database, dummy customer accounts A and B, a mail capture service and Stripe test mode only. The base URL is normally `http://localhost:5000`; the configured PORT may differ. Keep real JWTs and secrets out of slides and version control.

The inspected routes use `Authorization: Bearer <test-token>`. Both `POST /api/orders` and `POST /api/orders/email-receipt` apply `protect`. A no-token request should be rejected by that middleware; the controller suite does not test this path.

### V05 request

Use an authenticated test customer. Include a payment method accepted by the model and a complete dummy shipping address if exercising the real schema.

```http
POST /api/orders
Authorization: Bearer <TEST_CUSTOMER_TOKEN>
Content-Type: application/json

{
  "items": [{ "productName": "Test product", "price": 0.01, "quantity": 1 }],
  "paymentMethod": "STRIPE",
  "shippingAddress": { "street": "Test street", "city": "Test city", "postalCode": "00000", "country": "Test country" }
}
```

The old controller accepted the client-price fallback; the fixed controller rejects the missing product ID with 400. The isolated checks establish that controller behavior; a real API run also depends on schema requirements.

For a valid active catalogue product priced at 2500, submit its real test ID, quantity 2, forged item price 0.01 and totalAmount 0.02. Fixed controller expectation: 201, stored line price 2500, total 5000. The earlier product-ID path already used catalogue pricing, so this second request alone is not a before/after demonstration of the vulnerability. Then test quantity -1 and duplicate quantities 3 + 3 against stock 5; expect 400 on the fixed controller.

### V08 request

Create an order owned by B. Authenticate as A and send:

```http
POST /api/orders/email-receipt
Authorization: Bearer <CUSTOMER_A_TEST_TOKEN>
Content-Type: application/json

{ "orderId": "<ORDER_OWNED_BY_B>", "email": "attacker@example.test" }
```

Before: the controller calls the mail helper with the submitted recipient. After: 403 and no mail-helper invocation. As B: 200 and delivery to B's stored account email, ignoring body email. As exact role `admin` or `manager`: 200, still to B's stored account email. For an unknown valid-format ID: 404.

## Capture checklist

- Source commit or branch visible, test command visible, result summary visible.
- One negative case and one legitimate success per vulnerability.
- No real customer records, email addresses, bearer tokens or API credentials in captures.
- Results labelled by test layer and by before/fixed source.
- New personal commit IDs recorded separately from teammates' original fix commits.
