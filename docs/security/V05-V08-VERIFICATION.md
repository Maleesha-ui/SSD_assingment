# V05 and V08 verification evidence

## Results recorded during preparation

Date: 2026-09-28. Runtime: Node v24.16.0. Production source: `9bc0f17f03bac98130186c45cfc918d6b614bb99` (Test5). Results are isolated controller checks, not live API results. The Git-ref loading path was exercised successfully. The final suite was rerun using controller files exported from the same immutable commit after refining one test to isolate its intended condition.

| Suite | Checks | Result on Test5 |
| --- | ---: | --- |
| Existing successful order and receipt flows | 2 | 2 pass |
| V05 price source and product availability | 4 | 4 pass |
| V05 quantity, stock and update boundaries | 18 | 18 pass |
| V05 payment integrity | 10 | 10 pass |
| V08 object access | 7 | 7 pass |
| V08 email destination and stored content | 5 | 5 pass |
| Total | 46 | 46 pass, 0 fail |

Historical regression checks used the same test code:

- Before V05 (`4886120`), the four price checks had two passes and two expected failures: product-free client-priced orders and inactive-product orders were accepted. Forged prices alongside a valid product ID were already ignored, and missing products were already rejected.
- Before the V08 receipt fix (`7135c5b`), the twelve V08 checks had five passes and seven expected failures: four unrelated roles were allowed, and three allowed roles could redirect receipts using body email. Existing stored-content and shipping-email behavior were already correct.

Historical failures are intentional evidence of a regression test detecting older behavior. An unrelated setup error is not evidence of a vulnerability.

## Reproduce

From the repository root after adding these files:

```powershell
node backend/security-checks/run.cjs
node backend/security-checks/run.cjs --ref 9bc0f17f03bac98130186c45cfc918d6b614bb99
node backend/security-checks/run.cjs --ref 488612034e14ad3ff6266a417cc7999c2e3d13f9 --only v05-price
node backend/security-checks/run.cjs --ref 7135c5bac61780841637396d9cefbcdde786dff4 --only v08
```

The first command verifies current controller files. The next verifies the pinned fixed source. The last two should exit with code 1 because security assertions fail on the older implementations. None of these commands switch branches or send real email/payments.

Save your own terminal output and commit IDs after running. These preparation results are not a substitute for your own demonstration.

## Report corrections supported by source

1. **V05 entry point:** the old controller used database prices for lines with a product ID. The vulnerable fallback accepted `productName` and `price` without a product ID. It computed `totalAmount`; it did not directly copy `req.body.totalAmount` at order creation. The old payment-intent handler separately accepted a client `amount`.
2. **V05 lookup:** the fix calls `Product.findById(item.product)` inside the loop. The Word report's bulk `Product.find({ _id: { $in: productIds } })` description does not match this commit.
3. **V05 ID:** the commit subject's V01 tag is a labeling error. The assigned finding is V05.
4. **V08 email:** the fixed handler uses only `order.user.email`. It has no fallback to `order.shippingAddress.email`.
5. **V08 scope:** the Test5 diff hardens `sendEmailReceipt`. Do not claim that this commit newly added ownership checks to every order method; some checks already existed.
6. **Evidence wording:** the Word report describes six receipt tests as passed, but a matching committed V08 test file was not found on Test5. The new suite supplies independently reproducible checks; it does not verify when or by whom the previously reported tests were run.

## Remaining concerns

- Stock checks do not reserve/decrement inventory atomically. Concurrent orders can still exceed availability.
- Per-line quantity is capped at 100. Duplicate lines are aggregated against stock, but a separate per-product aggregate cap of 100 is not enforced when stock is larger. Do not overstate the cap.
- Payment completion lacks an observed transaction/idempotency constraint around the checked flow. Concurrent completion requires further testing and protection.
- Money is calculated with JavaScript numbers, then rounded to cents for Stripe. Integer minor units would provide a clearer currency model. Stripe currency in this implementation is USD; do not label the demo value as LKR.
- `manager` is privileged in the receipt controller; `funeral_manager` is not unless that user owns the order. Both names exist in the model. The new checks record this behavior; a policy decision is needed before changing it.
- A deleted/missing populated owner or malformed ID needs integration testing and explicit error handling. The current receipt handler can fall into its 500 response.
- Existing 403 versus missing 404 reveals whether an order exists to authenticated callers; assess a uniform not-found policy if required.
- Test5 lacks the subsequent Test6 rate-limiting commit. Authorized repeat receipt requests remain an abuse concern on this base.
- The branch named `fixed` did not contain Test5 in its ancestry at review. Integration into the final submission branch still needs to be handled by the team.

These concerns are documented, not silently fixed, because the contribution is restricted to verification and documentation.

## Contribution statement template

Use only after completing the described work:

> I reviewed the existing V05 and V08 fixes, added and ran regression checks for order pricing, quantity boundaries, payment verification and receipt authorization, checked those tests against the earlier vulnerable code, and corrected the related evidence notes. The original production fixes remain attributed to their existing Git author. I used AI assistance in preparation [adapt this disclosure to course requirements].

Add your real name/index and actual new commit IDs to the group report. The report currently has only three placeholder members although the guide specifies four; the team must correct the roster and contribution allocation honestly.
