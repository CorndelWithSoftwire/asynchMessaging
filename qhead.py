
import time
import sys

import stomp

class MyListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print('received an error "%s"' % frame.body)

    def on_message(self, frame):
        print('received a message "%s"' % frame.body)
        print('headers  "%s"' % frame.headers)

print('Connecting ...')
conn = stomp.Connection()
conn.set_listener('', MyListener())
conn.connect('admin', 'admin', wait=True)
print('Connected')
conn.subscribe(destination='/queue/test', id=1, ack='auto')
conn.send(body='   '.join(sys.argv[1:]), destination='/queue/test')
time.sleep(2)
conn.disconnect()
print('shutdown')

