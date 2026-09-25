const MIN_SECRET_BYTES = 32;
const WEAK_SECRETS = new Set([
  '123',
  '123456',
  'password',
  'secret',
  'jwtsecret',
  'your_jwt_secret_here',
]);

const validateSecret = (name, value) => {
  const isRepeatedCharacter = /^(.)\1+$/.test(value || '');
  const isPlaceholder = /^(your|change|replace|example|placeholder)/i.test(value || '');

  if (
    !value ||
    Buffer.byteLength(value, 'utf8') < MIN_SECRET_BYTES ||
    /^\d+$/.test(value) ||
    isRepeatedCharacter ||
    isPlaceholder ||
    WEAK_SECRETS.has(value.toLowerCase())
  ) {
    throw new Error(`${name} must be a strong, non-placeholder secret of at least 32 bytes.`);
  }

  return value;
};

const getJwtSecret = () => validateSecret('JWT_SECRET', process.env.JWT_SECRET);

const getStepUpSecret = () => {
  if (process.env.STEP_UP_SECRET) {
    return validateSecret('STEP_UP_SECRET', process.env.STEP_UP_SECRET);
  }

  return `${getJwtSecret()}_stepup`;
};

const validateJwtSecrets = () => {
  getJwtSecret();
  getStepUpSecret();
};

module.exports = { getJwtSecret, getStepUpSecret, validateJwtSecrets };