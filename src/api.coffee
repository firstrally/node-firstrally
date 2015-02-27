include = (factory) ->
  if module? and module.exports?
    request = require "request"
    btoa = require "btoa"
    jsSHA = require "../lib/jsSHA/src/sha512"
    module.exports = factory(request, jsSHA, btoa)
  else
    if !$? and !jQuery?
      throw "FirstRally api requires jQuery."
      return
    jQuery = $ || jQuery

    # Mimic node request module for what we need.
    request = (options, done) ->
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
    this.FirstRally = factory(request, jsSHA, btoa)
  return

include.call this, (request, jsSHA, btoa) ->

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

    @set: (options) ->
      for key of options
        @config[key] = options[key]
    
    @get: (short_path, done) ->
      @make_request(short_path, "GET", null, done)

    @post: (short_path, json, done) ->
      @make_request(short_path, "POST", json, done)

    @delete: (short_path, done) ->
      @make_request(short_path, "DELETE", null, done)

    @make_request: (short_path, method, body, done=(() ->)) ->
      path = "/api/v#{@config.version}#{@path_prefix}#{short_path}"

      options =
        url: "#{@config.scheme}://#{@config.host}#{path}"
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

      request options, (error, response, body) ->
        if response.statusCode >= 400 and response.statusCode < 500 
          if !error?

            try
              errors = JSON.parse(body)
            catch
              done(body, body)
              return

            error = new FirstRally.Error(response.statusCode, errors)

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

      @reset_password: (new_password, current_password, done) ->
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
        @post "/new", {exchange_identifier: stream_id, start_date, end_date}, done 

    class @BatchFile extends Base
      @path_prefix: "/batch_file"
      @download: (batch_file_id, done) ->
        @get "/#{batch_file_id}/download", done

  return FirstRally
    
      


