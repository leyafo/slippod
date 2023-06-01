
const sqlSchema = `
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  entry TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT (strftime('%s', 'now')) NOT NULL,
  updated_at TIMESTAMP DEFAULT (strftime('%s', 'now')) NOT NULL 
);

CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
    entry, 
    content='cards', 
    content_rowid='id',
    tokenize='simple' 
);

CREATE TRIGGER IF NOT EXISTS cards_ai AFTER INSERT ON cards
    BEGIN
        INSERT INTO cards_fts (rowid, entry)
        VALUES (new.id, new.entry);
    END;

CREATE TRIGGER IF NOT EXISTS cards_ad AFTER DELETE ON cards
    BEGIN
        INSERT INTO cards_fts(cards_fts, rowid, entry)
        VALUES ('delete', old.id, old.entry);
    END;

CREATE TRIGGER IF NOT EXISTS cards_au AFTER UPDATE ON cards
    BEGIN
        INSERT INTO cards_fts(cards_fts, rowid, entry)
        VALUES ('delete', old.id, old.entry);
        INSERT INTO cards_fts (rowid, entry)
        VALUES (new.id, new.entry);
    END;

CREATE TABLE IF NOT EXISTS configurations(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    key TEXT,
    value TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_configurations_key on configurations(key);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  card_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  UNIQUE (tag, card_id), /*create tag index automatically*/
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
CREATE INDEX IF NOT EXISTS idx_tags_card_id on tags(card_id);

CREATE TABLE IF NOT EXISTS links(
  id INTEGER PRIMARY KEY,
  card_id INTEGER NOT NULL,
  link_id INTEGER NOT NULL,
  UNIQUE (link_id, card_id), /*create link index automatically*/
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
CREATE INDEX IF NOT EXISTS idx_links_card_id on links(card_id);
`;


module.exports.schema = sqlSchema