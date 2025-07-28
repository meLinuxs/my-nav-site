# 关于项目

一、项目核心特点与功能
这个导航站项目最大的特点是完全构建于 Cloudflare 的生态系统之上，实现了真正的“全栈无服务器化”，集高性能、高安全性和零成本于一身。

技术架构先进

全栈 Cloudflare 生态：前端使用 Cloudflare Pages，后端 API 使用 Cloudflare Functions，数据库使用 Cloudflare D1。整个项目无需管理任何服务器。

前后端分离：界面（HTML）与逻辑（API）完全分离，代码结构清晰，易于维护和扩展。

数据库驱动：所有网站、分类和设置都存储在 D1 数据库中，实现了完全的动态化管理，而非写死在代码里。

强大的后台管理功能

动态内容管理：提供密码保护的管理面板，可以方便地添加、删除网站链接和分类。

分类拖拽排序：在管理面板中，可以通过拖拽直观地调整侧边栏和顶部栏分类的显示顺序，并一键保存。

自动图标获取：添加网站时，只需输入网址，系统会自动尝试抓取网站的 favicon 图标，简化操作。

优秀的用户体验

多语言支持：内置中英双语一键切换，并能记住用户的语言偏好。

白天/黑夜模式：支持浅色和深色两种主题，同样可以自动保存用户的选择。

动态背景：支持在后台更换全局背景图片，并集成了优雅的樱花飘落动态特效，美观且独特。

实时搜索：顶部的搜索框可以即时筛选所有网站，快速定位。

完全响应式设计：无论在电脑、平板还是手机上，都能获得完美的访问体验。

二、与其他导航站对比
为了更好地理解本项目的优势，我们可以将它与市面上常见的两类导航站进行对比：传统的静态导航站和商业化在线服务。

特性 (Feature)

本项目 (This Project)

传统静态导航站 (Static Sites)

商业化在线服务 (e.g., start.me)

部署与维护

极简。推送到 GitHub，Cloudflare 自动完成所有部署，无需服务器维护。

简单。但修改内容需要手动编辑 HTML 或 JSON 文件并重新部署，对非技术人员不友好。

无需部署。但完全依赖服务商，受其平台规则、价格和稳定性限制。

数据所有权与隐私

100% 自主可控。所有数据都在您自己的 D1 数据库中，隐私性极高。

100% 自主可控。数据在您自己的代码文件中。

数据存储在服务商的服务器上，您无法完全控制，存在隐私和数据安全风险。

定制化程度

极高。您拥有全部源代码，可以修改任何细节，添加任何想要的功能（如我们增加的排序和特效）。

很高。同样拥有源代码，但通常功能非常基础，二次开发工作量大。

有限。通常只能在服务商提供的框架内选择主题、布局和插件。

核心功能

强大且均衡。拥有数据库、管理面板、多语言、主题切换等动态功能，媲美商业服务。

非常基础。通常只是一个静态链接列表，不具备后台管理和用户个性化设置。

功能丰富。可能包含 RSS、笔记、团队协作等，但对个人用户而言可能过于臃肿。

使用成本

几乎为零。Cloudflare 的免费额度完全足够支撑此项目的运行。

免费。可以托管在 GitHub Pages 或 Cloudflare Pages 等平台。

通常有功能受限的免费版，完整功能需要按月或按年付费。

访问性能

全球顶尖。基于 Cloudflare 的全球边缘网络，在世界任何地方访问都极快。

很快。静态文件加载速度通常都很快。

性能不一。取决于服务商的服务器质量和负载情况。

总结
总而言之，这个项目为您提供了一个兼具静态网站的简洁、高性能和商业服务的强大动态功能的完美解决方案。它不仅完全免费、保护隐私，还给予了您百分之百的定制自由，是打造个性化、现代化个人导航主页的绝佳选择。





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
