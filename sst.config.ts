/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: 'nationalparkplanner',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			protect: ['production'].includes(input?.stage),
			home: 'aws'
		};
	},
	async run() {
		new sst.aws.SvelteKit('NationalParkPlanner', {
			domain: {
				name: 'nationalparkplanner.us',
				dns: sst.cloudflare.dns()
			},
			environment: {
				DATABASE_URL: process.env.DATABASE_URL || ''
			}
		});
	}
});
