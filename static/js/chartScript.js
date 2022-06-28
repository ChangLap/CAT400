$(document).ready(function () {

    var jsonOutput = {}
    jsonOutput.label = []
    jsonOutput.duration = []
    jsonOutput.distance = []
    jsonOutput.amount = []

    var chart1;
    var chart2;
    var chart3;
    graphs();

    var minDuration, minDurationDate, maxDuration, maxDurationDate, avgDuration;
    var minDistance, minDistanceDate, maxDistance, maxDistanceDate, avgDistance;
    var minAmount, minAmountDate, maxAmount, maxAmountDate, avgAmount;
    var month;


    $('#confirmButton').click(function () {
        var jsMonth = $('#monthOption').val();
        var jsYear = $('#yearOption').val();

        jsMonth = JSON.parse(jsMonth);
        jsYear = JSON.parse(jsYear);

        $.ajax({
            type: 'POST',
            url: '/chartDatabase',
            data: {
                pyMonth: jsMonth,
                pyYear: jsYear,
            }
        })
            .done(function (response) {
                jsonOutput.label = response.label;
                jsonOutput.duration = response.duration;
                jsonOutput.distance = response.distance;
                jsonOutput.amount = response.amount;

                minDuration = response.minDuration;
                minDurationDate = response.minDurationDate;
                maxDuration = response.maxDuration;
                maxDurationDate = response.maxDurationDate;
                avgDuration = response.avgDuration;

                minDistance = response.minDistance;
                minDistanceDate = response.minDistanceDate;
                maxDistance = response.maxDistance;
                maxDistanceDate = response.maxDistanceDate;
                avgDistance = response.avgDistance;

                minAmount = response.minAmount;
                minAmountDate = response.minAmountDate;
                maxAmount = response.maxAmount;
                maxAmountDate = response.maxAmountDate;
                avgAmount = response.avgAmount;
                
                month = response.month

                chart1.destroy();
                chart2.destroy();
                chart3.destroy();
                graphs();

                setTable();
                setAverage();
            })
            .fail(function () {
                alert("Failed to obtain data from database");
            });

        
    });

    function setAverage() {
        var dur = document.getElementById('averageDuration');
        var dis = document.getElementById('averageDistance');
        var amt = document.getElementById('averageAmount');

        dur.innerHTML = 'Average: ' + avgDuration.toFixed(2) + 'seconds';
        dis.innerHTML = 'Average: ' + avgDistance.toFixed(2) + 'km';
        amt.innerHTML = 'Average: RM' + avgAmount.toFixed(2);
    }

    function setTable() {
        var dur = document.getElementById('duration');
        var dis = document.getElementById('distance');
        var amt = document.getElementById('amount');
        dur.innerHTML = '';
        dur.innerHTML += '<table class="table">'
            + '<tbody><tr><td class="col-6">'
            + 'Minimum duration in '
            + month 
            + '</td><td class="col-3">'
            + minDuration + ' seconds'
            + '</td><td>'
            + jsonOutput.label[minDurationDate]
            + '</td></tr>'
            + '<tr><td >'
            + 'Maximum duration in '
            + month
            + '</td><td>'
            + maxDuration + ' seconds'
            + '</td><td>'
            + jsonOutput.label[maxDurationDate]
            + '</td></tr>'
            + '</tbody></table>';

        dis.innerHTML = '';
        dis.innerHTML += '<table class="table">'
            + '<tbody><tr><td class="col-6">'
            + 'Minimum distance in '
            + month 
            + '</td><td class="col-3">'
            + minDistance.toFixed(2) + ' km'
            + '</td><td>'
            + jsonOutput.label[minDistanceDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Maximum distance in '
            + month
            + '</td><td>'
            + maxDistance.toFixed(2) + ' km'
            + '</td><td>'
            + jsonOutput.label[maxDistanceDate]
            + '</td></tr>'
            + '</tbody></table>';

        amt.innerHTML = '';
        amt.innerHTML += '<table class="table">'
            + '<tbody><tr><td class="col-6">'
            + 'Minimum amount in '
            + month 
            + '</td><td class="col-3">'
            + 'RM' + minAmount.toFixed(2)
            + '</td><td>'
            + jsonOutput.label[minAmountDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Maximum amount in '
            + month
            + '</td><td>'
            + 'RM' + maxAmount.toFixed(2)
            + '</td><td>'
            + jsonOutput.label[maxAmountDate]
            + '</td></tr>'
            + '</tbody></table>';
    }
    // $(document).ajaxStop(function () {
    function graphs() {
        var labels = jsonOutput.label
        var data = {
            labels: labels,
            datasets: [{
                // label: 'My First Dataset',
                data: jsonOutput.duration,
                // backgroundColor: [
                //     'rgba(255, 99, 132, 0.2)',
                //     'rgba(255, 159, 64, 0.2)',
                //     'rgba(255, 205, 86, 0.2)',
                //     'rgba(75, 192, 192, 0.2)',
                //     'rgba(54, 162, 235, 0.2)',
                //     'rgba(153, 102, 255, 0.2)',
                //     'rgba(201, 203, 207, 0.2)'
                // ],
                // borderColor: [
                //     'rgb(255, 99, 132)',
                //     'rgb(255, 159, 64)',
                //     'rgb(255, 205, 86)',
                //     'rgb(75, 192, 192)',
                //     'rgb(54, 162, 235)',
                //     'rgb(153, 102, 255)',
                //     'rgb(201, 203, 207)'
                // ],
                // borderWidth: 1
                // // (make the line go smooth, no edge, default: 0)
                // tension: 0.5 

            }]
        };
        // light blue
        const backgroundc = '#BFD7ED';
        // dark blue
        const borderc = '#003B73';
        // tension
        const t = 0.1;

        // setting the x-axis appearance
        const tick = {
            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
            callback: function (val, index) {
                // Hide every 2nd tick label
                return index % 3 === 0 ? this.getLabelForValue(val) : '';
            },
            // color of the label on x-axis
            color: 'grey',
        }

        var temp = document.getElementById('durationChart').getContext('2d');
        chart1 = new Chart(temp, {
            data: {
                labels: labels,
                datasets: [{
                    label: 'Time taken',
                    data: jsonOutput.duration,
                    type: 'bar',
                    // light yellow 
                    backgroundColor: backgroundc,
                }]
                // {
                //     label: 'Line Dataset',
                //     data: jsonOutput.duration,
                //     type: 'line',
                // }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        display: true,

                        // // axis label
                        // title: {
                        //     display: true,
                        //     text: 'second(s)'
                        //   }
                    },
                    x: {

                        ticks: tick

                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {

                            // changing the data view of tooltip
                            label: function (context) {
                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    var temp = '';

                                    // showing minutes and seconds
                                    var minutes = context.parsed.y / 60;
                                    var seconds = context.parsed.y % 60;

                                    //showing hour and minutes
                                    // removing decimals
                                    var hours = Math.trunc(minutes / 60);
                                    minutes = Math.trunc(minutes % 60);

                                    temp = hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds';
                                    label += temp;
                                }
                                return label;
                            }
                        }
                    }
                }
            },
        });

        var temp = document.getElementById('distanceChart').getContext('2d');
        chart2 = new Chart(temp, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distance',
                    data: jsonOutput.distance,
                    backgroundColor: borderc,
                    borderColor: backgroundc,
                    tension: t,
                }]
            },
            options: {
                // for hiding point in graph
                // elements: {
                //     point: {
                //         borderWidth: 0,
                //         radius: 0,
                //         backgroundColor: 'rgba(0,0,0,0)'
                //     }
                // },
                scales: {
                    y: {
                        beginAtZero: true,
                        // // axis label
                        // title: {
                        //     display: true,
                        //     text: 'Distance(km)'
                        //   }
                    },
                    x: {
                        ticks: tick
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    var num = context.parsed.y;
                                    label += num.toFixed(2) + ' km';
                                }
                                return label;
                            }
                        }
                    }
                }
            },
        });

        var temp = document.getElementById('amountChart').getContext('2d');
        chart3 = new Chart(temp, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: jsonOutput.amount,
                    backgroundColor: borderc,
                    borderColor: backgroundc,
                    tension: t,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        // // axis label
                        // title: {
                        //     display: true,
                        //     text: 'RM'
                        //   }
                    },
                    x: {
                        ticks: tick
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            // changing the data view of tooltip
                            label: function (context) {
                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    var num = context.parsed.y;
                                    label += 'RM ' + num.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            },
        });

        // const ctxBar = document.getElementById('myBarChart').getContext('2d');
        // const myBarChart = new Chart(ctxBar, {
        //     type: 'line',
        //     data: {
        //         // index axis (x-axis), must be in array 
        //         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],

        //         datasets: [{
        //             label: '# of Votes',
        //             data: [12, 19, 3, 5, 2, 3],
        //             backgroundColor: [
        //                 'rgba(255, 99, 132, 0.2)',
        //                 'rgba(54, 162, 235, 0.2)',
        //                 'rgba(255, 206, 86, 0.2)',
        //                 'rgba(75, 192, 192, 0.2)',
        //                 'rgba(153, 102, 255, 0.2)',
        //                 'rgba(255, 159, 64, 0.2)'
        //             ],
        //             borderColor: 
        //                 'rgba(54, 162, 235, 1)',

        //             borderWidth: 1
        //         }]
        //     },
        //     options: {
        //         scales: {
        //             y: {
        //                 beginAtZero: true
        //             }
        //         }
        //     }
        // });

        // //variables 
        // const l = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        // const d = {
        //     labels: l,
        //     datasets: [{
        //         // label: 'My First Dataset',
        //         data: [1,2,3,4,5,6,7],
        //         backgroundColor: [
        //             'rgba(255, 99, 132, 0.2)',
        //             'rgba(255, 159, 64, 0.2)',
        //             'rgba(255, 205, 86, 0.2)',
        //             'rgba(75, 192, 192, 0.2)',
        //             'rgba(54, 162, 235, 0.2)',
        //             'rgba(153, 102, 255, 0.2)',
        //             'rgba(201, 203, 207, 0.2)'
        //         ],
        //         borderColor: [
        //             'rgb(255, 99, 132)',
        //             'rgb(255, 159, 64)',
        //             'rgb(255, 205, 86)',
        //             'rgb(75, 192, 192)',
        //             'rgb(54, 162, 235)',
        //             'rgb(153, 102, 255)',
        //             'rgb(201, 203, 207)'
        //         ],
        //         borderWidth: 1
        //         // (make the line go smooth, no edge, default: 0)
        //         // tension: 0.5 

        //     }]
        // };

        // const ctxLine = document.getElementById('myLineChart').getContext('2d');
        // const myLineChart = new Chart(ctxLine, {
        //     type: 'line',
        //     data: d,
        //     options: {
        //         scales: {
        //             y: {
        //                 beginAtZero: true,
        //                 title: {
        //                     display: true,
        //                     text: 'Your Title'
        //                   }
        //             },

        //             display: true

        //         }
        //     },
        // });



    }
});