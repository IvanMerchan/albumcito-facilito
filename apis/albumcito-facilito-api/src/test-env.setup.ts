// Runs before test files import application code (Jest `setupFiles`), so
// PrismaService picks up the test database instead of the dev one. Kept as
// a literal (not read from .env.test) so it matches the DATABASE_URL the
// `pretest`/`pretest:e2e` scripts migrate against -- see package.json.
process.env.DATABASE_URL = 'file:./test.db';
