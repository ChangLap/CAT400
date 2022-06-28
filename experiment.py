from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import time

data = {}
data['API_key'] = 'AIzaSyCBbOViqvY-PdWMo3zROZyQVRo337k7QTM'

data['pickups_deliveries'] = [
    [1, 11], 
    [2, 12], 
    [3, 13], 
    [4, 14], 
    [5, 15], 
    [6, 16], 
    [7, 17], 
    [8, 18], 
    [9, 19], 
    [10, 20]
]

data['num_vehicles'] = 4
data['starts'] = [0, 0,0,0]
data['ends'] = [0, 0,0,0]

data['distance_matrix'] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 959, 7434, 2103, 6127, 1462, 2251, 1603, 9363, 1469, 792, 7269, 9069, 17387, 3325, 14273, 7535, 2899, 18064, 10269], 
    [0, 989, 0, 10678, 2028, 9489, 1963, 2176, 2568, 8966, 2309, 398, 6409, 8672, 16570, 4365, 14283, 9991, 4026, 17667, 9452], 
    [0, 6706, 6781, 0, 4840, 18049, 11278, 4950, 12006, 17527, 5809, 6757, 7468, 17233, 4225, 13470, 16227, 18552, 12230, 26228, 2525], 
    [0, 1825, 2153, 5494, 0, 12286, 2979, 148, 3584, 11763, 962, 2128, 5543, 11469, 8647, 5450, 14302, 12788, 5042, 20464, 5169], 
    [0, 5762, 7994, 16978, 10605, 0, 7542, 10754, 4911, 2677, 10797, 8251, 13442, 1777, 22870, 2885, 10549, 1582, 4784, 12774, 15752], 
    [0, 1695, 2011, 11593, 3155, 5273, 0, 3303, 605, 7642, 3327, 1844, 8464, 7348, 17485, 2471, 12811, 6681, 2063, 16343, 10367], 
    [0, 1677, 2004, 5345, 229, 12137, 2831, 0, 3436, 11615, 814, 1980, 5395, 11321, 8498, 5302, 14154, 12639, 4894, 20316, 5021], 
    [0, 1865, 2182, 11764, 3326, 5130, 757, 3474, 0, 7499, 3498, 2015, 8321, 7205, 17656, 2328, 12668, 6538, 1920, 16200, 10538], 
    [0, 9448, 8995, 17978, 11606, 1970, 8543, 11754, 7730, 0, 11798, 9252, 16280, 1398, 23870, 4855, 7946, 2298, 8537, 9700, 16752], 
    [0, 1768, 2433, 5965, 861, 7986, 3145, 1010, 3462, 12043, 0, 2408, 6028, 11749, 12418, 5184, 14787, 11604, 4979, 20744, 5546], 
    [0, 1069, 1111, 10920, 2255, 9094, 1565, 2404, 2168, 8571, 2428, 0, 9537, 8277, 16812, 3967, 13884, 9596, 3631, 17272, 9694], 
    [0, 10366, 6247, 8067, 5404, 12966, 9249, 5552, 8962, 17024, 6475, 6647, 0, 17896, 15138, 10166, 9686, 19216, 9822, 21789, 8466], 
    [0, 9551, 9097, 18081, 11708, 1755, 8645, 11856, 7832, 894, 11900, 9354, 14545, 0, 23972, 4640, 8367, 2088, 8639, 10121, 16855], 
    [0, 9451, 9526, 3863, 7585, 25221, 10605, 7695, 19178, 24699, 8553, 9501, 10213, 24405, 0, 20642, 18972, 25723, 16451, 33400, 5782], 
    [0, 2877, 4210, 13729, 5354, 3267, 2512, 5502, 2025, 5301, 4651, 4043, 9689, 4401, 19620, 0, 7086, 4675, 1898, 15988, 12503], 
    [0, 13714, 14022, 16668, 14005, 10789, 12597, 14153, 12310, 8936, 15338, 13855, 9572, 9807, 23740, 7028, 0, 11128, 13170, 13701, 17067], 
    [0, 7658, 9890, 18873, 12501, 2657, 9438, 12649, 6807, 3233, 12693, 10147, 15338, 2486, 24765, 4780, 11254, 0, 7994, 11194, 17647], 
    [0, 2851, 4184, 13704, 5328, 5237, 2489, 5476, 2002, 7270, 4552, 4017, 9667, 6412, 16019, 1900, 14014, 4628, 0, 15839, 12478], 
    [0, 18131, 17678, 26661, 20288, 12163, 17225, 20437, 16413, 10310, 20480, 17935, 22311, 11181, 32553, 15658, 13976, 12042, 16078, 0, 25435], 
    [0, 7260, 7334, 2163, 5393, 17559, 10787, 5542, 11515, 17036, 6684, 7310, 8388, 16743, 8256, 12980, 17147, 18061, 17287, 25738, 0],
]


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
        routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC)
    # search_parameters.local_search_metaheuristic = (
    #     routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC)
    # search_parameters.time_limit.seconds = 30
    # search_parameters.log_search = True
    
    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)

    # Print solution on console.
    if solution:
        status, route = printSolution(data, manager, routing, solution)
        return status, route
    else:
        print('No solution found!')

start = time.time()
status, route = optimiseRoute(data)
end = time.time()
print(end - start)