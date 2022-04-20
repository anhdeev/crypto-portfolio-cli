const OFF = 0,
    WARN = 1,
    ERROR = 2

module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'no-unused-vars': WARN,
    'no-useless-escape': OFF,
    'no-async-promise-executor': OFF,
    'no-constant-condition': ERROR,
    'no-prototype-builtins': OFF,
    'no-extra-boolean-cast': OFF,
    "semi": OFF,
    "indent": OFF,
    "max-len": ["error", {"code": 120}],
    "spaced-comment": OFF,
    "require-jsdoc": OFF
  },
};
