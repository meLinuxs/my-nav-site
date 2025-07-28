# cloudflare部署

1.创建D1数据库`my-nav-site`，到控制台依次输入命令并逐一执行

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

2.fork项目，到cloudflare创建pages连接Git仓库，选择构建目录`public`，点击部署。

3.绑定D1数据库，名称为`DB`,重新部署令数据库生效。

4.管理员密码默认`password123`，可变量`ADMIN_PASSWORD`修改或到index.html文件第225行修改。

5.添加网站可以到`https://favicon.im/zh/`获取网站图标。
