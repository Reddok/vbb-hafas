# `journeyPart(ref, lineName, [opt])`

This method can be used to refetch information about a leg of a journey.

Let's say you used [`journeys`](journeys.md) and now want to refresh the arrival/departure data of a leg. You'd pass in a journey part ID like `'1|24983|22|86|18062017'`. `lineName` must be the name of the journey part's line. You can get them like this:

```js
const hafas = require('vbb-hafas')

hafas.journeys('900000003201', '900000024101', {results: 1})
.then(([journey]) => {
	const part = journey.parts[0]
	return hafas.journeyPart(part.id, part.line.name)
})
.then(console.log, console.error)
```

With `opt`, you can override the default options, which look like this:

```js
{
	when: new Date()
}
```

## Response

*Note*: The `departure` and `arrival` fields contain realtime information if available. The `delay` field expresses how much they differ from the schedule.

With `ref = '1|28220|3|86|19062017'`, `lineName = 'RB14'` and `when: 1497879430242`, the response looks like this:

```js
{
	id: '1|28220|3|86|19062017',
	line: {
		type: 'line',
		name: 'RB14',
		class: 64,
		productCode: 6,
		productName: 'RB',
		product: 'regional',
		mode: 'train',
		id: 'rb14',
		symbol: 'RB',
		nr: 14,
		metro: false,
		express: false,
		night: false
	},
	direction: 'Nauen, Bahnhof',
	passed: [
		{
			station: {
				type: 'station',
				id: '900000260005',
				name: 'S Flughafen Berlin-Schönefeld',
				coordinates: {latitude: 52.390796, longitude: 13.51352},
				products: { /* … */ }
			},
			departure: '2017-06-19T15:03:00+02:00'
		}, {
			station: {
				type: 'station',
				id: '900000162001',
				name: 'S Karlshorst',
				coordinates: {latitude: 52.481039, longitude: 13.525979},
				products: { /* … */ }
			},
			arrival: '2017-06-19T15:14:00+02:00',
			departure: '2017-06-19T15:16:00+02:00'
		}, {
			station: {
				type: 'station',
				id: '900000210005',
				name: 'Nauen, Bhf',
				coordinates: {latitude: 52.612335, longitude: 12.885156},
				products: { /* … */ }
			},
			arrival: '2017-06-19T16:20:00+02:00'
		}
	]
}
```
