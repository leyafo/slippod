const si = require('systeminformation');

// promises style - new since version 3
si.cpu()
  .then(data => console.log('cpu======',data))
  .catch(error => console.error(error));


si.system().then(data => console.log('system=======',data));

si.uuid().then(data => console.log('uuid========',data));