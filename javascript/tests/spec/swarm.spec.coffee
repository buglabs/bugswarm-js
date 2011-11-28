swarms = [ "17a98de7ae3ec0f55ccd4b266856de453ba4ea8e" ]
participation_key = "11b8cd10e071f98d97e2f4dcd44b5ef84ebff056"
resources = [ "82c05c2b50dda4b10f1981cf20f7cf06e54f5f54" ]

describe 'SWARM', ->

  describe '#connect', ->
    it 'can connect to swarm', (done) ->
      console.log 'testing swarm connection'
      SWARM.connect apikey: participation_key, resource: resources[0], swarms: swarms[0], onerror: errorHandler, onconnect: (done) ->
        console.log 'connected'
        done()
        return

      errorHandler = (error) ->
        console.log 'ERROR', error

      return


    it 'can recieve presence', (done) ->
      SWARM.connect apikey: participation_key, resource: resources[0], swarms: swarms[0], onpresence: (stanza) ->
      #  expect(stanza.presence).toBeTruthy()
        console.log 'OHAI'
        console.log stanza.presence
        done()
        return
      return

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
