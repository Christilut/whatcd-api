# Gazelle API

Javascript Gazelle API based on promises.

# Installation

Requires Node >= 6.0

`npm install gazelle-api`


# Usage

Check [WhatCD API](https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation) for all available endpoints. For example, the browse action (which searches the tracker) requires a `searchstr` parameter so you must add that in the object passed to `gazelle.action()`.

```js
const GazelleAPI = require('gazelle-api')

const gazelle = new GazelleAPI('username', 'password', 'hostname')

gazelle.action('browse', {
  searchstr: 'my favourite band'
}).then(response => {
  console.log(response)
})
```

### Rate limited

This library is rate limited to 5 requests per 10 seconds as specified by the WhatCD API documentation. So if you notice a few fast requests and sometimes a slow one, its probably waiting on rate limiting.

# API

`gazelle.action(action=string, parameters=object)`: Low level method to perform any action as described in the WhatCD API documentation.

`gazelle.search(artist=string, album=string)`: Helper method that searches for an artist/album. It will start at 320kbps and search for a V0 release if nothing was found.

`gazelle.download(id=integer, path=string)`: Helper method to download a .torrent file from the torrent ID that was supplied. Will save to specified path. Path must not include a filename.

# Testing

`npm test` (will use fixtures)

Some tests require a username and password:  
`env GAZELLE_USERNAME='' GAZELLE_PASSWORD='' npm run test`

For a live test (not currently working):  
`env GAZELLE_USERNAME='' GAZELLE_PASSWORD='' LIVE=true npm test -- -g 'search'`

Careful not to get banned for multiple false login attempts. Some tests currently only work with PTH.

# Contribute

Pull requests very welcome! <3  
Please create an issue if you find a bug.

# License

MIT aka do whatever you want.
