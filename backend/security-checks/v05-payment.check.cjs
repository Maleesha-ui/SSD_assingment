'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, setup, request, invoke } = require('./harness.cjs');

test('V05: Stripe amount uses the stored total, ignoring the request amount', async () => {
  const { controller, state } = setup({ controller: 'paymentController' });
  const res = await invoke(controller, 'createPaymentIntent', request({ body: {
    orderId: IDS.order, amount: 0.01,
  } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.intentCreates.length, 1);
  assert.equal(state.intentCreates[0].amount, 250000);
  assert.equal(state.intentCreates[0].currency, 'usd');
  assert.equal(state.intentCreates[0].metadata.orderId, IDS.order);
});

test('V05: another customer cannot create a payment intent for this order', async () => {
  const { controller, state } = setup({ controller: 'paymentController' });
  const res = await invoke(controller, 'createPaymentIntent', request({
    user: { _id: IDS.stranger, role: 'customer' }, body: { orderId: IDS.order },
  }));
  assert.equal(res.statusCode, 403);
  assert.equal(state.intentCreates.length, 0);
});

for (const [label, intent] of [
  ['wrong order', { metadata: { orderId: IDS.missing, userId: IDS.owner } }],
  ['wrong user', { metadata: { orderId: IDS.order, userId: IDS.stranger } }],
  ['incomplete payment', { status: 'requires_payment_method' }],
  ['wrong currency', { currency: 'eur' }],
  ['wrong amount', { amount: 1 }],
  ['underpayment received', { amount_received: 1 }],
]) {
  test(`V05: payment completion rejects ${label} without saving`, async () => {
    const { controller, state, order } = setup({ controller: 'paymentController', intent });
    const res = await invoke(controller, 'updatePaymentStatus', request({ body: {
      paymentIntentId: 'pi_test_only', amount: 0.01,
    } }));
    assert.equal(res.statusCode, 400);
    assert.equal(state.paymentCreates.length, 0);
    assert.equal(state.saved.length, 0);
    assert.equal(order.paymentStatus, 'pending');
  });
}

test('V05: a matching successful payment records the correct amount', async () => {
  const { controller, state, order } = setup({ controller: 'paymentController' });
  const res = await invoke(controller, 'updatePaymentStatus', request({ body: {
    paymentIntentId: 'pi_test_only', amount: 0.01,
  } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.paymentCreates.length, 1);
  assert.equal(state.paymentCreates[0].amount, 2500);
  assert.equal(state.saved.length, 1);
  assert.equal(order.paymentStatus, 'paid');
});

test('V05: the old direct payment endpoint cannot mark an order paid', async () => {
  const { controller, state, order } = setup({ controller: 'paymentController' });
  const res = await invoke(controller, 'processPayment', request({ body: {
    orderId: IDS.order, amount: 0.01, paymentMethod: 'STRIPE',
  } }));
  assert.equal(res.statusCode, 410);
  assert.equal(state.paymentCreates.length, 0);
  assert.equal(state.saved.length, 0);
  assert.equal(order.paymentStatus, 'pending');
});
