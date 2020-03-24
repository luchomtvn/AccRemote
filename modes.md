# Device not keyed (i.e. new device)

| Feature                       | BT 1| BT 2| WiFi 1 | WiFi BT 1 Invited |
| :--- | :---: | :---: | :---: | :---: |
| Set Master key (--> Keyed)    | √ (becomes Master)|No Access|No Access|No Access |


# Device with key set by BT 1

| Feature                       | BT 1| BT 2| WiFi 1 | WiFi BT 1 Invited |
| :--- | :---: | :---: | :---: | :---: |
Set Master key   | √ (becomes Master)| N/A    | N/A |N/A |
|Access w/o password           | √                     |Only if device has no password | √      | √                 |
| Access with password          | √                     | √                         | √      | √                 |
| Set Temperature               | √                     | √                         | √      | √                 |
| Set Current time              | √ (HH:MM:am/pm)       | √ (HH:MM:am/pm)           | √ (TZ) | No                |
| Access Master Mode            | √                     | No                        | No     | No                |
| Clear key (--> not keyed)     | √                     | No                        | No     | No                |
Set password for BT access    | √                     | No                        | No     | No                |
Change password for BT access | √                     | No                        | No     | No                |
Clear password for BT access  | √                     | No                        | No     | No                |
Share access to others (*)    | √                     | No                        | No     | No                |
Access after password changed | √                     | No                        | √      | No                |

(*) any change or clear on password will block access to all shared codes

# BT 1 clears key. After that BT 2 sets it key in the device:

| Feature                       | BT 1| BT 2| WiFi 1 | WiFi BT 1 Invited |
| :--- | :---: | :---: | :---: | :---: |
| Access                        | Same as column BT 2 above | Same as column BT 1 above     | No     | No                |

