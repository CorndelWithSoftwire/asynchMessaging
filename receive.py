# subscribe to queue
# displays body and headers of received messages
# usage: python receive.py [queue]
# default queue is roomBooking
# the ActiveMQ prefix /queue/ will be added to the queue name

import time
import sys

import stomp

class MyListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print('received an error "%s"' % frame.body)

    def on_message(self, frame):
        print('received a message "%s"' % frame.body)
        print('headers  "%s"' % frame.headers)

conn = stomp.Connection()
conn.set_listener('', MyListener())
conn.connect('admin', 'admin', wait=True)

queueName = "roomBooking"
if len(sys.argv) > 1 and len(sys.argv[1]) > 0 :
    queueName = sys.argv[1]

queueId = "/queue/" + queueName

conn.subscribe(destination=queueId, id=1, ack='auto')
print('subscribed to ' + queueId)
time.sleep(200)
conn.disconnect()
print('shutdown')

