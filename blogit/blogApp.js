var app = angular.module('blogApp', ['ui.router','ngToast','textAngular']);

app.run(function($rootScope, AuthService, $state, $transitions){
   /*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      console.log(fromState);
      console.log(toState);
   })*/
   $transitions.onStart({}, function(transition){
      if(transition.$to().self.authenticate == true){
         AuthService/isAuthenticated()
         .then(function(res){
            console.log(res);
            if(res == false){
               $state.go('login');
            }
         })
      }
   })
});

app.factory('AuthService', function($q, $rootScope){
   return {
      isAuthenticated : function(){
         var defer = $q.defer();
         Stamplay.User.currentUser(function(err, res){
            if(err){
               defer.resolve(false);
               $rootScope.loggedIn = false;
            }
            if(res.user){
               defer.resolve(true);
               $rootScope.loggedIn = true;
            }
            else{
               defer.resolve(false);
               $rootScope.loggedIn = false;
            }
         });
         return defer.promise;
      }
   }
})

app.config(function($stateProvider, $urlRouterProvider, $locationProvider){
   Stamplay.init("blogit1080");

   $locationProvider.hashPrefix("");

   //localStorage.removeItem('127.0.0.1:8080-jwt');
   //$locationProvider.hashPrefix('');

   $stateProvider
   .state('home',{
      url: '/',
      templateUrl: 'templates/home.html',
      controller: "HomeCtrl"
   })
   .state('login',{
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: "LoginCtrl"
   })
   .state('signup',{
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: "SignUpCtrl"
   })
   .state('MyBlogs',{
      url: '/myBlogs',
      templateUrl: 'templates/myBlogs.html',
      controller: 'MyBlogsCtrl'
   })
   .state('Create',{
      url: '/create',
      templateUrl: 'templates/create.html',
      controller: 'CreateCtrl'
   })
   .state('Edit',{
      url: '/edit/:id',
      templateUrl: 'templates/edit.html',
      controller: 'EditCtrl'
   })
   .state('View',{
      url: '/view/:id',
      templateUrl: 'templates/view.html',
      controller: 'ViewCtrl'
   });

   $urlRouterProvider.otherwise("/");
});

app.filter('htmlToPlainText',function() {
   return function(text){
      return text ? String(text).replace(/<[^>]+>/gm,'') : '';
   }
})

app.controller('ViewCtrl', function($scope, $stateParams, $timeout, $state, ngToast){
   $scope.upVoteCount = 0;
   $scope.downVoteCount = 5;

   $scope.upVote = function(){
      Stamplay.Object("blogs").upVote($stateParams.id)
      .then(function(res){
         console.log(res);
         $scope.blog = res;
         $scope.comment = "";
         $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
         $scope.apply();
      }, function(err){
         console.log(err);
         if(err.code = 403){
            console.log("Login first!");
            $timeout(function(){
               ngToast.create('<a href = "#/login" class="">Please login before voting.</a>');
            });
         }
         if(err.code = 406){
            console.log("Already Voted!");
            $timeout(function(){
               ngToast.create('You have already voted on this post.');
            })
         }
      })
   }

   $scope.downVote = function(){
      Stamplay.Object("blogs").downVote($stateParams.id)
      .then(function(res){
         console.log(res);
         $scope.blog = res;
         $scope.comment = "";
         $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
         $scope.apply();
      }, function(err){
         console.log(err);
         if(err.code = 403){
            console.log("Login first!");
            $timeout(function(){
               ngToast.create('<a href = "#/login" class="">Please login before voting.</a>');
            });
         }
         if(err.code = 406){
            console.log("Already Voted!");
            $timeout(function(){
               ngToast.create('You have already voted on this post.');
            })
         }
      })
   }

   Stamplay.Object("blogs").get({_id: $stateParams.id})
   .then(function(response){
      console.log(response);
      $scope.blog = response.data[0];
      $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
      $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
      $scope.$apply();
   }, function(error){
      console.log(error);
   });

   $scope.postComment = function(){
      Stamplay.Object("blogs").comment($stateParams.id, $scope.comment)
      .then(function(res){
         console.log(res);
         $scope.blog = res;
         $scope.comment = "";
         $scope.$apply();
      }, function(err){
         console.log(err);
         if(err.code == 403){
            console.log("Login first!");
            $timeout(function(){
               ngToast.create('<a href = "#/login" class = "">Please login before posting comments!</a>')
            });
         }
      })
   }
});
app.controller('CreateCtrl',function(taOptions, $scope, $state, $timeout, ngToast){
   $scope.newPost={};

   taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
   ];

   $scope.create = function(){
      Stamplay.User.currentUser()
      .then(function(res){
         if(res.user){
            Stamplay.Object("blogs").save($scope.newPost)
            .then(function(res){
               $timeout(function(){
                  ngToast.create("Post Created Successfully!")
               })
               $state.go('MyBlogs');
            },function(err){
               $timeout(function(){
                  ngToast.create("An error has occured while creating the post. Please try later.")
               })
               console.log(err);
            })
         }
         else{
            $state.go('login');
         }
      },function(err){
         $timeout(function(){
            ngToast.create("An error has occured. Please try later.")
         })
         console.log(err);
      });
   }
});

app.controller('MainCtrl', function($scope){
   $scope.logout = function(){
      console.log("logout called")
      localStorage.removeItem('127.0.0.1:8080-jwt');

      console.log("Logged out!");
      $timeout(function(){
         $rootScope.loggedIn = false;
      })
   }
})

app.controller('LoginCtrl', function($scope, $state, $timeout, $rootScope, ngToast){
   $scope.login = function(){
      Stamplay.User.currentUser()
      .then(function(res){
         console.log(res);
         if(res.user){
            //user already logged in
            $rootScope.loggedIn = true;
            $rootScope.displayName = res.user.firstName + " " + res.user.lastName;
            $timeout(function(){
               $state.go("MyBlogs");
            });
         }
         else{
            //proceed with login
            Stamplay.User.login($scope.user)
            .then(function(res){
               console.log("logged in" + res);
               $timeout(function(){
                  ngToast.create("Login Successful!");
               });
               $rootScope.loggedIn = true;
               $rootScope.displayName = res.user.firstName + " " + res.user.lastName;
               $timeout(function(){
                  $location.path("/viewBlogs");
               });
            }, function(err){
               console.log(err);
               $rootScope.loggedIn = false;
               $timeout(function(){
                  ngToast.create("Login Failed!");
               });
            })
         }
      }, function(error){
         console.log(error);
         $timeout(function(){
            ngToast.create("An error has occured. Please try again later.");
         });
      });
   }
});

app.controller('SignUpCtrl',function($scope, ngToast){
   $scope.newUser={};

   $scope.signup = function(){
      $scope.newUser.displayName = $scope.newUser.firstName + " " + $scope.newUser.lastName;
      if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
         console.log("All fields are valid!");

         if($scope.newUser.password == $scope.newUser.confirmPassword){
            console.log("All good! Let's sign up!");
            Stamplay.User.signup($scope.newUser)
            .then(function(response){
               $timeout(function(){
                  ngToast.create("Your account has been created. Please login.");
               });
               console.log(response);
            }, function(error){
               $timeout(function(){
                  ngToast.create("An error has occured. Please try again later.");
               });
               console.log(error);
            });
         }
         else{
            $timeout(function(){
               ngToast.create("Passwords do not match!");
            });
            console.log("Passwords do not match!");
         }
      }
      else{
         $timeout(function(){
            ngToast.create("Some fields are invalid!");
         });
         console.log("Some fields are invalid!");
      }
   }
})

app.controller('HomeCtrl', function($scope, $http){
   Stamplay.Object("blogs").get({ sort: "-dt_create" })
   .then(function(res){
      console.log(res);
      $scope.latestBlogs = res.data;
      $scope.$apply();
      console.log($scope.latestBlogs);
   }, function(err){
      console.log(err);
   });
});

app.controller('MyBlogsCtrl', function($scope, $state){
   Stamplay.User.currentUser().then(function(res){
      if(res.user){
         Stamplay.Object("blogs").get({ owner: res.user._id, sort:"-dt_create" })
         .then(function(response){
            console.log(response);
            $scope.userBlogs = response.data;
            $scope.$apply();
            console.log($scope.userBlogs);
         }, function(err){
            console.log(err);
         });
      }
      else{
         $state.go('login');
      }
   },function(err){
      console.log(err);
   });
});

app.controller('EditCtrl',function(taOptions, $state, $scope, $stateParams, $timeout, ngToast){
   $scope.Post={};

   taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
   ];

   Stamplay.Object("blogs").get({ _id : $stateParams.id })
   .then(function(res){
      console.log(res);
      $scope.Post = res.data[0];
      $scope.$apply();
      console.log($scope.Post);
   }, function(err){
      console.log(err);
   });

   $scope.update = function(){
      Stamplay.User.currentUser().then(function(res){

         if(res.user){
            if(res.user._id == $scope.Post.owner){
               Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
               .then(function(response){
                  console.log(response);
                  $state.go("MyBlogs");
               }, function(error){
                  console.log(error)
               });
            }
            else{
               $state.go("login");
            }
         }
         else {
            $state.go("login");
         }
      }, function(err){
         console.log(err);
      });
   }
});
