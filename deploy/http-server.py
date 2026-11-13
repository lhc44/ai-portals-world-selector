#!/usr/bin/env python3
# Static HTTP server for the built Portals World Selector website.
# Python 3.6+ compatible. Bind address/port can be customized before deployment.
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

class Handler(SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        '.js': 'text/javascript; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webmanifest': 'application/manifest+json',
        '.svg': 'image/svg+xml',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.html': 'text/html; charset=utf-8',
    })
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

class Server(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    Server(('0.0.0.0', 6868), Handler).serve_forever()
