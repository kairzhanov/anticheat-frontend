
var express = require('express');
var app = express();
app.use(express.static('./dist/anticheat-angular'));

app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: 'dist/anticheat-angular/'}
    );
  });

app.listen(process.env.PORT || 8080);