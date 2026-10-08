const crypto = require('crypto');

// Excludes visually ambiguous characters (0/O, 1/l/I) so the password is easy to relay verbally or in writing.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function generateTempPassword(length = 10) {
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}

module.exports = generateTempPassword;
