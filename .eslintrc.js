module.exports = {
    'extends': 'eslint:recommended',
    'rules': {
        'eqeqeq': 'error',
        'block-scoped-var': 'error',
        'comma-spacing': [
            'warn',
            {
                'before': false,
                'after': true
            }
        ],
        'comma-dangle': [
            'error',
            'never'
        ],
        'keyword-spacing': [
            'error',
            {
                'after': true
            }
        ],
        'linebreak-style': [ 'error', 'unix' ],
        'no-unneeded-ternary': 'warn',
        'operator-linebreak': [ 'warn', 'after' ],
        'semi': 'warn',
        'space-infix-ops': 'warn',
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', 'never'],
        'quotes': [ 'warn', 'single' ]
    },
        'env': {
        'browser': true
    },
    'globals': {
        'd3': false,
        'VS': false
    }
};