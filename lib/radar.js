'use strict'

const request = require('./request')
const util = require('vbb-util')
const parse = require('./parse')
const shorten = require('vbb-short-station-name')



const defaults = {
	// todo
}



const radar = (north, west, south, east, opt) => {
	if ('number' !== typeof north) throw new Error('north must be a number.')
	if ('number' !== typeof west) throw new Error('west must be a number.')
	if ('number' !== typeof south) throw new Error('south must be a number.')
	if ('number' !== typeof east) throw new Error('east must be a number.')
	opt = Object.assign({}, defaults, opt || {})

	return request({
		  meth: 'JourneyGeoPos'
		, req: {
			  maxJny: 256 // todo: number of vehicles?
			, onlyRT: false // todo: only realtime?
			, time: '005214' // todo
			, date: '20160812' // todo
			, rect: {
				llCrd: {x: 13338922, y: 52541363},
				urCrd: {x: 13358380, y: 52554721}
			}
			, perStep: 10000 // todo
			, ageOfReport: true // todo
			, jnyFltrL: [{type: 'PROD', mode: 'INC', value: '127'}] // todo
			, perSize: 30000 // todo
			, trainPosMode: 'CALC' // todo
		}
	})
	.then((d) => {
		if (!Array.isArray(d.jnyL)) return []
		return d.jnyL
		// if (!d.match || !Array.isArray(d.match.locL)) return []
		// const ls = d.match.locL.map(parse.location)
		// for (let l of ls) l.name = shorten(l.name)
		// return ls
		return d
	}, (err) => err)
}

module.exports = radar