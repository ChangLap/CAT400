$(document).ready(function () {

    var jsonOutput = {}
    jsonOutput.label = []
    jsonOutput.count = []

    jsonOutput.duration = {}
    jsonOutput.distance = {}
    jsonOutput.amount = {}

    jsonOutput.duration.data = []
    jsonOutput.distance.data = []
    jsonOutput.amount.data = []

    var chart1;
    var chart2;
    var chart3;
    graphs();

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
                jsonOutput.count = response.count;
                month = response.month

                jsonOutput.duration.data = response.duration.data
                jsonOutput.duration.min = response.duration.min;
                jsonOutput.duration.minDate = response.duration.minDate;
                jsonOutput.duration.max = response.duration.max;
                jsonOutput.duration.maxDate = response.duration.maxDate;
                jsonOutput.duration.avg = response.duration.avg;
                jsonOutput.duration.stdev = response.duration.stdev;
                jsonOutput.duration.var = response.duration.var;
                jsonOutput.duration.range = response.duration.range;

                jsonOutput.distance.data = response.distance.data
                jsonOutput.distance.min = response.distance.min;
                jsonOutput.distance.minDate = response.distance.minDate;
                jsonOutput.distance.max = response.distance.max;
                jsonOutput.distance.maxDate = response.distance.maxDate;
                jsonOutput.distance.avg = response.distance.avg;
                jsonOutput.distance.stdev = response.distance.stdev;
                jsonOutput.distance.var = response.distance.var;
                jsonOutput.distance.range = response.distance.range;

                jsonOutput.amount.data = response.amount.data
                jsonOutput.amount.min = response.amount.min;
                jsonOutput.amount.minDate = response.amount.minDate;
                jsonOutput.amount.max = response.amount.max;
                jsonOutput.amount.maxDate = response.amount.maxDate;
                jsonOutput.amount.avg = response.amount.avg;
                jsonOutput.amount.stdev = response.amount.stdev;
                jsonOutput.amount.var = response.amount.var;
                jsonOutput.amount.range = response.amount.range;
                
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

        dur.innerHTML = 'Average: ' + jsonOutput.duration.avg.toFixed(2) + 'seconds';
        dis.innerHTML = 'Average: ' + jsonOutput.distance.avg.toFixed(2) + 'km';
        amt.innerHTML = 'Average: RM' + jsonOutput.amount.avg.toFixed(2);
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
            + jsonOutput.duration.min + ' seconds'
            + '</td><td>'
            + jsonOutput.label[jsonOutput.duration.minDate]
            + '</td></tr>'
            + '<tr><td >'
            + 'Maximum duration in '
            + month
            + '</td><td>'
            + jsonOutput.duration.max + ' seconds'
            + '</td><td>'
            + jsonOutput.label[jsonOutput.duration.maxDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Standard Deviation in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.duration.stdev.toFixed(2) + ' seconds'
            + '</td></tr>'
            + '<tr><td>'
            + 'Variance in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.duration.var.toFixed(2) + ' seconds'
            + '</td></tr>'
            + '<tr><td>'
            + 'Range in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.duration.range + ' seconds'
            + '</td></tr>'
            + '</tbody></table>';

        dis.innerHTML = '';
        dis.innerHTML += '<table class="table">'
            + '<tbody><tr><td class="col-6">'
            + 'Minimum distance in '
            + month 
            + '</td><td class="col-3">'
            + jsonOutput.distance.min.toFixed(2) + ' km'
            + '</td><td>'
            + jsonOutput.label[jsonOutput.distance.minDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Maximum distance in '
            + month
            + '</td><td>'
            + jsonOutput.distance.max.toFixed(2) + ' km'
            + '</td><td>'
            + jsonOutput.label[jsonOutput.distance.maxDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Standard Deviation in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.distance.stdev.toFixed(2) + ' km'
            + '</td></tr>'
            + '<tr><td>'
            + 'Variance in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.distance.var.toFixed(2) + ' km'
            + '</td></tr>'
            + '<tr><td>'
            + 'Range in '
            + month
            + '</td><td colspan="2">'
            + jsonOutput.distance.range + ' km'
            + '</td></tr>'
            + '</tbody></table>';

        amt.innerHTML = '';
        amt.innerHTML += '<table class="table">'
            + '<tbody><tr><td class="col-6">'
            + 'Minimum amount in '
            + month 
            + '</td><td class="col-3">'
            + 'RM' + jsonOutput.amount.min.toFixed(2)
            + '</td><td>'
            + jsonOutput.label[jsonOutput.amount.minDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Maximum amount in '
            + month
            + '</td><td>'
            + 'RM' + jsonOutput.amount.max.toFixed(2)
            + '</td><td>'
            + jsonOutput.label[jsonOutput.amount.maxDate]
            + '</td></tr>'
            + '<tr><td>'
            + 'Standard Deviation in '
            + month
            + '</td><td colspan="2">'
            + 'RM ' + jsonOutput.amount.stdev.toFixed(2)
            + '</td></tr>'
            + '<tr><td>'
            + 'Variance in '
            + month
            + '</td><td colspan="2">'
            + 'RM ' + jsonOutput.amount.var.toFixed(2)
            + '</td></tr>'
            + '<tr><td>'
            + 'Range in '
            + month
            + '</td><td colspan="2">'
            + 'RM ' + jsonOutput.amount.range
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
                data: jsonOutput.duration.data,
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
                    data: jsonOutput.duration.data,
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
                    data: jsonOutput.distance.data,
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
                    data: jsonOutput.amount.data,
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