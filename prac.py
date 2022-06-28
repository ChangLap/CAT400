
# import datetime
  
# # datetime(year, month, day, hour, minute, second)
# a = datetime.datetime(2017, 6, 21, 18, 25, 30)
# b = datetime.datetime(2017, 5, 16, 8, 21, 10)
  
# # returns a timedelta object
# c = a-b 
# print('Difference: ', c)
  
# # returns (minutes, seconds)
# minutes = divmod(c.total_seconds(), 60) 
# print(c.total_seconds())
# print('Total difference in minutes: ', minutes[0], 'minutes',
#                                  minutes[1], 'seconds')
# days = divmod(minutes[0], 60)
# print('Total difference in days: ', days[0], 'days', 
#                                     days[1], 'minutes',
#                                  minutes[1], 'seconds')
# # returns the difference of the time of the day (minutes, seconds)
# minutes = divmod(c.seconds, 60) 
# print('Total difference in minutes: ', minutes[0], 'minutes',
#                                  minutes[1], 'seconds')

# import firebase_admin
# from firebase_admin import credentials
# from firebase_admin import db
# from grpc import UnaryStreamMultiCallable

# # Fetch the service account key JSON file contents
# cred = credentials.Certificate('firebasePrivateKey.json')

# # Initialize the app with a service account, granting admin privileges
# firebase_admin.initialize_app(cred, {
#     'databaseURL': "https://fyp2022-5f79f-default-rtdb.asia-southeast1.firebasedatabase.app/"
# })

# ref = db.reference("/addressList")
# print(ref.get()) # {'keytest': 'Awesome Firebase'}
# print(ref.child('length').get())

# # {
# #     length: 3,
# #     0: USM,
# #     1: Queensbay,
# #     2: DTSP,
# # }
# jsonStuffs = {}
# jsonStuffs['length'] = '3'
# jsonStuffs['0'] = 'USM'
# jsonStuffs['1'] = 'Queensbay'
# jsonStuffs['2'] = 'DTSP'

# # input into firebase
# ref.set(jsonStuffs)

import pandas as pd
df = pd.read_parquet('C:/Users/chang/Desktop/yellow_tripdata_2016-02.parquet')
df.to_csv('C:/Users/chang/Desktop/yellow_tripdata_2016-02.csv')
