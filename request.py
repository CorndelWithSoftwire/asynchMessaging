# send message to queue
# usage: python reuqest.py [message] [queue]
# default queue is roomBooking
# the ActiveMQ prefix /queue/ will be added to the queue name

import time
import datetime
import sys
import json

import stomp

requests = {}


class ResultListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print('received an error "%s"' % frame.body)

    def on_message(self, frame):
        print('received a message "%s"' % frame.body)
        print('headers  "%s"' % frame.headers)
        correlationId = frame.headers['correlation-id']
        print(json.dumps(requests))
        print ( requests.get(correlationId, "no correlated request for " + correlationId))
            

conn = stomp.Connection()
conn.set_listener('', ResultListener())
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

responseQueueName = "roomResponse"
responseQueueId = "/queue/" + responseQueueName

headers = {}
headers['priority'] = priority
headers['reply-to'] = responseQueueName

# two different messages, testing corellation
requestId = str(datetime.datetime.now().timestamp())
headers['correlation-id'] = requestId
requests[requestId] = "one"
conn.send(body=message, destination=queueId, headers=headers)

requestId = str(datetime.datetime.now().timestamp())
headers['correlation-id'] = requestId
requests[requestId] = "two"
conn.send(body=message, destination=queueId, headers=headers)

print('sent to:' + queueId)
print(json.dumps(requests))

conn.subscribe(destination=responseQueueId, id=1, ack='auto', headers=headers)
print('subscribed to ' + responseQueueId)

time.sleep(100)
conn.disconnect()




