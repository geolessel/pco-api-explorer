# Planning Center API Explorer

## Getting started

1. Create a Personal Access Token for this app: [https://api.planningcenteronline.com/oauth/applications](https://api.planningcenteronline.com/oauth/applications)
2. Run this for development (hot reloading):
```bash
cd electron
npm install
npm run-script watch
```
3. To launch the app: `npm start`

## Troubleshooting

* If you've already put in your API id and secret but would like to reset it, open the developer tools
(cmd-opt-i) and in the js console:
```
localStorage.apiId = ''
localStorage.apiSecret = ''
```

* Press cmd-r to reload the page
