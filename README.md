# Planning Center API Explorer

## Getting started

1. Create a Personal Access Token for this app:
   [https://api.planningcenteronline.com/oauth/applications](https://api.planningcenteronline.com/oauth/applications)

2. Run this for development (hot reloading):

  ```bash
  cd electron
  npm install
  npm run-script watch
  ```

3. To launch the app: `npm start`

## Troubleshooting

* Press `cmd-opt-i` to open the developer tools

* Press `cmd-r` to reload the page after any changes made in the console

* If you've already put in your API id and secret but would like to reset it, open the developer tools
  (`cmd-opt-i`) and in the js console:

  ```javascript
  localStorage.apiId = ''
  localStorage.apiSecret = ''
  ```
  
  These values are stored locally so are retained between app sessions.
    

* If you'd like to point the app to a different API endpoint,
  you can do so by opening the developer tools and in the js console:

  ```javascript
  sessionStorage.apiRoot = '<ENDPOINT INCLUDING HTTP/HTTPS>'
  ```
  
  This value is stored for this session only so will reset to production on app restart. Note that your API
  key and secret will likely also have to be reset.
