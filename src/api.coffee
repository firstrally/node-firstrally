include = (factory) ->
  if module? and module.exports?
    request = require "request"
    btoa = require "btoa"
    jsSHA = require "../lib/jsSHA/src/sha512"
    faye = require "faye"
    module.exports = factory(false, request, jsSHA, btoa, faye)
  else
    if !$? and !jQuery?
      throw "FirstRally api requires jQuery."
      return
    jQuery = $ || jQuery

    # Mimic node request module for what we need.
    request = (options, done=(() ->)) ->
      options.type = options.method
      options.data = options.body
      options.processData = false

      success = (data, textStatus, jqXHR) ->
        done(null, {statusCode: jqXHR.status}, jqXHR.responseText)

      failure = (jqXHR, textStatus, errorThrown) ->
        done(null, {statusCode: jqXHR.status}, jqXHR.responseText)

      jQuery.ajax(options).then(success, failure)

    # Note: jsSHA's already included in the dist,
    # and btoa is a standard browser function.
    this.FirstRally = factory(true, request, jsSHA, btoa)
  return

include.call this, (inBrowser, request, jsSHA, btoa, Faye) ->

  # Note that Base holds a copy to the config object,
  # and all classes that extend Base hold a reference to
  # the same copy. 

  class Base
    @path_prefix: ""
    @config: 
      host: "bitcoinindex.es"
      scheme: "https"
      api_key: ""
      api_key_secret: ""
      version: "0.1"
    @inBrowser: inBrowser

    @set: (options) ->
      for key of options
        @config[key] = options[key]

    @path: (short_path) ->
      "/api/v#{@config.version}#{@path_prefix}#{short_path}"

    @url: (short_path) ->
      "#{@config.scheme}://#{@config.host}#{@path(short_path)}"
    
    @get: (short_path, done) ->
      return @make_request(short_path, "GET", null, done)

    @post: (short_path, json, done) ->
      return @make_request(short_path, "POST", json, done)

    @delete: (short_path, done) ->
      return @make_request(short_path, "DELETE", null, done)

    @make_request: (short_path, method, body, done=(()->)) ->
      path = @path(short_path)

      options =
        url: @url(short_path)
        headers: {}
        method: method

      if body?
        options.body = JSON.stringify(body)
        options.headers["Content-Type"] = "application/json"

      if @config.api_key != "" && @config.api_key_secret != ""
        shaObj = new jsSHA(path, "TEXT");
        signature = shaObj.getHMAC(@config.api_key_secret, "TEXT", "SHA-512", "B64");

        b64string = btoa("#{@config.api_key}:#{signature}")

        options.headers["Authorization"] = "Basic #{b64string}"

      if done.length <= 1
        response = request options
        done(response)
      else
        request options, (error, response, body) ->
          if response.statusCode >= 400 and response.statusCode < 500 
            if !error?

              try
                errors = JSON.parse(body)
              catch
                done(body, body)
                return

              error = new FirstRally.Error(response.statusCode, errors)
          else 
            try
              body = JSON.parse(body)
            catch
              # Do nothing.

          done(error, body)

  class FirstRally extends Base
    class @Error extends Error
      # @original is the original error object returned from the server.
      # It's expected to be an array.
      constructor: (@statusCode, @original) ->
        message = ""

        for error in @original
          message += " " if message.length != 0
          message += error.message + "."

        @message = message
        @name = "FirstRally.Error"

    class @User extends Base 
      @path_prefix: "/user"
      @update_profile: (profile, done) ->
        @post "/profile", profile, done

      @change_password: (new_password, current_password, done) ->
        @post "/password", {new_password, current_password}, done

      # For browser-based usage.
      @login: (email, password, done) ->
        @post login, {email, password}, done

    class @Notification extends Base
      @path_prefix: "/notification"
      @create: (stream_id, price, direction, done) ->
        @post "/new", {stream_id, price, direction}, done

      @delete: (notification_id) ->
        @delete "/#{notification_id}", done

    class @DataBatch extends Base
      @path_prefix: "/data_batch"
      @create: (stream_id, start_date, end_date, done) ->
        @post "/new", {exchange_identifier: stream_id, start_date: start_date.getTime(), end_date: end_date.getTime()}, done 

      @status: (data_batch_id, done) ->
        @get "/#{data_batch_id}", done

    class @BatchFile extends Base
      @path_prefix: "/batch_file"
      @download: (batch_file_id, done) ->
        path = "/#{batch_file_id}/download"
        if inBrowser  
          window.open(@url(path))
        else
          # If in node, return a streamable file.
          @get path, done

    class @DataStream extends Base
      @path_prefix: "/data_stream"
      @rtc_url: "https://rtc.bitcoinindex.es/connect"

      @list: (done) ->
        @get "/list", done

      @subscribe: (stream_id, callbacks={}) ->
        if !Faye? 
          throw new Error("DataStreams::subscribe() should only be used within a server environment!")

        if !@client?
          @subscriptions = {}
          @client = new Faye.Client(@rtc_url)

          clientAuth = 
            outgoing: (message, callback) =>
              # Add ext field if it's not present
              message.ext = {} if !message.ext?

              # Set the auth token
              message.ext.api_key = @config.api_key
              message.ext.api_key_secret = @config.api_key_secret

              # Carry on and send the message to the server
              callback(message)

          @client.addExtension clientAuth

        @subscriptions[stream_id] = @client.subscribe "/" + stream_id, (message) => 
          callbacks.message(message) if callbacks.message?
        @subscriptions[stream_id].then () =>
          callbacks.subscribe() if callbacks.subscribe?

      @unsubscribe: (stream_id) ->
        return if !@client?
        return if !@subscriptions? or !@subscriptions[stream_id]?

        @subscriptions[stream_id].cancel()
        delete @subscriptions[stream_id]



  return FirstRally
    
      


