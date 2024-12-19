Change of network detection 

types of network changes possible

For mobile 

mobile date to wifi 
wifi to mobile data
wifi to another wifi
turn off wifi/ mobile data and turning back on 

for destop or laptop

Wi-Fi to Wired Ethernet
Wired Ethernet to Wi-Fi
Wi-Fi to Another Wi-Fi Network
Disabling and Re-enabling Wi-Fi/Ethernet


ways to detect the change 
using navigator.online and offline methods
using web socket with onClose method 
using web socket with heartbeat method to detect connection close 
using navigator.connection.effectiveType (not supported for all browser,supports only chrome)

scenario for browser in destop :-
    change detection using web socket 
        in case of  change of internet and detect that change using web socket (not working for destop)

    change detection using navigator.online method 
        when user turn off and turn on the ethernet and wifi and connect to same network back (working) 
        when user turn off ethernet and then connect to wifi or visa versa (working)
        when user is on wifi and then connected to ethernet while keeping the wifi still on in that scenario a soft handover happen and there is no break of internet connect  visa versa (not working)

scenario for browser in mobile:-
