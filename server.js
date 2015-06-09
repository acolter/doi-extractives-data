#!/usr/bin/env node
var express = require('express');
var cons = require('consolidate');
var extend = require('extend');
var assert = require('assert');
var Festoon = require('festoon');

var helpers = require('./lib/server-helpers');
var view = helpers.view;
var redirect = helpers.redirect;
var api = helpers.api;

var app = express();

// render html with nunjucks
app.engine('html', cons.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

var data = new Festoon({
  path: __dirname + '/output',
  sources: {
    // master resources (commodities) list, plus other metadata
    resources:  './data/commodities.json',

    locations: {
      onshore: '#states',
      offshore: '#offshoreAreas'
    },

    // revenues
    nationalRevenue: {
      onshore: '#stateRevenues',
      offshore: '#offshoreRevenues'
    },

    // production volumes
    nationalProduction: {
      onshore: '#stateProduction',
      offshore: '#offshoreProduction'
    },

    // state data sources
    states: './input/geo/states.csv',
    state: {
      // {{ state.meta.name }}
      meta: Festoon.findByParam('states', 'state', 'abbr'),
      // {{ state.revenues[] }}
      revenues: Festoon.transform.filter('stateRevenues', function(d) {
        return d.State === this.state;
      }),
      // {{ state.production[] }}
      production: Festoon.transform.filter('stateProduction', function(d) {
        return d.State === this.state;
      })
    },

    // offshore planning areas
    offshoreAreas: './input/geo/offshore/areas.tsv',
    offshoreArea: {
      // {{ area.meta.name }}
      meta: Festoon.findByParam('offshoreAreas', 'area', 'id'),
      // {{ area.revenues[] }}
      // TODO: Area column should be a 3-letter ID, not name
      revenues: Festoon.transform.filter('offshoreRevenues', function(d) {
        return d.Area === this.area;
      }),
      // {{ area.production[] }}
      // TODO: Area column should be a 3-letter ID, not name
      production: Festoon.transform.filter('stateProduction', function(d) {
        return d.Area === this.area;
      })
    },

    // state (onshore) sources
    stateRevenues:      'state/revenues-yearly.tsv',
    stateProduction:    'state/volumes-yearly.tsv',

    // county data sources
    countyRevenues:     'county/by-state/:state/revenues-yearly.tsv',
    allCountyRevenues:  'county/revenues-yearly.tsv',

    // offshore (planning area) sources
    offshoreRevenues:   'offshore/revenues-yearly.tsv',
    offshoreProduction: 'offshore/volumes-yearly.tsv',
  }
});


// common data
app.use(data.decorate(['resources', 'locations']));

// static assets
app.use('/static', express.static(__dirname + '/static'));

// index
app.get('/', view('index'));

// locations page
app.get('/locations',
  view('locations'));

app.get('/locations/onshore', redirect('/locations'));

// state page
app.get('/locations/onshore/:state.json',
  data.decorate('state'),
  api('state'));

// state page
app.get('/locations/onshore/:state/revenues.(csv|json)',
  data.decorate('stateRevenues'),
  api('stateRevenues', {filter: true}));

// state page
app.get('/locations/onshore/:state',
  data.decorate('state'),
  view('state'));

// offshore area page
app.get('/locations/offshore/:area',
  data.decorate({area: 'offshoreArea'}),
  view('offshore-area'));

app.listen(process.env.PORT || 4000, function(error) {
  if (error) return console.error('error:', error);
  var listener = this;
  var addr = listener.address();
  console.log('listening @ http://%s:%d', '127.0.0.1', addr.port);
  process.on('exit', function() {
    listener.close();
  });
});
