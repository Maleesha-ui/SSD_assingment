'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, setup, request, invoke } = require('./harness.cjs');

for (const quantity of [0, -1, 1.5, '2', 101, Number.MAX_SAFE_INTEGER + 1]) {
  test(`V05: rejects quantity ${JSON.stringify(quantity)}`, async () => {
    const { controller, state } = setup();
    const res = await invoke(controller, 'createOrder', request({ body: {
      items: [{ product: IDS.product, quantity }],
    } }));
    assert.equal(res.statusCode, 400);
    assert.equal(state.created.length, 0);
  });
}

for (const quantity of [1, 100]) {
  test(`V05: accepts valid boundary quantity ${quantity}`, async () => {
    const { controller, state } = setup();
    const res = await invoke(controller, 'createOrder', request({ body: {
      items: [{ product: IDS.product, quantity }],
    } }));
    assert.equal(res.statusCode, 201);
    assert.equal(state.created[0].totalAmount, 2500 * quantity);
  });
}

for (const [label, items, options] of [
  ['empty cart', [], {}],
  ['more than fifty lines', Array.from({ length: 51 }, () => ({ product: IDS.product, quantity: 1 })), {}],
  ['null line', [null], {}],
  ['malformed product ID', [{ product: 'not-an-id', quantity: 1 }], {}],
  ['single line exceeds stock', [{ product: IDS.product, quantity: 6 }], { product: { stock: 5 } }],
  ['duplicate lines exceed stock', [{ product: IDS.product, quantity: 3 }, { product: IDS.product, quantity: 3 }], { product: { stock: 5 } }],
  ['invalid stock', [{ product: IDS.product, quantity: 1 }], { product: { stock: -1 } }],
]) {
  test(`V05: rejects ${label} before saving`, async () => {
    const { controller, state } = setup(options);
    const res = await invoke(controller, 'createOrder', request({ body: { items } }));
    assert.equal(res.statusCode, 400);
    assert.equal(state.created.length, 0);
  });
}

test('V05: shipping updates do not change financial or ownership fields', async () => {
  const { controller, state, order } = setup();
  const res = await invoke(controller, 'updateOrder', request({ body: {
    shippingAddress: { street: 'Updated street' },
    totalAmount: 0.01, items: [], paymentStatus: 'paid', user: IDS.stranger,
  } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.saved.length, 1);
  assert.equal(order.totalAmount, 2500);
  assert.equal(order.items.length, 1);
  assert.equal(order.paymentStatus, 'pending');
  assert.equal(order.user, IDS.owner);
  assert.equal(order.shippingAddress.street, 'Updated street');
});

for (const patch of [{ paymentStatus: 'paid' }, { orderStatus: 'shipped' }]) {
  test(`V05: rejects shipping updates for ${JSON.stringify(patch)}`, async () => {
    const { controller, state } = setup({ order: patch });
    const res = await invoke(controller, 'updateOrder', request({ body: {
      shippingAddress: { street: 'Updated street' },
    } }));
    assert.equal(res.statusCode, 409);
    assert.equal(state.saved.length, 0);
  });
}
