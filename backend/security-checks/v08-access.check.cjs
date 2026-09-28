'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, receiptSetup, request, invoke } = require('./harness.cjs');

for (const role of ['customer', 'staff', 'driver', 'funeral_manager']) {
  test(`V08: an unrelated ${role} cannot trigger another owner's receipt`, async () => {
    const { controller, state } = receiptSetup();
    const res = await invoke(controller, 'sendEmailReceipt', request({
      user: { _id: IDS.stranger, role },
      body: { orderId: IDS.order, email: 'attacker@example.test' },
    }));
    assert.equal(res.statusCode, 403);
    assert.equal(state.emails.length, 0);
  });
}

for (const role of ['admin', 'manager']) {
  test(`V08: a ${role} can request a receipt for another owner`, async () => {
    const { controller, state } = receiptSetup();
    const res = await invoke(controller, 'sendEmailReceipt', request({
      user: { _id: IDS.stranger, role }, body: { orderId: IDS.order },
    }));
    assert.equal(res.statusCode, 200);
    assert.equal(state.emails.length, 1);
    assert.equal(state.emails[0].email, 'owner@example.test');
  });
}

test('V08: an unknown order returns 404 without sending email', async () => {
  const { controller, state } = receiptSetup({ missingOrder: true });
  const res = await invoke(controller, 'sendEmailReceipt', request({ body: { orderId: IDS.missing } }));
  assert.equal(res.statusCode, 404);
  assert.equal(state.emails.length, 0);
});
