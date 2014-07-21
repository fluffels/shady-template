onmessage = function (e) {
    var sum = 0;
    for (i in e.data[0])
    {
        sum += e.data[0][i] - e.data[1][i];
    }

    var error = "error=" + sum
        + "&time=" + e.data[2];

    postMessage(error);
};

