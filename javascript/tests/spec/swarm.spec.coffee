config = {
   "producer_key": "2526b7ea177b1a3db5706f23cf6e9b8a7d2c1382"
 , "consumer_key": "d0a1ef4bdc1b06e8fa144a2bfec2ef32df59978f"
 , "swarms": [ "2fe24b7c3132b4ebdf08054d6391f40da43779a4" ]
 , "resources": [ "" ]
}

describe 'Swarm', ->

  resources = config.resource_ids
  config_key = config.configuration_key
  swarms = config.swarm_ids

  it 'can connect to swarm', ->
    SWARM.connect apikey: config_key, resource: resources[0], swarms: swarms[0], onconnect: ->
      expect(true).toEqual(true)

  it 'can connect to swarm', ->
    SWARM.connect apikey: config_key, resource: resources[0], swarms: swarms[0], onmessage: onmessage, onpresence: onpresence

    onmessage = (stanza) ->
      expect(stanza.message).toBeTruthy()

    onpresence = (stanza) ->
      expect(stanza.presence).toBeTruthy()

  it 'can push data to a swarm', ->
    expect(false).toBeTruthy()

  it 'can recieve its own messages', ->
    expect(false).toBeTruthy()

  it 'can recieve messages and who it came from', ->
    expect(false).toBeTruthy()

  it 'is alerted of new participants', ->
    expect(false).toBeTruthy()

  it 'is alerted of current participants upon joining', ->
    expect(false).toBeTruthy()
