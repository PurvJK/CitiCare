function ok(res, body = { ok: true }) {
	return res.json(body);
}

function created(res, body = {}) {
	return res.status(201).json(body);
}

export function installDevStubs(app) {
	console.log('[dev-stubs] registering DBLESS stub routes for development');

	app.get('/api/health', (_req, res) => ok(res, { ok: true, dbless: true }));

	app.post('/api/auth/login', (_req, res) =>
		ok(res, {
			token: 'dev-token',
			user: { _id: 'dev-user-1', email: 'dev@local', full_name: 'Dev User', role: 'citizen' },
		})
	);

	app.get('/api/profile', (_req, res) =>
		ok(res, { _id: 'dev-user-1', email: 'dev@local', full_name: 'Dev User', role: 'citizen', created_at: new Date().toISOString() })
	);

	const emptyList = (_req, res) => ok(res, []);
	app.get('/api/departments', emptyList);
	app.get('/api/projects', emptyList);
	app.get('/api/documents', emptyList);
	app.get('/api/locations', emptyList);
	app.get('/api/settings', (_req, res) => ok(res, { site_name: 'CitiCare (dev)' }));
	app.get('/api/users', (_req, res) => ok(res, [{ _id: 'dev-user-1', full_name: 'Dev User', email: 'dev@local' }]));

	app.get('/api/complaints', (_req, res) =>
		ok(res, [
			{
				_id: 'c-dev-1',
				complaint_number: 'CMP-0000-00001',
				title: 'Pothole on Main St (dev)',
				description: 'Sample complaint to allow frontend to render lists',
				status: 'pending',
				priority: 'medium',
				created_at: new Date().toISOString(),
			},
		])
	);
	app.get('/api/complaints/:id', (req, res) =>
		ok(res, {
			_id: req.params.id,
			complaint_number: 'CMP-0000-00001',
			title: 'Pothole on Main St (dev)',
			description: 'Detailed sample complaint',
			status: 'pending',
			priority: 'medium',
			created_at: new Date().toISOString(),
		})
	);

	app.post('/api/complaints', (req, res) => created(res, { _id: 'c-dev-new', complaint_number: 'CMP-DEV-0001', ...(req.body || {}) }));
	app.put('/api/complaints/:id', (req, res) => ok(res, { _id: req.params.id, ...(req.body || {}) }));

	app.all('/api/*', (_req, res) => ok(res, { ok: true }));
}
