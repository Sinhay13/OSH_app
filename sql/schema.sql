-- chapters
CREATE TABLE IF NOT EXISTS chapters (
    chapter_name TEXT PRIMARY KEY,
    title TEXT UNIQUE,
    opened TIMESTAMP NOT NULL
);

-- tags
	CREATE TABLE IF NOT EXISTS tags (
		tag TEXT PRIMARY KEY,
		comment TEXT  DEFAULT 'none',
		principle TEXT NOT NULL DEFAULT 'none' CHECK (principle IN ('none','will', 'vitality', 'family','progress')),
		active INTEGER NOT NULL DEFAULT 1,
		created_time TIMESTAMP NOT NULL,
		updated_time TIMESTAMP NOT NULL
	);

-- entries
CREATE TABLE IF NOT EXISTS entries (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_name TEXT NOT NULL,
    tag TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    message TEXT NOT NULL,
    FOREIGN KEY (chapter_name) REFERENCES chapters(chapter_name),
    FOREIGN KEY (tag) REFERENCES tags(tag)
);

-- reminds
CREATE TABLE IF NOT EXISTS reminds (
    remind_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL, 
    date_remind TIMESTAMP NOT NULL,
    repeat TEXT NOT NULL DEFAULT 'none',
    FOREIGN KEY (entry_id) REFERENCES entries(entry_id)
);

-- Indexes
CREATE INDEX idx_chapter_name ON entries (chapter_name);
CREATE INDEX idx_tag ON entries (tag);
CREATE INDEX idx_date ON entries (date);
CREATE INDEX idx_entry_id ON reminds (entry_id);
CREATE INDEX idx_date_remind ON reminds (date_remind);
CREATE INDEX idx_repeat ON reminds (repeat);