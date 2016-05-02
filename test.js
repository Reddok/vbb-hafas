#!/usr/bin/env node
'use strict'

const a              = require('assert')
const isRoughlyEqual = require('is-roughly-equal')
const stations       = require('vbb-stations-autocomplete')

const hafas          = require('./index.js')

a.ok(process.env.VBB_API_KEY && process.env.VBB_API_KEY.length > 0,
	'No VBB API key set. Please add an env variable `VBB_API_KEY')
const key = process.env.VBB_API_KEY

// fixtures
const when = new Date('Mon April 28 2016 19:53:42 GMT+0200 (CEST)')
const minute = 60 * 1000

const findStation = (name) => stations(name, 1)[0]

const validStation = (s) =>
	s.type === 'station'
	&& 'number' === typeof s.id
	&& 'string' === typeof s.name
	&& findStation(s.name)
	&& 'number' === typeof s.latitude
	&& 'number' === typeof s.longitude



// test for hafas.departures
hafas.departures(key, 9042101, { // U Spichernstr.
	  results: 4
	, when
}).then((deps) => {
	a.ok(Array.isArray(deps), 'does not resolve with an array')
	a.strictEqual(deps.length, 4)

	for (let dep of deps) {

		a.strictEqual(dep.stop, 9042101) // id from query

		a.ok('type' in dep, 'Missing type property.')

		a.ok('direction' in dep, 'Missing direction property.')
		a.ok(findStation(dep.direction),
			'The direction property seems to be wrong')

		a.ok('when' in dep, 'Missing when property.')
		a.ok(isRoughlyEqual(30 * minute, dep.when, when), 'Departure time seems to be far off.')
	}
})



// test for hafas.routes
hafas.routes(key, 9042101, 9009101, { // U Spichernstr. to U Amrumer Str.
	  results: 3
	, when
}).then((routes) => {
	a.ok(Array.isArray(routes), 'does not resolve with an array')
	a.strictEqual(routes.length, 3)

	for (let route of routes) {
		a.ok(isRoughlyEqual(20 * minute, 10 * minute, route.duration),
			'Duration seems to be far off.')

		a.ok('parts' in route, 'Missing parts property.')
		a.ok(Array.isArray(route.parts), 'parts property is not an array.')

		for (let part of route.parts) {
			a.ok('from' in part, 'Missing from property.')
			a.ok(validStation(part.from), 'The from property seems to be invalid.')
			a.ok('to' in part, 'Missing to property.')
			a.ok(validStation(part.to), 'The to property seems to be invalid.')

			a.ok(isRoughlyEqual(30 * minute, part.start, when), 'Start time seems to be far off.')
			a.ok(isRoughlyEqual(50 * minute, part.end, when), 'End time seems to be far off.')

			a.ok('transport' in part, 'Missing transport property.')
			if (part.transport === 'public') {
				a.ok('type' in part, 'Missing type property.')

				a.ok('direction' in part, 'Missing direction property.')
				a.ok(findStation(part.direction),
					'The direction property seems to be wrong.')
			}
		}
	}
})