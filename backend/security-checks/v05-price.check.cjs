'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, setup, request, invoke } = require('./harness.cjs');

test('V05: a product-free client-priced line cannot create an order', async () => {
  const { controller, state } = setup();
  const res = await invoke(controller, 'createOrder', request({ body: {
    items: [{ productName: 'Test product', price: 0.01, quantity: 1 }],
  } }));
  assert.equal(res.statusCode, 400);
  assert.equal(state.created.length, 0);
});

test('V05: product name, price and order total come from stored data', async () => {
  const { controller, state } = setup();
  const res = await invoke(controller, 'createOrder', request({ body: {
    items: [{ product: IDS.product, productName: 'Forged name', price: 0.01, quantity: 2 }],
    totalAmount: 0.02,
  } }));
  assert.equal(res.statusCode, 201);
  assert.equal(state.created[0].totalAmount, 5000);
  assert.equal(state.created[0].items[0].price, 2500);
  assert.equal(state.created[0].items[0].productName, 'Test product');
});

for (const [label, options] of [
  ['missing', { missingProduct: true }],
  ['inactive', { product: { isActive: false } }],
]) {
  test(`V05: ${label} products cannot be ordered`, async () => {
    const { controller, state } = setup(options);
    const res = await invoke(controller, 'createOrder', request({ body: {
      items: [{ product: IDS.product, quantity: 1 }],
    } }));
    assert.equal(res.statusCode, 404);
    assert.equal(state.created.length, 0);
  });
}
