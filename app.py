from turtle import distance
from flask import Flask, render_template, jsonify
from flask import request
import pyodbc
import json
import urllib
import urllib.request
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from datetime import datetime, timedelta
import time
from calendar import month, monthrange
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


app = Flask(__name__)

# Fetch the service account key JSON file contents
cred = credentials.Certificate('firebasePrivateKey.json')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://fyp2022-5f79f-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

# url_for(refers to function name)
# url_for{"home"} --> /home
# url_for{"content1"} --> /content1
@app.route("/")
@app.route("/dashboard")
def index():
    return render_template('dashboard.html')

@app.route("/routeOptimization")
def firstPage():
    return render_template('routeOptimization.html')

@app.route("/dataVisualization")
def secondPage():
    return render_template('dataVisualization.html')

@app.route('/pickupAddress', methods=['POST'])
def returnPickupAddress():
    result = {}
    key = 'AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM'
    result['coordinates'] = []
    result['formatted_address'] = []

    # conn = pyodbc.connect('Driver={SQL Server};'
    #                     'Server=MSI\SQLEXPRESS;'
    #                     'Database=IMPORT;'
    #                     'Trusted_Connection=yes;')
    # cursor = conn.cursor()
    # cursor.execute('SELECT' 
    #     '[pickup_longitude]'
    #     ',[pickup_latitude]'
    #     'FROM [IMPORT].[dbo].[yellow_tripdata_2016_01]'
    #     'WHERE ID BETWEEN 1 AND 10')

    conn = pyodbc.connect('Driver={SQL Server};'
                        'Server=MSI\SQLEXPRESS;'
                        'Database=FYP;'
                        'Trusted_Connection=yes;')
                        
    cursor = conn.cursor()
    cursor.execute('SELECT' 
        '[pickup_latitude]'
        ',[pickup_longitude]'
        'FROM [FYP].[dbo].[ADDRESS]'
        'WHERE ID BETWEEN 1 AND 10')

    
    for i in cursor:
        
        temp = {
            'latitude': i.pickup_latitude,
            'longitude': i.pickup_longitude
        }

        #  geocoder request
        latlng = str(temp['latitude']) + ',' + str(temp['longitude'])
        request = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=' + key
        apiResult = urllib.request.urlopen(request).read()
        response = json.loads(apiResult)

        result['coordinates'].append(temp)
        result['formatted_address'].append(response['results'][0]['formatted_address'])

    return jsonify(result)
    
@app.route('/deliveryAddress', methods=['POST'])
def returnDeliveryAddress():
    result = {}
    key = 'AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM'
    result['coordinates'] = []
    result['formatted_address'] = []

    # conn = pyodbc.connect('Driver={SQL Server};'
    #                     'Server=MSI\SQLEXPRESS;'
    #                     'Database=IMPORT;'
    #                     'Trusted_Connection=yes;')
    # cursor = conn.cursor()
    # cursor.execute('SELECT' 
    #     '[dropoff_latitude]'
    #     ',[dropoff_longitude]'
    #     'FROM [IMPORT].[dbo].[yellow_tripdata_2016_01]'
    #     'WHERE ID BETWEEN 1 AND 10')

    conn = pyodbc.connect('Driver={SQL Server};'
                        'Server=MSI\SQLEXPRESS;'
                        'Database=FYP;'
                        'Trusted_Connection=yes;')
                        
    cursor = conn.cursor()
    cursor.execute('SELECT' 
        '[dropoff_latitude]'
        ',[dropoff_longitude]'
        'FROM [FYP].[dbo].[ADDRESS]'
        'WHERE ID BETWEEN 1 AND 10')

    for i in cursor:
        
        temp = {
            'latitude': i.dropoff_latitude,
            'longitude': i.dropoff_longitude
        }

        #  geocoder request
        latlng = str(temp['latitude']) + ',' + str(temp['longitude'])
        request = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=' + key
        apiResult = urllib.request.urlopen(request).read()
        response = json.loads(apiResult)

        result['coordinates'].append(temp)
        result['formatted_address'].append(response['results'][0]['formatted_address'])

    return jsonify(result)

@app.route('/optimisation', methods=['POST'])
def optimiseData():

    # receive address from ajax in js 
    list1 = request.form['pickupJS']
    list2 = request.form['deliveryJS']
    temp = request.form['num']
    currenttemp = request.form['currentJS']

    pickup = json.loads(list1)
    delivery = json.loads(list2)
    num = int(json.loads(temp))
    current = json.loads(currenttemp)

    # Instantiate the data problem.
    data = createData(pickup, delivery, num, current)

    # obtain distance matrix from the addresses
    temp = create_DistanceMatrix(data)

    # adding rows of data to allow vehicles to start and end at arbitrary locations
    distanceMatrix = edit_DistanceMatrix(temp)
    
    
    # place in data
    data['distance_matrix'] = distanceMatrix

    # [
    #     [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    #     [0, 0, 3533, 3898, 3905, 3605, 3995, 7017, 6586], 
    #     [0, 3483, 0, 1103, 1110, 1641, 1201, 4094, 2400], 
    #     [0, 3560, 1085, 0, 219, 565, 181, 5004, 3310], 
    #     [0, 3439, 1091, 219, 0, 813, 317, 5011, 3317], 
    #     [0, 3501, 1127, 574, 602, 0, 605, 5047, 3352], 
    #     [0, 3922, 911, 162, 303, 467, 0, 4831, 3137], 
    #     [0, 6176, 3435, 3800, 3807, 4338, 3898, 0, 1152], 
    #     [0, 5789, 3048, 3413, 3419, 3951, 3510, 1195, 0]
    # ]

    addresses = data['addresses']
    API_key = data['API_key']
    

    statusRoute, routeOutput = optimiseRoute(data)

    firebaseWriteAddresses(current, pickup, delivery, routeOutput)

    print(routeOutput)

    return jsonify({'status': statusRoute, 'route': routeOutput})


def createData(pickup, deliv, vehicle, currentAdd):
    data = {}
    data['API_key'] = 'AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM'
    data['addresses'] = []

    # set rider's location in addresses
    current = currentAdd.replace(" ", "+")
    current = current.replace("#", '%23')
    data['addresses'].append(current)

    for i in pickup:
        # replace ' ' to '+'
        temp = i.replace(" ", "+")
        temp = temp.replace("#", '%23')

        # adding addresses from js to data['addresses']
        data['addresses'].append(temp)
    
    for i in deliv:
        # replace ' ' to '+'
        # use url encoding for the strings
        temp = i.replace(" ", "+")
        temp = temp.replace("#", '%23')

        # adding addresses from js to data['addresses']
        data['addresses'].append(temp)

    data['pickups_deliveries'] = []

    # for i in range(len(pickup)):
    #     temp = []
    #     temp.append(i + 1 + vehicle)
    #     temp.append(len(pickup) + i + 1 + vehicle)
    #     data['pickups_deliveries'].append(temp)

    for i in range(len(pickup)):
        temp = []
        temp.append(i + 2)
        temp.append(len(pickup) + i + 2)
        data['pickups_deliveries'].append(temp)
    
    # according to user input
    data['num_vehicles'] = vehicle

    # yet to change
    data['starts'] = []
    for i in range(vehicle):
        if i == 0:
            data['starts'].append(1)
        else:
            data['starts'].append(0)
    

    # end at arbitrary location
    data['ends'] = []
    for i in range(vehicle):
        data['ends'].append(0)
    print(data['ends'])
    
    return data


def sendRequest(oriAddresses, destAddresses, API_key):
    # Build and send request for the given origin and destination addresses.
    request = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
    
    oriAddresses_String = buildAddress_String(oriAddresses)
    destAddresses_String = buildAddress_String(destAddresses)
     
    # EXAMPLE IN THIS CASE
    # https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial
    # &origins=puchong|cyberjaya|Klang,+Selangor|Putrajaya
    # &destinations=puchong|cyberjaya|Klang,+Selangor|Putrajaya
    # &key=AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM

    # merging ori and dest string to request string
    request = request + '&origins=' + oriAddresses_String + '&destinations=' + \
                destAddresses_String + '&key=' + API_key
    
    print(request)

    #changed this part from urllib.urlopen(request).read()
    jsonResult = urllib.request.urlopen(request).read()
    response = json.loads(jsonResult)
    
    return response

def buildAddress_String(addresses):
    # Build a pipe-separated string of addresses 
    addressString = ''

    # from or-tool docs
    # for i in range(len(addresses) - 1):
    #   address_str += addresses[i] + '|'
    # address_str += addresses[-1]

    for i in range(len(addresses)):
        if i == len(addresses):
            addressString += addresses[i]
        else:
            addressString += addresses[i] + '|'

    return addressString

def build_DistanceMatrix(response):
    distanceMatrix = []
    for row in response['rows']:
        # from OR-Tools documentation
        # row_list = [row['elements'][j]['distance']['value'] for j in range(len(row['elements']))]
        rowList = []
    
        for j in range(len(row['elements'])):
            rowList.append(row['elements'][j]['distance']['value'])

        distanceMatrix.append(rowList)

    return distanceMatrix

def create_DistanceMatrix(data):
    addresses = data['addresses']
    API_key = data['API_key']

    # Distance Matrix API only accepts 100 elements per request, so get rows in multiple requests.
    max_elements = 100
    num_addresses = len(addresses) # 4

    # Maximum number of rows that can be computed per request
    max_rows = max_elements // num_addresses # 100 // 4 = 25

    # num_addresses = q * max_rows + r
    q, r = divmod(num_addresses, max_rows)

    destAddress = addresses
    distanceMatrix = []

    # Send q requests, returning max_rows rows per request.
    for i in range(q):
        oriAddress = addresses[i * max_rows : (i + 1) * max_rows]
        response = sendRequest(oriAddress, destAddress, API_key)
        distanceMatrix += build_DistanceMatrix(response)

    # Get the remaining remaining r rows, if necessary.
    if r > 0:
        oriAddress = addresses[q * max_rows : q * max_rows + r]
        response = sendRequest(oriAddress, destAddress, API_key)
        distanceMatrix += build_DistanceMatrix(response)
    
    return distanceMatrix

def edit_DistanceMatrix(matrix):
    arr = []
    for i in range(len(matrix) + 1):
        arr.append(0)

    # add to first element of matrix
    matrix.insert(0, arr)
    
    # add 0 to every first element of the array, starting from second element
    for j in range(1, len(matrix)):
        matrix[j].insert(0, 0)
    
    return matrix

def printSolution(data, manager, routing, solution):
    # Print solution
    print(f'Objective: {solution.ObjectiveValue()}')

    max_route_distance = 0

    # output in array format, and status for each vehicle
    output = []
    status = []
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        
        # temporary row for output
        tempRow = [] 

        # placing vehicle id into {}
        plan_output = 'Route for vehicle {}:\n'.format(vehicle_id)

        route_distance = 0

        while not routing.IsEnd(index):
            plan_output += ' {} -> '.format(manager.IndexToNode(index))
            previous_index = index
            
            # add into temporary rowlist of outcome
            tempRow.append(manager.IndexToNode(index))

            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id)
        
        plan_output += '{}\n'.format(manager.IndexToNode(index))
        plan_output += 'Distance of the route: {}m\n'.format(route_distance)
        print(plan_output)

        # last item to put into tempRow
        tempRow.append(manager.IndexToNode(index))
        status.append("OK!")

        # item to put into output
        output.append(tempRow)

        max_route_distance = max(route_distance, max_route_distance)

    print('Maximum of the route distances: {}m'.format(max_route_distance))
    
    return status, output

def optimiseRoute(data):

    # Create the routing index manager.
    # modified 
    # solver's internal indices to the numbers for locations
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), 
                                            data['num_vehicles'], data['starts'],
                                            data['ends'])
    # Create Routing Model.
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        # Returns the distance between the two nodes.
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc.
    # in other words, the cost of the edge (or arc) joining them in the graph 
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add Distance constraint.
    # computes the cumulative distance traveled by each vehicle along its route.
    dimension_name = 'Distance'
    routing.AddDimension(
        transit_callback_index,
        0,  # no slack
        70000,  # vehicle maximum travel distance
        True,  # start cumul to zero
        dimension_name)
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)

    # Define Transportation Requests.
    # added from pickup and deliveries
    for request in data['pickups_deliveries']:
        pickup_index = manager.NodeToIndex(request[0])
        delivery_index = manager.NodeToIndex(request[1])

        # Pick up and delivery constraint
        # creates a pickup and delivery request for an item.
        routing.AddPickupAndDelivery(pickup_index, delivery_index)

        # adds the requirement that each item must be picked up and delivered by the same vehicle.
        routing.solver().Add(
            routing.VehicleVar(pickup_index) == routing.VehicleVar(
                delivery_index))
        # requirement that each item must be picked up before it is delivered
        routing.solver().Add(
            distance_dimension.CumulVar(pickup_index) <=
            distance_dimension.CumulVar(delivery_index))
    
    # this could change
    # Setting first solution heuristic as search option 
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    
    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)

    # Print solution on console.
    if solution:
        status, route = printSolution(data, manager, routing, solution)
        return status, route
    else:
        print('No solution found!')

############################################################################################################
################################################# Firebase #################################################
############################################################################################################
@app.route('/firebaseWrite', methods=['POST'])
def firebaseWrite():
    
    firebaseItems = request.form['someData']

    items = json.loads(firebaseItems)

    ref = db.reference("/addressList/rider1")
    ref.set(items)

    return jsonify('Success')

@app.route('/firebaseRead', methods=['POST'])
def firebaseRead():
    
    ref = db.reference("/coordinate/rider1")
    coor = ref.get()

    return jsonify(coor)

@app.route('/firebaseReadandConvert', methods=['POST'])
def firebaseReadandConvert():
    
    key = 'AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM'

    # read coordinates from firebase
    ref = db.reference("/coordinate/rider1")
    coor = ref.get()
    latlng = '' + coor['lat'] + ',' + coor['long']
    
    request = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=' + key
    apiResult = urllib.request.urlopen(request).read()
    response = json.loads(apiResult)

    result = response['results'][0]['formatted_address']

    return jsonify(result)

def firebaseWriteAddresses(current, pickup, dest, result):
    addressList = []

    addressList.append(current)
    for i in pickup:
        addressList.append(i)
    for i in dest:
        addressList.append(i)
    
    currentList = []
    route = result[0]
    routeLength = 0
    
    ref = db.reference('addressList/rider1')
    ref.delete()

    for i in range(len(route)):
        if (route[i] == 0):
            continue
        ref.child(str(routeLength)).set('' + addressList[i])
        routeLength += 1

    ref.child('length').set(str(routeLength))

############################################################################################################
##################################### Data Visualization and Reporting #####################################
############################################################################################################


@app.route('/chartDatabase', methods=['POST'])
def retrieveData(): 

    monthFromJs = request.form['pyMonth']
    yearFromJs = request.form['pyYear']

    conn = pyodbc.connect('Driver={SQL Server};'
                        'Server=MSI\SQLEXPRESS;'
                        'Database=FYP;'
                        'Trusted_Connection=yes;')

    database = {}
    database['pickup_datetime'] = []
    database['delivery_datetime'] = []
    database['trip_distance'] = []
    database['total_amount'] = []

    output = {}
    output['label'] = []
    output['duration'] = []
    output['distance'] = []
    output['amount'] =[]

    year = int(yearFromJs)
    month = int(monthFromJs)

    cursor = conn.cursor()
    cursor.execute('SELECT' 
        '[tpep_pickup_datetime]'
        ',[tpep_dropoff_datetime]'
        ',[trip_distance]'
        ',[total_amount]'
        'FROM [FYP].[dbo].[IMPORTED_DATA]')
        # 'WHERE ID BETWEEN 1 AND 10000')
    
    # number of days
    days = monthrange(year, month)[1]

    #first date of the month
    d = datetime(year, month, 1)

    for i in range(days):

        # generate list of days
        diff = timedelta(days=i)
        x = d + diff
        output['label'].append(x.strftime("%d %b %Y"))
        output['month'] = x.strftime("%B")

        output['duration'].append(0)
        output['distance'].append(0)
        output['amount'].append(0)

    count = 0
    for i in cursor:
        temp = changeDatetime(str(i[0]))
        if temp.month == month:
            database['pickup_datetime'].append(str(i[0]))
            database['delivery_datetime'].append(str(i[1]))
            database['trip_distance'].append(str(i[2]))
            database['total_amount'].append(str(i[3]))
            count = count + 1

    # add the numbers into particular index according to pickup.day
    for i in range(count):
        pickup = changeDatetime(database['pickup_datetime'][i])
        delivery = changeDatetime(database['delivery_datetime'][i])
        distance = float(database['trip_distance'][i])
        amount = float(database['total_amount'][i])

        diff = delivery - pickup
        
        # save total seconds instead
        output['duration'][pickup.day - 1] = output['duration'][pickup.day - 1] + diff.total_seconds()
        output['distance'][pickup.day - 1] = output['distance'][pickup.day - 1] + distance
        output['amount'][pickup.day - 1] = output['amount'][pickup.day - 1] + amount

    output['minDuration'] = min(output['duration'])
    output['minDurationDate'] = output['duration'].index(output['minDuration'])
    output['maxDuration'] = max(output['duration'])
    output['maxDurationDate'] = output['duration'].index(output['maxDuration'])
    output['avgDuration'] = sum(output['duration']) / len(output['duration'])


    output['minDistance'] = min(output['distance'])
    output['minDistanceDate'] = output['distance'].index(output['minDistance'])
    output['maxDistance'] = max(output['distance'])
    output['maxDistanceDate'] = output['distance'].index(output['maxDistance'])
    output['avgDistance'] = sum(output['distance']) / len(output['distance'])

    
    output['minAmount'] = min(output['amount'])
    output['minAmountDate'] = output['amount'].index(output['minAmount'])
    output['maxAmount'] = max(output['amount'])
    output['maxAmountDate'] = output['amount'].index(output['maxAmount'])
    output['avgAmount'] = sum(output['amount']) / len(output['amount'])


    return jsonify(output)

def changeDatetime(string):
    string_temp = datetime.strptime(string,'%Y-%m-%d %H:%M:%S.0%f')
    return string_temp

# this is required function for running web server
if __name__ == "__main__":
    app.run(debug=True)