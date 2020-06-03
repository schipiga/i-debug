`idebugger` - interactive nodejs debugger in order to execute commands in imperative manner.

Quick Use
=========


```bash
npm i idebugger
```

```js
// my-script.js
const idebugger = require('idebugger');

const func = () => {
    throw Error('BOOM');
};

const main = async () => {
    let result = 10;
    try {
        result = func(); // or `async func()`, promises are supported
    } catch (e) {
        await eval(idebugger);
    }
    return result;
};

main();
```

```bash
node my-script.js
```

It runs debug code in the same context and you have access to all internal functions and variables. Enjoy!
