app.controller('CompareFaceController', ['$scope', '$rootScope', '$http', '$log', function($scope, $rootScope, $http, $log) {
    var host = "http://localhost:5006/faceVerification";
    var firstImage = null;
    var secondImage = null;

    $scope.reset=function()
    {
        console.log("rest..");
        $scope.statusMessage="test";
    }
    $scope.selectFileToSearch = function(files) {
        $scope.reset();
        $scope.showCanvas = false;
        var selectedFile = files[0];
        var reader = new FileReader();
        
        
        reader.onload = function() {
            $scope.uploadPreview = reader.result;
            var img = new Image();
            firstImage = reader.result;


        };
        reader.onerror = function(error) {

        };
        reader.readAsDataURL(selectedFile);
    }

$scope.selectFileToSearch_2 = function(files) {
        $scope.showCanvas = false;
        var selectedFile = files[0];
        var reader = new FileReader();
        $scope.statusMessage=null;
        
        reader.onload = function() {
            $scope.uploadPreview = reader.result;
            var img = new Image();
            secondImage = reader.result;


        };
        reader.onerror = function(error) {

        };
        reader.readAsDataURL(selectedFile);
    }

    
    $scope.compareFaces = function() {
        var reader = new FileReader();
        
        var fd = new FormData();
        fd.append("inputImg1", firstImage);
        fd.append("inputImg2", secondImage  );
        $scope.statusMessage="...";
        $http.post(host, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Accept': 'application/text',
                    'Cache-Control': 'no-cache'

                }
            })
            .success(function(res) {
                if(res.data==true)
                {
                    $scope.statusMessage="MATCHED";
                }
                else
                {
                    $scope.statusMessage="NOT MATCHED";
                }

            })
            .error(function(data) {
                $scope.showFaceLoader = false;
                $scope.faceMessage = "Invalid input data.Please check and try again";

            });

    }

}]).directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);