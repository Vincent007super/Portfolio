<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Vincent</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
<?php
require_once 'php_files/connect.php';
require_once 'php_files/data_load.php';

$planes = mysqli_query($conn, $queryPlane);
$items = mysqli_query($conn, $queryItem);


// echo $conn;
// echo $queryPlane;
// echo $queryItem;

echo "<script>";
echo "let planes = [];";
//loop door array en print per item
if (mysqli_num_rows($planes) > 0) {
    // output data of each row
    while($row = mysqli_fetch_assoc($planes)) {
        echo 'planes.push(["'.$row['Title'].'", "'.$row['ItemID_1'].'", "'.$row['ItemID_2'].'"]);';
}
}
echo "let items = {};";
//loop door array en print per item
if (mysqli_num_rows($items) > 0) {
    // output data of each row
    while($row = mysqli_fetch_assoc($items)) {
        echo 'items["'.$row['ID'].'"] = ["'.$row['PlaneImage'].'", "'.$row['PlaneText'].'"];';
}
}

echo "</script>";


//planes aanmaken
//for loop door data
//if((i % 2) == 0){
//  maak nieue plane
//}
//
//maak item op plane
?>
    <button id="startButton">Start</button>
    <div id="wrapper1">
        <div class="progress-bar">
            <div class="progress-points"></div>
        </div>
    </div>
    <video id="video" width="320" height="240" autoplay loop muted>
        <source src="media/vid/surface.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    </script>
    <script type="module" src="codes/Javascript/main.js"></script>
</body>

</html>