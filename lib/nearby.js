'use strict'

const request = require('./request')
const stringify = require('hafas-client/stringify')
const parse = require('./parse')
const shorten = require('vbb-short-station-name')



const defaults = {
	distance: null, // maximum walking distance in meters
	poi:      false, // return points of interest?
	stations: true, // return stations?
}



const nearby = (latitude, longitude, opt) => {
	if ('number' !== typeof latitude) throw new Error('latitude must be a number.')
	if ('number' !== typeof longitude) throw new Error('longitude must be a number.')
	opt = Object.assign({}, defaults, opt || {})

	return request({
		  cfg: {polyEnc: 'GPA'}
		, meth: 'LocGeoPos'
		, req: {
			  ring: {
				  cCrd: {
				  	  x: stringify.coord(longitude)
				  	, y: stringify.coord(latitude)
				}
				, maxDist: opt.distance ? -1 : opt.distance
				, minDist: 0
			}
			, getPOIs: opt.poi
			, getStops: opt.stations
		}
	})
	.then((d) => {
		return Array.isArray(d.locL)
			? d.locL.map(parse.nearby).map((n) => {
				n.name = shorten(n.name)
				return n
			})
			: []
	})
}

module.exports = nearby
