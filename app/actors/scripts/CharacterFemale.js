var points = [
    [1, 1],
    [2, 1],
    [3, 1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3]
];

while (true) {
    points.forEach(function (point) {
        move(point[0], point[1]);
    });
}
