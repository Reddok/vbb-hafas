'use strict'

const parse = require('./parse')
const hafas = require('hafas-client')

const endpoint = 'http://fahrinfo.vbb.de/bin/mgate.exe'
const client = {type: 'IPA', id: 'BVG'}
const ext = 'VBB.2'
const version = '1.11'
const auth = {type: 'AID', aid: 'hafas-vbb-apps'}
const onBody = (body) => {
	return Object.assign(body, {client, ext, ver: version, auth})
}

const onLine = parse.line
const onLocation = parse.location

const request = hafas({endpoint, onBody, onLine, onLocation})
module.exports = request
