# cloudflare部署

1.创建D1数据库，到控制台依次输入命令并执行

```
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```
```
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('sidebar', 'topbar'))
);
```
```
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE 
);
```
```
INSERT INTO settings (key, value) VALUES ('backgroundUrl', 'https://img.8888.vvvv.ee/file/图片/1753684532153.gif');
```
```
ALTER TABLE categories ADD COLUMN displayOrder INTEGER;
```
