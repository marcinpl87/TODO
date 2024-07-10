module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['react', '@typescript-eslint', 'import'],
	rules: {
		'react/prop-types': 'off',
		'react/display-name': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'import/no-unused-modules': 'error',
		'no-trailing-spaces': 'error',
		'no-multi-spaces': 'error',
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always',
			},
		],
		semi: ['error', 'always'],
		quotes: [
			'error',
			'single',
			{
				avoidEscape: true,
				allowTemplateLiterals: true,
			},
		],
		'one-var': ['error', 'never'],
		'arrow-parens': ['error', 'as-needed'],
		'consistent-return': 'error',
		curly: 'error',
		'object-shorthand': 'error',
		'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
		'react/jsx-props-no-spreading': 'off',
		'react/jsx-curly-brace-presence': [
			'error',
			{ props: 'never', children: 'never' },
		],
		'react/jsx-filename-extension': [
			'error',
			{ extensions: ['.jsx', '.tsx'] },
		],
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'prettier/prettier': ['warn'],
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	ignorePatterns: ['dist', '.eslintrc.cjs', '*.scss', '*.css', '*.json'],
};
