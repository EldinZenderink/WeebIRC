app.controller('settingsCtrl', ['$rootScope', '$scope', '$location', 'comServer', 'storage', 'serverDetection', function ($rootScope, $scope, $location, comServer, storage, serverDetection ) {
     //change page title and navbar title to this page
    $scope.$emit('changeConfig', {
        pageTitle: 'WeebIRC | Settings',
        navbarTitle: 'Settings',
        navbarColor: 'green'
    });
    
    comServer.sendMessage("ISCLIENTRUNNING");
    updateStoragePrinter();
    checkWeebIRCServerConnection();
    //irc client status
    var askedOnce = false;
    $scope.$on('ServerMessageReceived', function (event, args) {
        if(args.indexOf("clientisnotrunning") > -1){
           $scope.ircClientConnectionStatus = "Not Connected";
           $scope.connectOrReconnect = "Connect";
           $scope.$emit('ircDisconnected');
           if(!askedOnce){
                if(!storage.retreiveFromStorage('firstlaunch')[0].firstlaunch){
                    $('#connectToIrc').openModal();
                }
           }
            
           askedOnce = true;
           storage.resetStorage('irc_connection', {connected: false});
        } else if(args.indexOf("clientisrunning") > -1){
           $scope.ircClientConnectionStatus = "Connected";
           $scope.connectOrReconnect = "Reconnect";
           storage.resetStorage('irc_connection', {connected: true});
           $scope.$emit('ircConnected');
           $scope.$emit('CloseLoading');
        }
    });
    
    var settings = storage.retreiveFromStorage('settings')[0];
    $scope.server = settings.server;
    $scope.channels = settings.channels;
    $scope.username = settings.username;
    $scope.autoConnect = settings.autoConnect;
    
    $scope.generateUsername = function(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for( var i=0; i < 5; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        $scope.username = "WeebIRC_" + text;
        
    }
    
    $scope.saveAndReConnectIRC = function(){
        
        comServer.sendMessage("IRCCLOSE");
        
        var server = $scope.server;
        var channels = $scope.channels;
        var username = $scope.username;
        var autoConnect = $scope.autoConnect;
        
        var newSettings = {
            autoConnect: autoConnect,
            server: server,
            channels: channels,
            username: username
        }
        
        storage.resetStorage('settings', newSettings);
        
        var connectionString = "server: " + server + " channel: " + channels + ",#weebirc username: " + username + " junk: this is junk";
        comServer.sendMessage(connectionString);
        $scope.connectOrReconnect = "Reconnecting";
        setTimeout(function(){comServer.sendMessage("ISCLIENTRUNNING");}, 500);
    }
    
    $scope.disconnectIRC = function(){
        comServer.sendMessage("IRCCLOSE");
    }
    
   
    //weebirc server controls
    
    
           
    
    $scope.setAsDefaultServer = function(button, value){
        $.each($scope.servers, function(i, val){
           if(button == i){
               $('#server_' + button).addClass('blue');
           } else {
               $('#server_' + button).removeClass('blue');
           }
        });
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value))  
        {  
            storage.resetStorage('weebirc_server_address', 'http://' + value);
            Materialize.toast("Server address " + value + " is valid!", 4000);
        } 
        else if(value.match(/http\:\/\/www\.mydomain\.com\/version\.php/i)) 
        {
            storage.resetStorage('weebirc_server_address','http://' + value);
             Materialize.toast("Server address " + value+ " is valid!", 4000);
        } else {
            Materialize.toast("Server address " + value + " is not valid!", 4000);
        }
         $scope.weebserveraddress = storage.retreiveFromStorage('weebirc_server_address');
    }
    
    
    
    $scope.weebserveraddress = storage.retreiveFromStorage('weebirc_server_address');
    function checkWeebIRCServerConnection(){
        
        comServer.sendMessage("ISCLIENTRUNNING");
        var connected = storage.retreiveFromStorage('weebirc_server_connected')[0].isconnected;
        if(connected){
            $scope.serverConnectionStatus = "Connected!";
        } else {
            $scope.serverConnectionStatus = "Not Connected!";
        }
    }
    
    
    $scope.saveAddressKey = function(event){
        if(event.which === 13){
            storage.resetStorage('weebirc_server_address', $scope.weebserveraddress);
            $scope.$apply();
        }
    }
    
    $scope.saveAddressButton = function(){
         storage.resetStorage('weebirc_server_address', $scope.weebserveraddress);
         $scope.$apply();
    }
    
    $scope.resetAddress = function(){
         storage.resetStorage('weebirc_server_address', "http://" + $location.host());
         $scope.weebserveraddress = "http://" + $location.host();
         $scope.$apply();
    }
    
    //Delete storage things
    $scope.allStorages = storage.getCurrentAvailableStorages();
    $scope.deleteCertainStorage = function(thatcertainstorage){
        storage.deleteStorage(thatcertainstorage);
        $scope.allStorages = storage.getCurrentAvailableStorages();
        
        $scope.$apply();
    }
    
    $scope.deleteEverything = function(){
        var maxDeletes = 100;
        $.each($scope.allStorages, function(i, val){
            storage.deleteStorage(val);
            maxDeletes = maxDeletes - 1;
            if(maxDeletes == 0){
                return;
            }
        });
        $scope.allStorages = storage.getCurrentAvailableStorages();
        $scope.$apply();
    }
    
    //Default resolution
    var currentResolution = storage.retreiveFromStorage('default_resolution');
    if(currentResolution == '1080'){
        $scope.resB1 = "blue";
        $scope.resB2 = "";
        $scope.resB3 = "";
        $scope.resB4 = "";
    } else if(currentResolution == '720'){
        $scope.resB1 = "";
        $scope.resB2 = "blue";
        $scope.resB3 = "";
        $scope.resB4 = "";
    }else if(currentResolution == '480'){
        $scope.resB1 = "";
        $scope.resB2 = "";
        $scope.resB3 = "blue";
        $scope.resB4 = "";
    }else if(currentResolution == ''){
        $scope.resB1 = "";
        $scope.resB2 = "";
        $scope.resB3 = "";
        $scope.resB4 = "blue";
    }
            
          
    
    $scope.changeResolution = function(res){
        var resolutions = ["unknown", "480", "720", "1080"];
        $.each(resolutions, function(i, val){
            $('#' + val).removeClass("blue");
            if(val == res){
                $('#' + val).addClass("blue");
            }
        })
        
        storage.resetStorage('default_resolution', res);
        $scope.$apply();
    }
    
    
    
    //Debug console
    $scope.debugmessages = storage.retreiveFromStorage('debug_messages').reverse();
    
    //Show data from storage
    function updateStoragePrinter(){
         var allDataPerStorage = [];
         try{
                 
            $.each($scope.allStorages, function(i, val){
                if(val != ""){
                    var tempobj = {
                        storage: val, 
                        storagevalue: storage.retreiveFromStorage(val)
                        
                    };
                    allDataPerStorage.push(tempobj);
                }
            });
            $scope.allDataPerStorageValues = allDataPerStorage;
            $scope.allStorages = storage.getCurrentAvailableStorages();
         } catch(e){
             console.log("apparantly not today");
         }
    }
    
    //update those things
     setInterval(function(){
         comServer.sendMessage("ISCLIENTRUNNING");
        updateStoragePrinter();
        checkWeebIRCServerConnection();
        $scope.debugmessages = storage.retreiveFromStorage('debug_messages').reverse();
     }, 10000);
   
    setTimeout(function(){
         serverDetection.detectServers();
    }, 0);
    var interval = setInterval(function(){
        if(storage.retreiveFromStorage('server_ip').length > 1 && storage.retreiveFromStorage('server_ip') != null && storage.retreiveFromStorage('server_ip') !== undefined){
            $scope.servers = storage.retreiveFromStorage('server_ip');
            Materialize.toast("Found servers!", 4000);
            clearInterval(interval);
        }
    }, 200);
}]);