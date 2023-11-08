
const fs = require('fs')

var args = process.argv.slice(2);

fs.writeFileSync(args[1], 
`
const bytenode = require('bytenode');
const loader = require('./${args[0]}')
`)