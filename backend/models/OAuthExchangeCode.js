const mongoose = require('mongoose');

const oauthExchangeCodeSchema = new mongoose.Schema({
  codeHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  redirectUri: {
    type: String,
    required: true,
  },
  codeChallenge: {
    type: String,
    default: '',
  },
  codeChallengeMethod: {
    type: String,
    enum: ['S256'],
    default: 'S256',
  },
  state: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // TTL index: automatically purged after 60 seconds
  },
  consumedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('OAuthExchangeCode', oauthExchangeCodeSchema);
