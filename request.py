# send message to queue
# usage: python reuqest.py [message] [queue]
# default queue is roomBooking
# the ActiveMQ prefix /queue/ will be added to the queue name

import time
import datetime
import sys
import json

import stomp

# state for correlation
requests = {}

message = "BookRoom:101"
if len(sys.argv) > 1 and len(sys.argv[1]) > 0 :
    message = sys.argv[1]

queueName = "roomBooking"
if len(sys.argv) > 2 and len(sys.argv[2]) > 0 :
    queueName = sys.argv[2]

priorityString = "1"
if len(sys.argv) > 3 and len(sys.argv[3]) > 0 :
    priorityString = sys.argv[3]


ackIfGood =  len(sys.argv) <= 4 or len(sys.argv[4]) == 0 
   

class ResultListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print('received an error "%s"' % frame.body)

    def on_message(self, frame):
        print('received a message "%s"' % frame.body)
        # test nack by rejecting some responses
        if not frame.body.startswith("book:"):
            print("unexpected response " + frame.body)
            conn.nack(frame.headers['message-id'], subscriptionId)
        else:
            print('headers  "%s"' % frame.headers)
            correlationId = frame.headers['correlation-id']
            # a unique id for this client subscribing
            subscription = frame.headers['subscription']
            print(json.dumps(requests))
            print ( "correlates: " + requests.get(correlationId, "no correlated request for " + correlationId))
            if ackIfGood:
                print("ack")
                conn.ack(frame.headers['message-id'], subscription)
            else:
                print("not acking")
            

conn = stomp.Connection()
conn.set_listener('', ResultListener())
conn.connect('admin', 'admin', wait=True)



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
conn.send(body=message+":two", destination=queueId, headers=headers)

print('sent to:' + queueId)
print(json.dumps(requests))

# a unique id for this client subscribing
subscriptionId = 67 

conn.subscribe(destination=responseQueueId, id=subscriptionId, ack='client-individual')
print('subscribed to ' + responseQueueId)

time.sleep(1000)
conn.disconnect()




