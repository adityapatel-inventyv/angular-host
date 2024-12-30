# Change of network detection 
## Types of Network Changes Possible

### For Mobile
- Mobile data to Wi-Fi
- Wi-Fi to mobile data
- Wi-Fi to another Wi-Fi
- Turning off Wi-Fi/mobile data and turning it back on

### For Desktop or Laptop
- Wi-Fi to Wired Ethernet
- Wired Ethernet to Wi-Fi
- Wi-Fi to another Wi-Fi network
- Disabling and re-enabling Wi-Fi/Ethernet

## Ways to Detect the Change
- Using `navigator.online` and `offline` methods (Note: This may result in false positives or false negatives in some scenarios and may vary depending on the browser. There may also be delays.)
- Using WebSocket with `onClose` method
- Using WebSocket with heartbeat method to detect connection close
- Using `navigator.connection.effectiveType` (Note: This is not supported by all browsers, only supported in Chrome)

## Scenarios for Browser in Desktop
### Change Detection Using WebSocket
- Detecting change of internet connection using WebSocket (Not Working for desktop)

### Change Detection Using `navigator.online` Method
- When user turns off and turns on the Ethernet or Wi-Fi and connects to the same network back or other network (Working)
- When user turns off Ethernet and then connects to Wi-Fi or vice versa (Working)
- When user is on Wi-Fi and then connects to Ethernet while keeping the Wi-Fi still on, resulting in a soft handover with no break in internet connection (Not Working)

## Scenarios for Browser in Mobile
### Change Detection Using WebSocket
- When user turns off and turns on the Internet or Wi-Fi and connects to the same network back or other network (Working)
- When user turns off Internet and then connects to Wi-Fi or vice versa (Working)
- When user is on Internet and then connects to Wi-Fi, while still keeping the Internet on in that process (Working)
- When user is on Wi-Fi and Internet is off, when user turns on the Internet but keeps the Wi-Fi on, due to the priority of the Wi-Fi first it does not get switched. After turning off the Wi-Fi and seeing the result (Working)

### Change Detection Using `navigator.online` Method
- When user turns off and turns on the Internet or Wi-Fi and connects to the same network back or other network (Working)
- When user turns off Internet and then connects to Wi-Fi or vice versa (Working)
- When user is on Internet and then connects to Wi-Fi, resulting in a soft handover with no break in internet connection (Not Working)
- When user is on Wi-Fi and Internet is off, when user turns on the Internet but keeps the Wi-Fi on, due to the priority of the Wi-Fi first it does not get switched. After turning off the Wi-Fi and seeing the result (Working)

## Trace Route 
There is no available package for this due to the low-level code required to achieve this in a browser. It is not possible to implement this in a browser due to privacy reasons.
