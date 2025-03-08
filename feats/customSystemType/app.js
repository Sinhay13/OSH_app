
// Base queries //

// "active_tag_check": "SELECT result FROM system WHERE tag = ? AND result != 'blue' ORDER BY date DESC LIMIT 1;",
// "passive_tag_check": "SELECT COUNT(*) FROM (SELECT result FROM system WHERE tag = ? ORDER BY date DESC LIMIT 30) subquery WHERE result IN ('red', 'yellow');",
