angular-mock-server
==============
### Angular 10 with a simple mock server with NodeJS
A simple mock server with NodeJS for Angular development. Speedup development with mock server (RESTful APIs)



### Requires Angular 2.x

  
## How to use
Add JSON file 'mocks' folder - This file represents the response

In mocks-config - Define list of APIs and the corresponding response json file.
By default the response will be HTTP GET method, but you can define any HTTP Method you like.
```javascript
const urls = {
    '/example': {
        'mockJson': 'dummy.pagination',
        GET: function (req, matchedJsonMap, mockJson) {
            return matchedJsonMap.get(mockJson);
        },
        POST: function (req, matchedJsonMap, mockJson) {
            const data = matchedJsonMap.get(mockJson);
            const bodyData = req.body;
            bodyData.id = data[data.length - 1].id + 1;
            data.push(bodyData);
            matchedJsonMap.set(mockJson, data);
            return bodyData;
        },
    },
    '/example/anothe-api': {
        'mockJson': 'dummy.pagination',
        GET: function (req, matchedJsonMap, mockJson) {
            return matchedJsonMap.get(mockJson);
        },
        POST: function (req, matchedJsonMap, mockJson) {
            const data = matchedJsonMap.get(mockJson);
            const bodyData = req.body;
            bodyData.id = data[data.length - 1].id + 1;
            data.push(bodyData);
            matchedJsonMap.set(mockJson, data);
            return bodyData;
        },
    }
}
```
In angular.json - add new property 'proxyConfig' in 'serve' (Development) 
```json (in , )
...
"serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "angular-simple-mock-server:build",
            "proxyConfig": "proxy.mock.config.js"
          },
....
```

Use the mock server in Angular service:
```typescript
   export class ExampleService {
     private baseUrl = '/example';
   
     constructor(private http: HttpClient) { }
   
     public getServerDate(id: number): Observable<Dummy> {
       const url = this.baseUrl;
       return this.http.get<Dummy>(url);
     }
   }
```

### License
 The MIT License
 
 Copyright (c) 2020 Motty Green
