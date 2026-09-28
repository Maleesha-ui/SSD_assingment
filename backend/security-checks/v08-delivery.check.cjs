'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, receiptSetup, request, invoke } = require('./harness.cjs');

for (const role of ['customer', 'admin', 'manager']) {
  test(`V08: ${role} cannot redirect the receipt using a body email`, async () => {
    const { controller, state } = receiptSetup();
    const res = await invoke(controller, 'sendEmailReceipt', request({
      user: { _id: role === 'customer' ? IDS.owner : IDS.stranger, role },
      body: { orderId: IDS.order, email: 'attacker@example.test' },
    }));
    assert.equal(res.statusCode, 200);
    assert.equal(state.emails.length, 1);
    assert.equal(state.emails[0].email, 'owner@example.test');
  });
}

test('V08: receipt content comes from the order, not supplied orderDetails', async () => {
  const { controller, state } = receiptSetup();
  const res = await invoke(controller, 'sendEmailReceipt', request({ body: {
    orderId: IDS.order,
    orderDetails: { totalAmount: 0.01, items: [], orderNumber: 'FORGED' },
  } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].totalAmount, 2500);
  assert.equal(state.emails[0].items.length, 1);
  assert.equal(state.emails[0].orderNumber, 'ORD-DEMO');
  assert.equal(state.emails[0].email, 'owner@example.test');
});

test('V08: a shipping-address email does not override the account email', async () => {
  const { controller, state } = receiptSetup({ order: {
    shippingAddress: { email: 'different@example.test' },
  } });
  const res = await invoke(controller, 'sendEmailReceipt', request({ body: { orderId: IDS.order } }));
  assert.equal(res.statusCode, 200);
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].email, 'owner@example.test');
});
