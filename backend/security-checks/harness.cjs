'use strict';

// Loads the real controller; only its database/payment/email dependencies are faked.
// This is a unit-test harness, not an Express, Mongoose, JWT, SMTP or Stripe emulator.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const IDS = Object.freeze({
  owner: '111111111111111111111111',
  stranger: '222222222222222222222222',
  product: '333333333333333333333333',
  order: '444444444444444444444444',
  missing: '555555555555555555555555',
});

function readSource(file) {
  const repo = process.env.SECURITY_REPO || execFileSync(
    'git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }
  ).trim();
  const ref = process.env.SECURITY_SOURCE_REF;
  return ref
    ? execFileSync('git', ['show', `${ref}:${file}`], { cwd: repo, encoding: 'utf8' })
    : fs.readFileSync(path.join(repo, file), 'utf8');
}

function loadController(name, dependencies) {
  const file = `backend/controllers/${name}.js`;
  const module = { exports: {} };
  const output = [];
  const context = {
    module,
    exports: module.exports,
    require(id) {
      if (!Object.hasOwn(dependencies, id)) throw new Error(`Unexpected dependency: ${id}`);
      return dependencies[id];
    },
    console: {
      log: (...args) => output.push(args),
      error: (...args) => output.push(args),
      warn: (...args) => output.push(args),
    },
  };
  vm.runInNewContext(readSource(file), context, { filename: file, timeout: 1000 });
  return module.exports;
}

// Supported fixture IDs are 24-character hex strings; this does not test Mongoose validation.
const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
const mongoose = { isValidObjectId: validId, Types: { ObjectId: { isValid: validId } } };
const copy = value => JSON.parse(JSON.stringify(value));

function query(value) {
  return {
    populate() { return this; },
    select() { return this; },
    sort() { return this; },
    lean() { return this; },
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
  };
}

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = copy(body); return this; },
  };
}

function request(overrides = {}) {
  return {
    user: { _id: IDS.owner, role: 'customer' },
    params: { id: IDS.order, orderId: IDS.order },
    body: {},
    ...overrides,
  };
}

function setup(options = {}) {
  const state = {
    created: [], saved: [], emails: [], paymentCreates: [],
    intentCreates: [], intentRetrieves: [],
  };
  const product = {
    _id: IDS.product, name: 'Test product', price: 2500, stock: 100, isActive: true,
    ...options.product,
  };
  const order = options.missingOrder ? null : {
    _id: IDS.order,
    orderNumber: 'ORD-DEMO',
    user: IDS.owner,
    items: [{ product: IDS.product, productName: 'Test product', quantity: 1, price: 2500 }],
    totalAmount: 2500,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingAddress: { street: 'Test street', city: 'Test city', email: 'address@example.test' },
    createdAt: '2026-09-28T00:00:00.000Z',
    ...options.order,
    async save() { state.saved.push(copy(this)); return this; },
  };
  const Order = {
    findById(id) { return query(id === IDS.order ? order : null); },
    async create(data) {
      state.created.push(copy(data));
      Object.assign(order, data);
      return order;
    },
    async findByIdAndUpdate(id, changes) {
      if (id !== IDS.order || !order) return null;
      Object.assign(order, changes);
      state.saved.push(copy(order));
      return order;
    },
  };
  const Product = {
    async findById(id) { return id === IDS.product && !options.missingProduct ? product : null; },
  };
  const intent = {
    id: 'pi_test_only', client_secret: 'test_placeholder',
    metadata: { orderId: IDS.order, userId: IDS.owner },
    status: 'succeeded', currency: 'usd', amount: 250000, amount_received: 250000,
    ...options.intent,
  };
  const stripe = { paymentIntents: {
    async create(data) { state.intentCreates.push(copy(data)); return intent; },
    async retrieve(id) { state.intentRetrieves.push(id); return intent; },
  } };
  const dependencies = {
    '../models/Order': Order,
    '../models/Product': Product,
    mongoose,
    '../utils/emailUtils': {
      async sendOrderReceipt(data) { state.emails.push(copy(data)); return { accepted: [data.email] }; },
    },
    '../utils/emailService': { async sendPaymentReceipt() {} },
    '../config/stripe': stripe,
    '../models/Payment': {
      async create(data) { state.paymentCreates.push(copy(data)); return { _id: 'test-payment', ...data }; },
    },
  };
  return {
    state, order, product,
    controller: loadController(options.controller || 'orderController', dependencies),
  };
}

function receiptSetup(options = {}) {
  return setup({
    ...options,
    order: {
      user: { _id: IDS.owner, email: 'owner@example.test' },
      ...options.order,
    },
  });
}

async function invoke(controller, method, req) {
  const res = response();
  await controller[method](req, res);
  return res;
}

module.exports = { IDS, setup, receiptSetup, request, invoke };
