#!/usr/bin/env coffee

#FirstRally = require "./dist/firstrally-api"
FirstRally = require "./src/api.coffee"

FirstRally.set
 api_key: "66fef8f84648b0a9190265296bb210c9"
 api_key_secret: "a11dc2b47c9f059d31a1d1d3b63723c90802bcdaaa0cb890b85c89971b591bf1"

FirstRally.DataStream.list (error, body) ->
  # If no error, body is a list of streams. See documentation.

FirstRally.DataStream.subscribe "coinbase/usd/btc",
  message: (message) ->
    console.log message
  subscribe: () ->
    console.log "Subscribed!"

    # Example of what you *can't* do: Send messages.
    # You can only receive messages with our API, so you'll receive an error.
    publication = FirstRally.DataStream.client.publish("/coinbase/usd/btc", {something: "Something"})

    publication.then () ->
      # Shouldn't ever get here.
      console.log('Message received by server!')
    , (error) ->
      console.log('There was a problem: ' + error.message)

setTimeout () ->
  console.log "Unsubscribing from stream..."
  FirstRally.DataStream.unsubscribe "coinbase/usd/btc"
, 30000