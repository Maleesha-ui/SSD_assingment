'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, setup, receiptSetup, request, invoke } = require('./harness.cjs');

test('a valid catalogue order still succeeds', async () => {
  const { controller, state } = setup();
  const res = await invoke(controller, 'createOrder', request({ body: {
    items: [{ product: IDS.product, quantity: 2 }],
    shippingAddress: { street: 'Test street' }, paymentMethod: 'STRIPE',
  } }));
  assert.equal(res.statusCode, 201);
  assert.equal(state.created.length, 1);
  assert.equal(state.created[0].totalAmount, 5000);
  assert.equal(state.created[0].user, IDS.owner);
});

test('the owner can still request a receipt', async () => {
  const { controller, state } = receiptSetup();
  const res = await invoke(controller, 'sendEmailReceipt', request({ body: { orderId: IDS.order } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].email, 'owner@example.test');
});
