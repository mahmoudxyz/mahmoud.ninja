#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.parse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Parse the URL
        parsed_path = urllib.parse.urlparse(self.path)
        file_path = parsed_path.path
        
        # Remove leading slash and decode
        if file_path.startswith('/'):
            file_path = file_path[1:]
        
        file_path = urllib.parse.unquote(file_path)
        
        # If no file extension and not empty, try adding .html
        if file_path and '.' not in os.path.basename(file_path):
            file_path += '.html'
        
        # Default to index.html for root
        if not file_path:
            file_path = 'index.html'
        
        # Check if file exists
        if os.path.isfile(file_path):
            self.path = '/' + file_path
            return super().do_GET()
        
        # Check if it's a directory with index.html
        if os.path.isdir(file_path):
            index_path = os.path.join(file_path, 'index.html')
            if os.path.isfile(index_path):
                self.path = '/' + index_path
                return super().do_GET()
        
        # File not found - serve 404.html
        if os.path.isfile('404.html'):
            self.path = '/404.html'
            # Set 404 status but serve the custom page
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            with open('404.html', 'rb') as f:
                self.wfile.write(f.read())
        else:
            # Fallback to default 404
            self.send_error(404, "File not found")

def run_server(port=8000):
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Development server running at http://localhost:{port}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"❌ Custom 404 page: {'✅ Found' if os.path.isfile('404.html') else '❌ Missing'}")
            print("Press Ctrl+C to stop the server\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"python dev-server.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)