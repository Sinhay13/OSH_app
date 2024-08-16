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
		is_principle INTEGER NOT NULL DEFAULT 0 CHECK (is_principle IN (0, 1)),
		principle_tag TEXT,
		active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
		is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
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
    remind_date TIMESTAMP NOT NULL,
    repeat TEXT NOT NULL DEFAULT 'none',
    FOREIGN KEY (entry_id) REFERENCES entries(entry_id)
);

-- system
CREATE TABLE IF NOT EXISTS system (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
	week TEXT NOT NULL,
    tag TEXT NOT NULL,
    observation TEXT DEFAULT 'none',
	result TEXT NOT NULL DEFAULT 'white' CHECK (result IN ('white','green', 'yellow', 'red','blue')),
    PRIMARY KEY (year, month, day, tag),
    FOREIGN KEY (tag) REFERENCES tags (tag)
);

-- Indexes
CREATE INDEX idx_chapter_name ON entries (chapter_name);
CREATE INDEX idx_tag ON entries (tag);
CREATE INDEX idx_date ON entries (date);
CREATE INDEX idx_date_remind ON reminds (remind_date);
CREATE INDEX idx_year_month ON system (year, month);
CREATE INDEX idx_year_month_tag_result ON system (year, month, tag, result);

