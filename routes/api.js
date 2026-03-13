const router = require('express').Router();
const db = require('../database');
const { adminOnly } = require('../middleware/auth');

// ── Events ─────────────────────────────────────────────────────
router.get('/events', (req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY event_date ASC').all());
});

router.post('/events', adminOnly, (req, res) => {
  const { title, description, event_type, location, event_date, event_time } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Title and date required' });
  const r = db.prepare(`INSERT INTO events (title,description,event_type,location,event_date,event_time)
    VALUES (?,?,?,?,?,?)`).run(title, description||'', event_type||'exhibition', location||'', event_date, event_time||'');
  res.status(201).json(db.prepare('SELECT * FROM events WHERE id=?').get(r.lastInsertRowid));
});

router.put('/events/:id', adminOnly, (req, res) => {
  const { title, description, event_type, location, event_date, event_time } = req.body;
  db.prepare(`UPDATE events SET title=?,description=?,event_type=?,location=?,event_date=?,event_time=? WHERE id=?`)
    .run(title, description, event_type, location, event_date, event_time, req.params.id);
  res.json(db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id));
});

router.delete('/events/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Artists (public users) ─────────────────────────────────────
router.get('/artists', (req, res) => {
  const users = db.prepare(`SELECT u.id,u.uuid,u.name,u.major,u.year,u.bio,u.avatar_url,
    (SELECT COUNT(*) FROM artworks WHERE user_id=u.id AND status='approved') as artwork_count
    FROM users u WHERE u.role='student'
    ORDER BY artwork_count DESC`).all();
  res.json(users);
});

router.get('/artists/:uuid', (req, res) => {
  const u = db.prepare(`SELECT id,uuid,name,major,year,bio,avatar_url,created_at FROM users WHERE uuid=? AND role='student'`).get(req.params.uuid);
  if (!u) return res.status(404).json({ error: 'Not found' });
  const artworks = db.prepare(`SELECT * FROM artworks WHERE user_id=? AND status='approved' ORDER BY created_at DESC`).all(u.id);
  res.json({ ...u, artworks });
});

// ── Admin ──────────────────────────────────────────────────────
router.get('/admin/stats', adminOnly, (req, res) => {
  res.json({
    users: db.prepare("SELECT COUNT(*) as c FROM users WHERE role='student'").get().c,
    artworks: db.prepare("SELECT COUNT(*) as c FROM artworks").get().c,
    pending: db.prepare("SELECT COUNT(*) as c FROM artworks WHERE status='pending'").get().c,
    approved: db.prepare("SELECT COUNT(*) as c FROM artworks WHERE status='approved'").get().c,
    rejected: db.prepare("SELECT COUNT(*) as c FROM artworks WHERE status='rejected'").get().c,
    likes: db.prepare("SELECT COUNT(*) as c FROM likes").get().c,
    comments: db.prepare("SELECT COUNT(*) as c FROM comments").get().c,
    events: db.prepare("SELECT COUNT(*) as c FROM events").get().c,
  });
});

router.get('/admin/artworks', adminOnly, (req, res) => {
  const { status } = req.query;
  let q = `SELECT a.*, u.name as author_name, u.email as author_email,
    (SELECT COUNT(*) FROM likes WHERE artwork_id=a.id) as likes
    FROM artworks a JOIN users u ON a.user_id=u.id`;
  const params = [];
  if (status) { q += ' WHERE a.status=?'; params.push(status); }
  q += ' ORDER BY a.created_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.get('/admin/users', adminOnly, (req, res) => {
  const users = db.prepare(`SELECT u.*,
    (SELECT COUNT(*) FROM artworks WHERE user_id=u.id) as artwork_count
    FROM users u ORDER BY u.created_at DESC`).all();
  res.json(users.map(({ password, ...u }) => u));
});

router.patch('/admin/artworks/:id/status', adminOnly, (req, res) => {
  const { status, featured } = req.body;
  db.prepare('UPDATE artworks SET status=?, featured=COALESCE(?,featured) WHERE id=?')
    .run(status, featured != null ? Number(featured) : null, req.params.id);
  res.json({ ok: true });
});

router.delete('/admin/users/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM users WHERE id=? AND role!=?').run(req.params.id, 'admin');
  res.json({ ok: true });
});

module.exports = router;
