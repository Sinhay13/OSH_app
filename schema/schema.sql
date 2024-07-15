-- chapters
CREATE TABLE IF NOT EXISTS chapters (
    id_chapter INTEGER PRIMARY KEY AUTOINCREMENT,
    tableName TEXT UNIQUE NOT NULL,
    image BLOB NOT NULL,
    schema TEXT NOT NULL DEFAULT 'CREATE TABLE IF NOT EXISTS {table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, country TEXT, city TEXT, message TEXT, id_tag INTEGER, FOREIGN KEY (id_tag) REFERENCES tags (id_tag))'
);

-- tags
CREATE TABLE IF NOT EXISTS tags (
    id_tag INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT UNIQUE
);

-- entry_tags
CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    tableName TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tags (id_tag),
    FOREIGN KEY (tableName) REFERENCES chapters (tableName),
    PRIMARY KEY (tag_id, tableName, entry_id)
);

-- remind
CREATE TABLE IF NOT EXISTS remind (
    id_remind INTEGER PRIMARY KEY AUTOINCREMENT,
    tableName TEXT NOT NULL,
    entry_id INTEGER NOT NULL, 
    date_remind TEXT NOT NULL,
    FOREIGN KEY (tableName) REFERENCES chapters (tableName),
    FOREIGN KEY (entry_id) REFERENCES entry_tags (entry_id)
);

-- Indexes
CREATE INDEX idx_tag_id ON entry_tags (tag_id);
CREATE INDEX idx_tableName ON entry_tags (tableName);
CREATE INDEX idx_id_remind ON remind (id_remind);
CREATE INDEX idx_entry_id ON entry_tags (entry_id);