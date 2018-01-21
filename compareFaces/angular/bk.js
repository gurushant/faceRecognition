'use strict';


var pocApp = angular.module('app', []);



pocApp.controller('SquareController', ['$scope', '$rootScope', '$http', '$templateCache', function($scope, $rootScope, $http, $templateCache) {
    console.log("Loaded...");

    var host = "http://localhost:8580/";
    var IMAGE_BATCH_SIZE = 2;

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    $scope.classes = [{
        name: "Face",
        color: "red",
        id: 1
    }, {
        name: "Car",
        color: "blue",
        id: 2
    }];

    //select default image
    var obj = null;
    var source = null;
    var selectedImageName = null;
    var selectedImageIndex = 0;
    var selectedClass = null;
    var selectedColor = null;




    //Get Shape
    var api = host + "get_shape";
    var shape = null;
    $http.get(api, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .success(function(res) {
            shape = res.shape;
            console.log("Shape is =>" + shape);
        })
        .error(function(data) {
            console.log(data);
        });
    //end of shape
    // $scope.images=[{name:"img/1.jpg",id:0},{name:"img/2.jpg",id:1},{name:"img/3.jpg",id:2},
    //                {name:"img/5.jpeg",id:3}];

    var canvas = null;
    var actualImgWidth = 0,
        actualImgHeight = 0;
    var xMultiFactor = 0,
        yMultiFactor = 0;
    var actualX1 = 0,
        actualY1 = 0,
        actualX2 = 0,
        actualY2 = 0;
    var WIDTH = 500,
        HEIGHT = 500;




    $scope.selectClass = function(classObj) {

        selectedClass = classObj.name;
        selectedColor = classObj.color;
    }

    $scope.test = function() {
        console.log("Tests");
    }




    $scope.loadImg = function() {

        canvas = document.getElementById('myCanvas');


        $scope.message = "";

        var ctx = getCanvasContext();
        //ctx.clearRect(0, 0, WIDTH, HEIGHT);
        //
        canvas.addEventListener('mousemove', function(evt) {
            var mousePos = getMousePos(canvas, evt);
            var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
            writeMessage(canvas, message);
        }, false);
        //
        var imgObj = new Image();
        //drawing of the test image - img1
        imgObj.onload = function() {
            //draw background image
            actualImgHeight = imgObj.height;
            actualImgWidth = imgObj.width;


            ctx.drawImage(imgObj, 0, 0, WIDTH, HEIGHT);


            xMultiFactor = actualImgWidth / WIDTH;
            yMultiFactor = actualImgHeight / HEIGHT;
            redrawRects($scope.selectedImageId);
            $scope.updateImageData();
            //draw a box over the top

        };
        imgObj.src = "data:image/png;base64," + source;
        init();
    }

    var getNamesApi = host + "get_image_names";
    $scope.imageNames = [];
    $http.get(getNamesApi, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .success(function(res) {
            console.log("Image names are =>" + res + "," + res.length);
            for (var i = 0; i < res.length; i++) {
                var obj={name:res[i],id:i};
                $scope.imageNames.push(obj);
            }

            var imageCount = $scope.imageNames.length;
            console.log("Total images are =>" + imageCount);
            console.log("Batch size is =>" + IMAGE_BATCH_SIZE);
            var imgArr=getNextImages();
            console.log("Next images are =>"+imgArr);
            $scope.fetchImages(imgArr);
        }).error(function(data) {
            console.log(data);
        });


    var imageCounter = -1;

    function getNextImages() {
        var imgArr = [];
        
        if ((imageCounter+1) > $scope.imageNames.length) {
            return false;
        } else {
            imageCounter=imageCounter+1;
            var j=0;
            var diff = $scope.imageNames.length - imageCounter;
            if (diff >= IMAGE_BATCH_SIZE) {
                var temp=0;
                for (var i = imageCounter; i < (imageCounter+IMAGE_BATCH_SIZE); i++) {
                    var obj=$scope.imageNames[i];
                    imgArr[j]=obj.name;
                    temp=i;
                    j++;
                }
                imageCounter=temp;
            }
            else
            {
                for (var i = imageCounter; i < $scope.imageNames.length; i++) {
                    var obj=$scope.imageNames[i];
                    imgArr[j]=obj.name;
                    imageCounter=i;
                    j++;
                }
            }
        }
        return imgArr;
    }

    function getImageId(name)
    {
        for(var i=0;i<$scope.imageNames.length;i++)
        {
            var obj=$scope.imageNames[i];
            if(obj.name==name)
            {
                return obj.id;
            }
        }
    }


    $scope.fetchImages = function(imgArr) {
        //Fetch images
        if(imgArr.length==0)
        {
            return;
        }
        var api = host + "get_images";
        $http.post(api,imgArr, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .success(function(res) {

                $scope.images = [];
                for(var k=0;k<res.length;k++)
                {
                    var tempObj=res[k];
                    var id=getImageId(tempObj.name);
                    var obj={id:id,name:tempObj.name,data:tempObj.data};
                    $scope.images.push(obj);
                }
                
                obj = $scope.images[0];
                source = obj.data;
                $scope.selectedImageId = obj.id;
                selectedImageName = obj.name;
                selectedImageIndex = 0;
                $scope.loadImg();
            })
            .error(function(data) {
                console.log(data);
            });
    }
    //end of fetch images

    $scope.fetchImagesForReverse = function(imgArr) {
        //Fetch images
        if(imgArr.length==0)
        {
            return;
        }
        imgArr.reverse();
        var api = host + "get_images";
        $http.post(api,imgArr, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .success(function(res) {

                $scope.images = [];
                for(var k=0;k<res.length;k++)
                {
                    var tempObj=res[k];
                    var id=getImageId(tempObj.name);
                    var obj={id:id,name:tempObj.name,data:tempObj.data};
                    $scope.images.push(obj);
                }
                var len=$scope.images.length-1;    
                obj = $scope.images[len];
                source = obj.data;
                $scope.selectedImageId = obj.id;
                selectedImageName = obj.name;
                selectedImageIndex = len;
                $scope.loadImg();
            })
            .error(function(data) {
                console.log(data);
            });
    }
    //end of fetch images

    // //var counter=0;
    // var interval = setInterval($scope.loadImg, 3000);




    function redrawRects(selectedImageId) {
        var rectData = $scope.imageArr[selectedImageId];
        if (rectData != undefined || rectData != null) {
            for (var i = 0; i < rectData.length; i++) {
                var obj = rectData[i];
                var x1 = obj.currentObj.x1;
                var y1 = obj.currentObj.y1;
                var x2 = obj.currentObj.x2;
                var y2 = obj.currentObj.y2;


                var width = x2 - x1;
                var height = y2 - y1;
                var context = getCanvasContext();
                context.beginPath();
                context.rect(x1, y1, width, height);
                context.lineWidth = 1;
                context.strokeStyle = obj.currentObj.color;
                context.stroke();
            }
        }
        //temp squares

        var rectData = $scope.tempPoints[selectedImageId];
        if (rectData != undefined || rectData != null) {
            for (var i = 0; i < rectData.length; i++) {
                var obj = rectData[i];
                var x1 = obj.currentObj.x1;
                var y1 = obj.currentObj.y1;
                var x2 = obj.currentObj.x2;
                var y2 = obj.currentObj.y2;


                var width = x2 - x1;
                var height = y2 - y1;
                var context = getCanvasContext();
                context.beginPath();
                context.rect(x1, y1, width, height);
                context.lineWidth = 1;
                context.strokeStyle = obj.currentObj.color;
                context.stroke();
            }
        }

    }

    $scope.next = function() {

        // var size = $scope.images.length;
        // if ((selectedImageIndex + 1) < size) {
        //     selectedImageIndex = selectedImageIndex + 1;
        //     obj = $scope.images[selectedImageIndex];
        //     source = obj.data;
        //     selectedImageName = obj.name;
        //     $scope.selectedImageId = obj.id;
        //     $scope.loadImg();
        // } else {

        // }

        var size = $scope.images.length;
        if ((selectedImageIndex + 1) < size) {
            selectedImageIndex = selectedImageIndex + 1;
            obj = $scope.images[selectedImageIndex];
            source = obj.data;
            selectedImageName = obj.name;
            $scope.selectedImageId = obj.id;
            $scope.loadImg();
            //imageCounter=imageCounter+1;
        }
        else 
        {
            var imgArr=getNextImages();
            console.log("Next images are =>"+imgArr);
            $scope.fetchImages(imgArr);
            
        }
        console.log("Image counter in next is =>>"+imageCounter);
        
    }


    $scope.submitData = function() {
        if ($scope.imageArr.length < 1) {
            $("#lbl_msg").css('color', 'blue');
            $scope.message = "No input data found";
            return;
        }
        var payload = $scope.imageArr;
        payload = JSON.stringify(payload)

        var api = host + "save";
        $http.post(api, payload, {

                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            })
            .success(function(res) {
                console.log("Response is =>" + res);
                if (res.status == 'SUCCESS') {
                    $("#lbl_msg").css('color', 'green');
                    $scope.message = res.message;
                } else {
                    $("#lbl_msg").css('color', 'red');
                    $scope.message = res.message;
                }
            })
            .error(function(data) {
                console.log(data);
            });
    }


    function getPreviousImages() {
        var imgArr = [];
        
        // if ((imageCounter-1) < 0) {
        //     return false;
        // } else {
            imageCounter=imageCounter-1;
            var j=0;
            var diff = $scope.imageNames.length - imageCounter;
            if (diff >= IMAGE_BATCH_SIZE) {
                var temp=0;
                for (var i = imageCounter; i > (imageCounter-IMAGE_BATCH_SIZE); i--) {
                    var obj=$scope.imageNames[i];
                    imgArr[j]=obj.name;
                    temp=i;
                    j++;
                }
                // imageCounter=temp;
            }
            else
            {
                for (var i = imageCounter; i < $scope.imageNames.length; i++) {
                    var obj=$scope.imageNames[i];
                    imgArr[j]=obj.name;
                    // imageCounter=i;
                    j++;
                }
            }
        
        return imgArr;
    }

    $scope.previous = function() {

         console.log("In previous");
        // var size = $scope.images.length;
        // if ((selectedImageIndex - 1) >= 0) {
        //     selectedImageIndex = selectedImageIndex - 1;
        //     obj = $scope.images[selectedImageIndex];
        //     source = obj.data;
        //     selectedImageName = obj.name;
        //     $scope.selectedImageId = obj.id;
        //     $scope.loadImg();
        // } else {

        // }
        
        var size = $scope.images.length;
        if ((selectedImageIndex - 1) >= 0) {
            selectedImageIndex = selectedImageIndex - 1;
            obj = $scope.images[selectedImageIndex];
            source = obj.data;
            selectedImageName = obj.name;
            $scope.selectedImageId = obj.id;
            $scope.loadImg();
            imageCounter=imageCounter-1;
        }
        else 
        {
            var imgArr=getPreviousImages();
            //imgArr.reverse();
            console.log("Next images are =>"+imgArr);
            $scope.fetchImagesForReverse(imgArr);
            selectedImageIndex=imgArr.length;
        }
        console.log("Image counter is =>"+imageCounter);

    }



    // $scope.saveImg = function() {
    //     console.log("In save image");
    //     var imageData = canvas.toDataURL("image/png")
    //     var canvas1 = document.getElementById('myCanvas1');
    //     var context = canvas1.getContext('2d');
    //     var imgObj = new Image();
    //     imgObj.onload = function() {
    //         //draw background image
    //         context.drawImage(imgObj, 0, 0);


    //         for (var i = 0; i < $scope.actualRectangles.length; i++) {
    //             var obj = $scope.actualRectangles[i];
    //             var x1 = obj.actualObj.x1;
    //             var y1 = obj.actualObj.y1;
    //             var x2 = obj.actualObj.x2;
    //             var y2 = obj.actualObj.y2;
    //             var width = x2 - x1;
    //             var height = y2 - y1;

    //             context.beginPath();
    //             context.rect(x1, y1, width, height);
    //             //context.fillStyle = 'yellow';
    //             //context.fill();
    //             context.lineWidth = 1;
    //             context.strokeStyle = "red";
    //             context.stroke();
    //         }

    //     };

    //     imgObj.src = 'img/2.jpg';
    //     init();
    //     ///
    // }


    function writeMessage(canvas, message) {
        //    console.log(message);
    }

    function init() {
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
    }

    var x1 = null,
        y1 = null,
        x2 = null,
        y2 = null;

    function mouseDown(e) {

        $scope.message = "";
        if (selectedClass == null) {
            $scope.$apply(function() {
                $("#lbl_msg").css('color', 'red');
                $scope.message = "Please select the class";
                x1 = null;
                y1 = null;
                x2 = null;
                y2 = null;
                return;
            });

        } else {
            var rect = canvas.getBoundingClientRect();
            var rect = canvas.getBoundingClientRect();
            var x = parseInt(e.clientX - rect.left);
            var y = parseInt(e.clientY - rect.top);
            console.log("Mouse move=>" + x + "," + y);

            if (x1 == null && y1 == null) {
                x1 = parseInt(e.clientX - rect.left);
                y1 = parseInt(e.clientY - rect.top);


            } else {

                if (x2 == null && y2 == null) {
                    //Removing dotted lines
                    $scope.tempPoints = [];

                    actualX1 = x1 * xMultiFactor;
                    actualY1 = y1 * yMultiFactor;
                    console.log("Actual x1=>" + actualX1);
                    console.log("Actual y1=>" + actualY1);

                    x2 = parseInt(e.clientX - rect.left);
                    y2 = parseInt(e.clientY - rect.top);

                    //code to adjust the square 
                    if (shape == "SQUARE") {
                        var width = Math.abs(x2 - x1);
                        var height = Math.abs(y2 - y1);
                        console.log("Width is =>:" + width);
                        console.log("height is =>:" + height);
                        if (shape == "SQUARE") {
                            if (width > height && y2 >= y1 && x2 > x1) {
                                height = width;
                                x2 = width + x1;
                                y2 = height + y1;
                                console.log("1 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                            } else
                            if (width > height && y2 <= y1 && x2 > x1) {
                                height = width;
                                x2 = width + x1;
                                y2 = y1 - height;
                                console.log("2 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                            } else
                            if (width > height && y2 >= y1 && x2 < x1) {
                                height = width;
                                x2 = x1 - width;
                                y2 = height + y1;
                                console.log("3 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                            } else
                            if (width > height && y2 <= y1 && x2 < x1) {
                                height = width;
                                x2 = x1 - width;
                                y2 = y1 - height;
                                console.log("4 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                            }
                            // // //if height is smaller than width
                            // if (width < height && y2 > y1 && x2 > x1) {
                            //     width=height;
                            //     x1 = height + x1;
                            //     y1 = width + y1;
                            // } else
                            // if (width < height && y2 < y1 && x2 > x1) {
                            //     width=height;
                            //     x1 = height + x1;
                            //     y1 = x1-width;
                            // } else
                            // if (width < height && y2 > y1 && x2 < x1) {
                            //     height = width;
                            //     x2 = x1 - width;
                            //     y2 = height + y1;
                            // } else
                            // if (width > height && y2 < y1 && x2 < x1) {
                            //     height = width;
                            //     x2 = x1 - width;
                            //     y2 = y1 - height;
                            // } 
                        }



                        // else
                        // {
                        //     width=height;
                        //     console.log("HEIGHT is more");
                        //     x2=width+x1;
                        //     y2=height+y1;   
                        // }
                    }
                    //end of square calculation



                    actualX2 = x2 * xMultiFactor;
                    actualY2 = y2 * yMultiFactor;

                    drawRectangle(x1, y1, x2, y2, selectedColor, selectedImageName, selectedClass, $scope.selectedImageId);
                    x1 = null;
                    y1 = null;
                    x2 = null;
                    y2 = null;
                }
            }
        }

    }

    $scope.showRects = function() {

    }


    $scope.clearRect = function(selectedImageId, selectedRectId) {
        var imgObj = $scope.imageArr[selectedImageId];
        var rectIndex = 0;
        for (var k = 0; k < imgObj.length; k++) {
            var tempObj = imgObj[k];
            if (tempObj.id == selectedRectId) {
                rectIndex = k;
                break;
            }
        }


        $scope.imageArr[selectedImageId].splice(rectIndex, 1);
        $scope.loadImg();
    }

    $scope.actualRectangles = [];
    var rectId = 1;
    $scope.imageArr = new Array();



    var x = 10;
    $scope.imgObj = [];

    function drawRectangle(x1, y1, x2, y2, color, source, imgClass, id) {

        $scope.message = "";
        $scope.tempPoints = [];

        var width = x2 - x1;
        var height = y2 - y1;

        //code to adjust the square 
        if (shape == "SQUARE") {
            var width = Math.abs(x2 - x1);
            var height = Math.abs(y2 - y1);

            if (width > height && y2 > y1 && x2 > x1) {
                height = width;
                x2 = width + x1;
                y2 = height + y1;
                console.log("1 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width > height && y2 < y1 && x2 > x1) {
                height = width;
                x2 = width + x1;
                y2 = y1 - height;
                console.log("2 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width > height && y2 > y1 && x2 < x1) {
                height = width;
                x2 = x1 - width;
                y2 = height + y1;
                console.log("3 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width > height && y2 < y1 && x2 < x1) {
                height = width;
                x2 = x1 - width;
                y2 = y1 - height;
                console.log("4 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            }

            //check for height
            if (width < height && y2 > y1 && x2 > x1) {
                width = height;
                x2 = width + x1;
                y2 = height + y1;
                console.log("5 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width < height && y2 < y1 && x2 > x1) {
                width = height;
                x2 = width + x1;
                y2 = y1 - height;
                console.log("6 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width < height && y2 > y1 && x2 < x1) {
                width = height;
                x2 = x1 - width;
                y2 = height + y1;
                console.log("7 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            } else
            if (width < height && y2 < y1 && x2 < x1) {
                width = height;
                x2 = x1 - width;
                y2 = y1 - height;
                console.log("8 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
            }

            //else {
            //     width = height;
            //     x2 = width + x1;
            //     y2 = height + y1;
            // }

            // else
            // {
            //     width=height;
            //     console.log("HEIGHT is more");
            //     x2=width+x1;
            //     y2=height+y1;   
            // }
        }
        //end of square calculation




        var context = getCanvasContext();
        context.beginPath();
        context.setLineDash([0, 0]);
        context.rect(x1, y1, width, height);
        //context.fillStyle = 'yellow';
        //context.fill();

        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();
        //Push into the stack



        var currentObj = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            class: imgClass,
            color: color
        };


        var imageInfo = {
            name: source,
            class: imgClass
        };
        var actualObj = {
            x1: actualX1,
            y1: actualY1,
            x2: actualX2,
            y2: actualY2,
            class: imgClass,
            color: color
        };

        var obj = {
            id: rectId,
            currentObj: currentObj,
            actualObj: actualObj,
            info: imageInfo
        };



        if ($scope.imageArr[id] == null) {
            var dataImgObj = [];
            dataImgObj.push(obj);
            $scope.imageArr[id] = dataImgObj;
        } else {
            var tempObj = $scope.imageArr[id];
            tempObj.push(obj);
            $scope.imageArr[id] = tempObj;
        }


        $scope.updateImageData();

        // $scope.actualRectangles.push(obj);         
        // console.log($scope.actualRectangles);         


        rectId = rectId + 1;


        $scope.loadImg();

    }

    function getCanvasContext() {
        var context = canvas.getContext('2d');
        return context;
    }

    $scope.tempPoints = [];

    function drawRectangleMouseMove(x1, y1, x2, y2, color, source, imgClass, id) {
        $scope.tempPoints = [];
        $scope.message = "";
        //console.log(x1 + "," + y1 + "," + x2 + "," + y2);
        var width = x2 - x1;
        var height = y2 - y1;



        var context = getCanvasContext();
        context.beginPath();
        context.rect(x1, y1, width, height);
        //context.fillStyle = 'yellow';
        //context.fill();
        context.setLineDash([5, 3]);
        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();

        //Push into the stack



        var currentObj = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            class: imgClass,
            color: color
        };


        var imageInfo = {
            name: source,
            class: imgClass
        };
        var actualObj = {
            x1: actualX1,
            y1: actualY1,
            x2: actualX2,
            y2: actualY2,
            class: imgClass,
            color: color
        };

        var obj = {
            id: rectId,
            currentObj: currentObj,
            actualObj: actualObj,
            info: imageInfo
        };



        if ($scope.tempPoints[id] == null) {
            var dataImgObj = [];
            dataImgObj.push(obj);
            $scope.tempPoints[id] = dataImgObj;
        } else {
            var tempObj = $scope.tempPoints[id];
            tempObj.push(obj);
            $scope.tempPoints[id] = tempObj;
        }


        $scope.updateImageData();

        // $scope.actualRectangles.push(obj);         
        // console.log($scope.actualRectangles);         


        rectId = rectId + 1;
    }


    $scope.updateImageData = function() {
        $scope.$apply(function() {
            $scope.imgObj = null;
            $scope.imgObj = $scope.imageArr[$scope.selectedImageId];

        });
    }

    function mouseUp(e) {
        console.log("Mouse up");
    }


    function mouseMove(e) {
        var rect = canvas.getBoundingClientRect();
        var x = parseInt(e.clientX - rect.left);
        var y = parseInt(e.clientY - rect.top);
        if (x1 != null && y1 != null) {
            $scope.loadImg();
            if (x2 == null && y2 == null) {

                actualX1 = x1 * xMultiFactor;
                actualY1 = y1 * yMultiFactor;


                x2 = parseInt(e.clientX - rect.left);
                y2 = parseInt(e.clientY - rect.top);

                //code to adjust the square 
                if (shape == "SQUARE") {
                    var width = Math.abs(x2 - x1);
                    var height = Math.abs(y2 - y1);

                    if (width > height && y2 > y1 && x2 > x1) {
                        height = width;
                        x2 = width + x1;
                        y2 = height + y1;
                        console.log("1 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width > height && y2 < y1 && x2 > x1) {
                        height = width;
                        x2 = width + x1;
                        y2 = y1 - height;
                        console.log("2 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width > height && y2 > y1 && x2 < x1) {
                        height = width;
                        x2 = x1 - width;
                        y2 = height + y1;
                        console.log("3 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width > height && y2 < y1 && x2 < x1) {
                        height = width;
                        x2 = x1 - width;
                        y2 = y1 - height;
                        console.log("4 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    }

                    //check for height
                    if (width < height && y2 > y1 && x2 > x1) {
                        width = height;
                        x2 = width + x1;
                        y2 = height + y1;
                        console.log("5 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width < height && y2 < y1 && x2 > x1) {
                        width = height;
                        x2 = width + x1;
                        y2 = y1 - height;
                        console.log("6 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width < height && y2 > y1 && x2 < x1) {
                        width = height;
                        x2 = x1 - width;
                        y2 = height + y1;
                        console.log("7 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    } else
                    if (width < height && y2 < y1 && x2 < x1) {
                        width = height;
                        x2 = x1 - width;
                        y2 = y1 - height;
                        console.log("8 condition=>" + x1 + "," + x2 + "," + y1 + "," + y2);
                    }

                    //else {
                    //     width = height;
                    //     x2 = width + x1;
                    //     y2 = height + y1;
                    // }

                    // else
                    // {
                    //     width=height;
                    //     console.log("HEIGHT is more");
                    //     x2=width+x1;
                    //     y2=height+y1;   
                    // }
                }
                //end of square calculation


                actualX2 = x2 * xMultiFactor;
                actualY2 = y2 * yMultiFactor;


                drawRectangleMouseMove(x1, y1, x2, y2, selectedColor, selectedImageName, selectedClass, $scope.selectedImageId);
                // x1 = null;
                // y1 = null;
                x2 = null;
                y2 = null;
            }

        }
        //console.log("Mouse move=>"+x+","+y);
    }
}]);