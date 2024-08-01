module.exports = {
	apps: [
		{
			name: 'medi-fe',
			script: 'serve -s build',
			env: {
				PORT: 3000,
				NODE_ENV: 'production',
			},
		},
	],
}
