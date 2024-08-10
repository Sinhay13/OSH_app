-- chapters
CREATE TABLE IF NOT EXISTS chapters (
    chapter_name TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT UNIQUE,
    opened TIMESTAMP UNIQUE
);

-- tags
CREATE TABLE IF NOT EXISTS tags (
    tag TEXT PRIMARY KEY UNIQUE NOT NULL,
    filter TEXT  DEFAULT null
	FOREIGN KEY (filter) REFERENCES filters (filter)
);

-- filters
CREATE TABLE IF NOT EXISTS filters (
    filter TEXT PRIMARY KEY UNIQUE NOT NULL,
    comments TEXT NOT NULL DEFAULT 'none'
);

-- entries
CREATE TABLE IF NOT EXISTS entries (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_name TEXT NOT NULL,
    tag TEXT NOT NULL,
    date TEXT NOT NULL UNIQUE,
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
CREATE INDEX idx_entry_id ON remind (entry_id);
CREATE INDEX idx_date_remind ON remind (date_remind);