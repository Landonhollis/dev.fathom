const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const pagesDir = path.join(rootDir, 'pages');
const publicDir = path.join(rootDir, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8'
};

function isSafePath(resolvedPath, basePath) {
  const relative = path.relative(basePath, resolvedPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function serveFile(res, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function resolveRouteFile(requestPath) {
  const cleanPath = requestPath === '/' ? '/' : requestPath.replace(/\/+$/, '');
  const trimmed = cleanPath.replace(/^\/+/, '');
  const candidate = path.join(pagesDir, trimmed || '');

  if (!trimmed) {
    return path.join(pagesDir, 'index.html');
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, 'index.html');
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  const indexRoute = path.join(pagesDir, trimmed, 'index.html');
  if (fs.existsSync(indexRoute) && fs.statSync(indexRoute).isFile()) {
    return indexRoute;
  }

  return path.join(pagesDir, '404.html');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/public/') || pathname === '/styles.css' || pathname === '/script.js') {
    const publicPath = pathname === '/styles.css'
      ? path.join(publicDir, 'styles.css')
      : pathname === '/script.js'
        ? path.join(publicDir, 'script.js')
        : path.join(publicDir, pathname.replace(/^\/public\//, ''));

    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      serveFile(res, publicPath);
      return;
    }
  }

  const routeFile = resolveRouteFile(pathname);

  if (!isSafePath(path.resolve(routeFile), path.resolve(pagesDir))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(routeFile) || !fs.statSync(routeFile).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.readFile(path.join(pagesDir, '404.html'), (err, data) => {
      if (err) {
        res.end('Not Found');
        return;
      }
      res.end(data);
    });
    return;
  }

  serveFile(res, routeFile);
});

server.listen(PORT, () => {
  console.log(`Brand mockup server running at http://localhost:${PORT}`);
});
