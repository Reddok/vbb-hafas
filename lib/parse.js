'use strict'

const parse = require('hafas-client/parse')
const util = require('vbb-util')
const omit = require('lodash.omit')
const parseLineName = require('vbb-parse-line')
const oldToNew = require('vbb-translate-ids/old-to-new.json')
const slugg = require('slugg')
const stations = require('vbb-stations')



const modes = [
	'train',
	'train',
	'train', // see public-transport/friendly-public-transport-format#4
	'bus',
	'ferry',
	'train',
	'train',
	null
]

const modesByClass = []
modesByClass[1] = modes[0]
modesByClass[2] = modes[1]
modesByClass[4] = modes[2] // see public-transport/friendly-public-transport-format#4
modesByClass[8] = modes[3]
modesByClass[16] = modes[4]
modesByClass[32] = modes[5]
modesByClass[64] = modes[6]

const line = (p) => {
	const r = parse.line(p)
	if (!r) return null
	if (r.productCode) {
		r.productCode = parseInt(r.productCode)
		r.product = (util.products.categories[r.productCode] || {}).type || null
		r.mode = modes[r.productCode]
	} else if (r.class) {
		r.product = (util.products.bitmasks[r.class] || {}).type || null
		r.mode = modesByClass[r.class]
	}
	if (r.name) {
		r.id = slugg(r.name.trim())

		const l = parseLineName(r.name)
		if (l && l.type) {
			Object.assign(r, omit(l, ['type', '_']))
			if (!r.product) r.product = util.products[l.type].type
		}
	}
	return r
}

const journey = (l, p, r) => parse.journey('Europe/Berlin', l, p, r, journeyPart)

const leadingZeros = /^0+/

const location = (l) => {
	const r = parse.location(l)

	if (r.id) r.id = r.id.replace(leadingZeros, '')
	if ('products' in r) r.products = util.products.parseBitmask(r.products)
	if (r.id) {
		r.id = oldToNew[r.id] || (r.id + '')
	}
	if (r.type === 'station' && !r.coordinates) {
		const [s] = stations(r.id)
		if (s) {
			r.coordinates = {
				latitude: s.coordinates.latitude,
				longitude: s.coordinates.longitude
			}
		}
	}
	return r
}

const nearby = (l) => {
	const r = parse.nearby(l)
	r.id = oldToNew[r.id] || (r.id + '')
	if ('products' in r) r.products = util.products.parseBitmask(r.products)
	return r
}

// todo: pt.sDays
// todo: pt.dep.dProgType, pt.arr.dProgType
// todo: what is pt.jny.dirFlg?
// todo: how does pt.freq work?
// tz = timezone, s = stations, ln = lines, r = remarks, c = connection
const journeyPart = (tz, s, ln, r, c) => (d) => {
	const res = parse.part(tz, s, ln, r, c)(d)
	res.id = d.jny && d.jny.jid || null
	res.direction = d.jny && d.jny.dirTxt || null // todo: parse this
	// todo: isPartCncl, isRchbl, poly

	if (res.line) res.mode = res.line.mode
	if (d.jny && d.jny.stopL) {
		res.passed = d.jny.stopL.map(parse.stopover(tz, s, ln, r, c))
	}
	if (d.jny && Array.isArray(d.jny.remL)) {
		d.jny.remL.forEach(parse.applyRemark(s, ln, r))
	}

	return res
}

module.exports = {line, journey, location, nearby, journeyPart}
