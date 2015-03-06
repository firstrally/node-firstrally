#!/usr/bin/env coffee

fs = require "fs"

#FirstRally = require "./dist/firstrally-api"
FirstRally = require "./src/api.coffee"

FirstRally.set
 api_key: "66fef8f84648b0a9190265296bb210c9"
 api_key_secret: "a11dc2b47c9f059d31a1d1d3b63723c90802bcdaaa0cb890b85c89971b591bf1"

# FirstRally.DataStream.list (error, body) ->
#   console.log body
  # If no error, body is a list of streams. See documentation.

# FirstRally.User.update_profile
#   first_name: "Tim"
#   last_name: "Coulter"
#   email: "tim@timothyjcoulter.com"
#   password: "Wrong password!"
# , (error, json) ->
#   console.log error
#   console.log error instanceof Error

# FirstRally.Conversion.current, "usd", "btc" (error, json) ->
#   console.log error, json

# FirstRally.DataStream.subscribe "coinbase/usd/btc",
#   message: (message) ->
#     console.log message
#   subscribe: () ->
#     console.log "Subscribed!"

#     # Example of what you *can't* do: Send messages.
#     # You can only receive messages with our API, so you'll receive an error.
#     publication = FirstRally.DataStream.client.publish("/coinbase/usd/btc", {something: "Something"})

#     publication.then () ->
#       # Shouldn't ever get here.
#       console.log('Message received by server!')
#     , (error) ->
#       console.log('There was a problem: ' + error.message)

# setTimeout () ->
#   console.log "Unsubscribing from stream..."
#   FirstRally.DataStream.unsubscribe "coinbase/usd/btc"
# , 30000

# now = new Date()
# yesterday = new Date(now.getTime() - 86400000)

# FirstRally.DataBatch.quote "coinbase/usd/btc", yesterday, now, (error, quote) ->
#   console.log error, quote

#   FirstRally.DataBatch.create quote, (error, json) ->
#    console.log error, json

FirstRally.DataBatch.status 28, (error, json) ->
  if !json.batch_file?
    console.log "No downloadable batch file yet."
    return

  console.log json

#   FirstRally.BatchFile.download json.batch_file.id, (response) ->
#     response.on "error", (err) ->
#       console.log "Error! #{err.message}"
#     .pipe(fs.createWriteStream(json.batch_file.file_name))