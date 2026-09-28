# V05 and V08 verification scope

This work verifies existing fixes in the Funeral Management System and adds regression checks without changing application behavior. The original production fixes are attributed to their existing Git author, Maleesha Ransarani. The new contribution consists of review, executable checks, evidence correction and presentation preparation. A contributor should run and understand these checks before describing them as completed personal work; disclose AI assistance where the course requires it.

## Source revisions

| Purpose | Branch at review | Commit |
| --- | --- | --- |
| Before V05 | Test3 | `488612034e14ad3ff6266a417cc7999c2e3d13f9` |
| V05 fix; before the V08 receipt fix | Test4 | `7135c5bac61780841637396d9cefbcdde786dff4` |
| V08 receipt fix; includes V05 | Test5 | `9bc0f17f03bac98130186c45cfc918d6b614bb99` |

Remote branch tips were checked on 2026-09-28. Names can move; the commit IDs identify the reviewed versions. Test4 is an ancestor of Test5. At review, Test5 was not an ancestor of the branch named `fixed`, and the checked-out `main` did not contain these fixes. Do not infer integration from branch names.

The V05 commit subject incorrectly ends in `(V01)`. Its diff and `backend/tests/V05_PRICE_QUANTITY_TAMPERING_FIX_REPORT.md` identify price/quantity tampering. Use V05 in new documentation; preserve historical commit attribution.

## Selected findings

| Finding | Severity in supplied list | OWASP taxonomy used in that list | Protected asset |
| --- | --- | --- | --- |
| V05: client-side price and quantity tampering | High | A04:2021 Insecure Design | Order and payment integrity |
| V08: IDOR in order receipt delivery | High | A01:2021 Broken Access Control | Order confidentiality and authorized email delivery |

These entries were not yellow-highlighted in `Severity.pdf`. Yellow exclusions were V01, V03, V04 and V15. Presentation availability does not transfer authorship of an existing fix.

## Threat model

The attacker has an ordinary customer account and can edit JSON requests outside the React interface. For the receipt attack, assume the attacker has obtained another order ID; guessing an ID is not required. Trusted inputs are the authenticated `req.user` set by server middleware and values loaded from database records. Request prices, totals, order IDs, recipient emails and quantities are untrusted inputs.

Security requirements:

- An order cannot use a client-defined price without a catalogue product.
- Prices, product names and totals must come from the stored product data and validated quantities.
- Shipping updates must not modify financial fields or ownership.
- Payment completion must match a successful Stripe intent to the expected order, requester, currency and amount.
- An unrelated customer must not trigger another customer's receipt.
- An allowed receipt request must deliver to the stored account email, regardless of a body email.

## Verification boundary

`backend/security-checks` uses Node's built-in test runner and executes the actual controller source in an isolated JavaScript context. Database queries, email sending and Stripe are test doubles. Fixture IDs are simplified; these checks do not validate Mongoose casting or schema hooks. Authentication is assumed in controller checks; Express route wiring, JWT validation, SMTP delivery, live Stripe behavior, MongoDB persistence and concurrency require separate integration tests.

The files use `.check.cjs` to remain separate from the existing Jest `.test.js` suite. Run them explicitly with `node backend/security-checks/run.cjs`. No package installation, package.json edit, credentials, running database or application startup is required. Validated with Node v24.16.0.

## Sources

- [Repository](https://github.com/Maleesha-ui/SSD_assingment)
- [V05 production commit](https://github.com/Maleesha-ui/SSD_assingment/commit/7135c5bac61780841637396d9cefbcdde786dff4)
- [V08 production commit](https://github.com/Maleesha-ui/SSD_assingment/commit/9bc0f17f03bac98130186c45cfc918d6b614bb99)
- [OWASP parameter tampering](https://community.owasp.org/attacks/Web_Parameter_Tampering)
- [OWASP IDOR prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [OWASP A04:2021](https://top10.owasp.org/2021/A04_2021-Insecure_Design/)
- [OWASP A01:2021](https://top10.owasp.org/2021/A01_2021-Broken_Access_Control/)

The 2021 taxonomy is intentional because it matches the supplied report. It is not described here as the latest edition.
