# Ih8JSON

Ih8JSON is a simple, fast, and safe web-framework that expedites development.

## Installation

Using npm

```bash
npm install iH8JSON
```

## Quickstart

```Javascript
import Server from 'ih8JSON';

// Mounts a server
// Creates a new server
const serv = new Server();

const privateRoutes = serv.mount("/private");

// Adds a middleware which is called in any child route of /private
privateRoutes.addMiddleware((req, res) => {
  const { body } = req;
  const isAuth = verifyCred(body.username, body.password); // Dummy function
  if (!isAuth) {
    // End the request if unauthorized
    res.statusCode = 403;
    res.end();
  } else {
    // Setting the Header for all child routes
    res.writeHead(200, { "Content-Type": "application/json" });
  }
});

// Adds a handler for HTTP GET Request on /private/data
// Optional store parameter which is Js object that gets passed to all Middleward and the final handler
// You can put whatever you want in the store.
privateRoutes.get("/data", (req, res, store) => {
  const { body, url, params, headers, method } = req;

  // Since we declared the Content-Type header in the /private middleware
  // The JS object is automatically transformed into a readable JSON format.
  return {
    secretData: "1010110001",
  };
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
