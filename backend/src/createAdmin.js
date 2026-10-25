const bcrypt = require('bcryptjs');
const db = require('./database');

async function createAdmin() {
  const name = 'Admin';
  const email = 'admin@autohub.com';
  const password = 'AdminPass123!';

  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email);

  if (existingUser) {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?")
      .run(existingUser.id);

    console.log('Existing account updated to administrator.');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'admin')
    `).run(name, email, hashedPassword);

    console.log('Administrator account created successfully.');
  }

  console.log('Email:', email);
  console.log('Password:', password);

  db.close();
}

createAdmin().catch((error) => {
  console.error('Unable to create administrator:', error);
  db.close();
  process.exitCode = 1;
});