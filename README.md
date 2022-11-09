<h1>CAT400 Food Delivery Order Dispatching System</h1>

This web application is built by using Flask Python and Google OR-Tools as optimization tools to solve Vehicle Routing Problem (VRP). The goal is to find optimal routes for multiple vehicles that visit a list of location. 

Three modules are being implemented, which are Route Optimization Module, Data Visualization and Reporting Module and Live Map Module

<h4>Route Optimization Module</h4>
This module implements and integrates Google OR-Tools API into Google Map to generate route, depending on number of vehicles. It will receive set of input orders ( with pickup and delivery coordinate ) and generate optimized route with hightlighted routes on Google Map with Google Direction API and Google Distance Matrix API. 

<h4>Data Visualization and Reporting Module</h4>
This is the graphical view of the delivery record. Filter on years and months is available to user to generate desire period to view the graphs. 

<h4>Live Map Module</h4>
Live Map module implements Google Marker to constantly update the rider's current location on web application based on the information retrived thru mobile application. Mobile application serves as the rider's side of view, which rider will use it to show the optimized route on the mobile application and send his or her current location to Firebase Realtime database. Web application will capture the location and display it in the webpage. 

