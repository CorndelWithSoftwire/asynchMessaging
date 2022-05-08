# subscribe to queue
# displays body and headers of received messages
# usage: python receive.py [queue] [selector]
# default queue is roomBooking
# the ActiveMQ prefix /queue/ will be added to the queue name
#
# the selector should be quoted so that the shell passes a single string
# any selector can be specified, for example "JMSPriority >= 3"

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

headers = {}
prioritySelector = ""
if len(sys.argv) > 2 and len(sys.argv[2]) > 0 :
    prioritySelector = sys.argv[2]
    headers['selector'] = prioritySelector

queueId = "/queue/" + queueName

conn.subscribe(destination=queueId, id=1, ack='auto', headers=headers)
print('subscribed to ' + queueId)
time.sleep(200)
conn.disconnect()
print('shutdown')

