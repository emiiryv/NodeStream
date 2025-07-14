

const pool = require('../db');

// Takip et
exports.followUser = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id, 10);

  if (followerId === followingId) {
    return res.status(400).json({ error: 'Kendinizi takip edemezsiniz' });
  }

  try {
    await pool.query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, followingId]
    );
    res.json({ message: 'Takip edildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Takip sırasında hata oluştu' });
  }
};

// Takibi bırak
exports.unfollowUser = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id, 10);

  try {
    await pool.query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    res.json({ message: 'Takipten çıkıldı' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Takipten çıkarken hata oluştu' });
  }
};

// Takip ediyor mu?
exports.checkFollowStatus = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      'SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    res.json({ following: result.rowCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Takip durumu alınamadı' });
  }
};