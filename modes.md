| --------------- | ----------------------------- | --------------------- | ------------------------- | ------ | ----------------- |
| Device          | Feature                       | BT 1                  | BT 2                      | WiFi 1 | WiFi BT 1 Invited |
| --------------- | ----------------------------- | --------------------- | ------------------------- | ------ | ----------------- |
| Not keyed       | Set Master key (--> Keyed)    | √ (becomes Master)    | √ (becomes Master)        | N/A    | N/A               |
| (No Master key) |                               |                       |                           |        |                   |
| --------------- | ----------------------------- | --------------------- | ------------------------- | ------ | ----------------- |
|                 | Access w/o password           | √                     | If device has no password | √      | √                 |
|                 | Access with password          | √                     | √                         | √      | √                 |
|                 | Set Temperature               | √                     | √                         | √      | √                 |
|                 | Set Current time              | √ (HH:MM:am/pm)       | √ (HH:MM:am/pm)           | √ (TZ) | No                |
|                 | Access Master Mode            | √                     | No                        | No     | No                |
| Keyed by BT 1   | Clear key (--> not keyed)     | √                     | No                        | No     | No                |
|                 | Set password for BT access    | √                     | No                        | No     | No                |
|                 | Change password for BT access | √                     | No                        | No     | No                |
|                 | Clear password for BT access  | √                     | No                        | No     | No                |
|                 | Share access to others (*)    | √                     | No                        | No     | No                |
|                 | Access after password changed | √                     | No                        | √      | No                |
| --------------- | ----------------------------- | --------------------- | ------------------------- | ------ | ----------------- |
| Keyed by BT 2   | Access                        | See column BT 2 above | See column BT 1 above     | No     | No                |
| --------------- | ----------------------------- | --------------------- | ------------------------- | ------ | ----------------- |


(*) any change or clear on password will block access to all shared codes