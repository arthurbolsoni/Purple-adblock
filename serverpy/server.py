import http.server
import socketserver
from urllib.parse import urlparse
from urllib.parse import parse_qs
import requests
from live_url import get_live_stream
import ssl

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):           
        self.send_header('Access-Control-Allow-Origin', '*')                
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        print("200 for OPTIONS")
        self.send_response(200, "ok")  
        
    def do_GET(self):

        # Extract query param
        query_components = parse_qs(urlparse(self.path).query)
        if 'ping' in query_components:
            ping = query_components["ping"][0]

            if ping == "pong":
                self.send_response(200)

                # Setting the header
                self.send_header("access-control-allow-origin", "*")
                self.send_header("cache-control", "no-cache,no-store")

                # Whenever using 'send_header', you also have to call 'end_headers'
                self.end_headers()
                        
                self.wfile.write(bytes("ok", "utf8"))
                return

        name = ""
        query_components = parse_qs(urlparse(self.path).query)
        if 'channel' in query_components:
            name = query_components["channel"][0]

        #i taked this proxys on http://www.freeproxylists.net/ or https://proxy6.net. i think do a script for auto take in another sites e creat a list for requests. or a server private in russia or another country withot ads.
        proxy = ""
        proxyhttps = ""

        #call the twitch api to get
        url = get_live_stream(name,proxy,proxyhttps)

        print(url)
        
        # it work with onlu http too, i dont why. 
        r = requests.get(url, proxies={"http": proxy})
        
        # Sending an '200 OK' response
        self.send_response(200)

        # Setting the header
        self.send_header("Content-type", "application/json")
        self.send_header("access-control-allow-origin", "*") 
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header("cache-control", "no-cache,no-store")
        self.send_header("content-length", len(r.text))
        self.send_header("server", "nginx/1.14.1")

        # Whenever using 'send_header', you also have to call 'end_headers'
        self.end_headers()

        # Writing the HTML contents with UTF-8
        self.wfile.write(bytes(r.text, "utf8"))

        return

# Create an object of the above class
handler_object = MyHttpRequestHandler

PORT = 8000
httpd = http.server.HTTPServer(('localhost', 4443), handler_object)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./server.pem', server_side=True)
httpd.serve_forever()