# due to Google Map API OVER_QUERY_LIMIT restriction
# this script is required to generate addresses and store in database beforehand
import pyodbc

print("Enter FROM and TO row")
frm = input("FROM: ")
to = input("TO: ")
conn_ori = pyodbc.connect('Driver={SQL Server};'
                        'Server=MSI\SQLEXPRESS;'
                        'Database=IMPORT;'
                        'Trusted_Connection=yes;')
                        
cursor = conn_ori.cursor()
cursor.execute('SELECT' 
      '[tpep_pickup_datetime]'
      ',[tpep_dropoff_datetime]'
      ',[pickup_longitude]'
      ',[pickup_latitude]'
      ',[dropoff_longitude]'
      ',[dropoff_latitude]'
      ',[trip_distance]'
      ',[total_amount]'
      ',[ID]'
  'FROM [IMPORT].[dbo].[yellow_tripdata_2016_01]'
  'WHERE ID BETWEEN ' + frm + ' AND ' + to)

arr_pickup_datetime = []
arr_dropoff_datetime = []
arr_pickup_latitude = []
arr_pickup_longitude = []
arr_dropoff_latitude = []
arr_dropoff_longitude = []
arr_trip_distance = []
arr_total_amount = []
arr_id = []

for i in cursor:
    arr_pickup_datetime.append(i.tpep_pickup_datetime)
    arr_dropoff_datetime.append(i.tpep_dropoff_datetime)
    arr_pickup_latitude.append(i.pickup_latitude)
    arr_pickup_longitude.append(i.pickup_longitude)
    arr_dropoff_latitude.append(i.dropoff_latitude)
    arr_dropoff_longitude.append(i.dropoff_longitude)
    arr_trip_distance.append(i.trip_distance)
    arr_total_amount.append(i.total_amount)
    arr_id.append(i.ID)



conn_dest = pyodbc.connect('Driver={SQL Server};'
                        'Server=MSI\SQLEXPRESS;'
                        'Database=FYP;'
                        'Trusted_Connection=yes;')