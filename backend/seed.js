const db = require('./db');
const { teams, samplePlayers, userAccounts } = require('./data');

async function seed() {
  if (!db.pool) {
    console.log('Postgres not configured — skipping seed');
    return;
  }

  console.log('Seeding database...');

  // Seed teams
  for (const t of teams) {
    await db.query(
      `INSERT INTO teams (id,name,color,light,emoji,budget) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, color=EXCLUDED.color, light=EXCLUDED.light, emoji=EXCLUDED.emoji, budget=EXCLUDED.budget`,
      [t.id, t.name, t.color, t.light, t.emoji, t.budget]
    );
  }

  // Seed players
  for (const p of samplePlayers) {
    const data = { ...p };
    delete data.id; delete data.name; delete data.role; delete data.country; delete data.basePrice;
    await db.query(
      `INSERT INTO players (id,name,role,country,base_price,data) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.role, p.country, p.basePrice, data]
    );
  }

  // Seed users
  for (const [email, acc] of Object.entries(userAccounts)) {
    await db.query(
      `INSERT INTO users (email,password,role,team_id,name) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      [email, acc.password, acc.role, acc.teamId, acc.name]
    );
  }

  console.log('Seeding complete');
}

module.exports = { seed };
