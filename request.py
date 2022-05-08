# send message to queue
# usage: python reuqest.py [message] [queue]
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

message = "BookRoom:101"
if len(sys.argv) > 1 and len(sys.argv[1]) > 0 :
    message = sys.argv[1]

queueName = "roomBooking"
if len(sys.argv) > 2 and len(sys.argv[2]) > 0 :
    queueName = sys.argv[2]

queueId = "/queue/" + queueName

conn.send(body=message, destination=queueId)
conn.disconnect()
print('sent :' + message + ": to " + queueId)

