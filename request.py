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

priorityString = "1"
if len(sys.argv) > 3 and len(sys.argv[3]) > 0 :
    priorityString = sys.argv[3]

priority = 1
try:
    priority = int(priorityString)
except ValueError:
    print(f"{priorityString} is not a valid integer, using default {priority}.")
    
queueId = "/queue/" + queueName

headers = {}
headers['priority'] = priority
headers['djna'] = "wibble"

conn.send(body=message, destination=queueId, headers=headers)
conn.disconnect()
print('sent :' + message + ": to " + queueId)

