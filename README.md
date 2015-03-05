# First Rally API

## Install (coming soon)

```
npm install firstrally
```

## Usage 

##### Require the package

```
FirstRally = require "firstrally"
```

You can use the API wrapper by calling the functions below. See `example.coffee` for a quick example.

## Authentication

All functions require authentication unless otherwise specified. Before you're able to call an authenticated function, you must first set your `api_key` and `api_key_secret`. If you don't set these correctly, you'll receive a 401 Unauthorized error response from the server.

##### Set your API key and Secret

```
FirstRally.set
  api_key: "... your api key ..."
  api_key_secret: "... your api key secret ..."
```

Both your api key and secret can be generated within your account page on [firstrally.com](http://firstrally.com)

## Real-time Data

Most users will want to use this API wrapper to subscribe to real-time data streams. First Rally monitors hundreds of streams from dozens of exchanges. Streams are identified using the following system:

```
exchange_id/base_currency/secondary_currency
```

An example stream id would be "coinbase_exchange/usd/btc". This would denote a data stream tracking the value of Bitcoin in U.S. Dollars on Coinbase Exchange. You can list all available data streams by performing the following:

```
FirstRally.DataStream.list (error, json) ->
  if !error?
    console.log json # list all streams
```

See DataStream.list below for detailed information about the response. 

## Historical Data

In addition to real-time data, you can use our API to make requests for historical data. Historical data is requested in batches, which when processed will produce a data file for download. Batch requests are specified by a `stream_id`, as well as the `start_date` and `end_date` representing the timespan of the resultant data. You can request a batch file via the following:

```
moment = require "moment"

FirstRally.DataBatch.create "coinbase/usd/btc", moment().subtract(1, "day"), moment(), (error, body) ->
  if !error?
    # body contains a batch_file_id which you can then check the status of the data batch,
    # and download the file if the batch succeeded in processing.
```

**CAUTION:** Requesting a data batch will subtract the price of that data batch from your account when successfully processed. Currently there is no mechanism to provide you a price quote via the API before accepting the charge. 

To download a successfully processed batch file, perform the following: 

```
fs = require "fs"

batch_file_id = 23 # assume the batch file id is 23

FirstRally.BatchFile.download batch_file_id, (error, stream) ->
  if !error?
    out = fs.createWriteStream("data_file.json.tar.gz")
    stream.pipe(out)
```

TODO: The above hasn’t been implemented yet.

## API Methods

* User.update_profile
* User.change_password
* User.login
* Notification.create
* Notification.delete
* DataStream.list
* DataStream.subscribe
* DataStream.unsubscribe
* DataBatch.create
* BatchFile.download

Each method takes a `done` parameter as the last argument. This is a callback function of the form `function(error, responseBody)` which you can use to process the response. If error is `null`, your response was successful. See the section **Handling Errors** below for more information about error handling.

### User

##### update_profile(profile, done)

Update your user's profile. Profile should be an javascript `object` with the following keys:

* `first_name`: `String`, the first name of your user.
* `last_name`: `String`, the last name of your user.
* `email`: `String`, the email of
* `password`: `String`, your user's current password. You cannot use this method to update your password, see **`change_password`** However, your password is required for security reasons. 

##### change_password(new_password, current_password, done)

Change the password for your user. Parameters are:

* `new_password`: `String`, the new password for your user.
* `current_password`: `String`, the current password of your user, required for security reasons.

##### login(email, password, done)

Log in as the user specified by the email and password. This will set a cookie that, if passed with all other requests, can be used instead of api key authentication. 

* `email`: `String`, the registered email for your user.
* `password`: `String`, your user's password.

### Notification

##### create(stream_id, price, direction, done)

Create a new notification for your user across the specified `stream_id` and the given price. 

* `stream_id`: `String`. Stream ids are in the form `exchange/first_currency/second_currency`, and they specify the exchange and the currencies being traded. A stream_id of `coinbase_exchange/usd/btc`, for instance, will denote the value of Bitcoin in U.S. Dollars on Coinbase Exchange.
* `price`: `Float`, the value that, when crossed in the direction specified by `direction`, will cause the notification to be sent. Note that this price is the same currency as `first_currency`.
* `direction`: `String`, one of [`above`, `below`, `crosses`], default `crosses`. If `above`, the notification will be sent when the price of the specified stream goes above the value listed in `price`. If `below`, the notification will be sent if the price has gone below `price`. If `crosses`, the notification will be sent regardless of direction.

Returns: JSON object representing the notification created, including `id`.

##### delete(notification_id, done)

Delete the notification specified by `notification_id`.

* `notification_id`: `Integer`, the id of the notification to delete.

### DataStream

##### list(done) *: Does Not Require Authentication*

List all data streams. Takes no parameters.

Output is similar to the following. Notice that the top-most keys are the exchange ids, whose objects contain a label and an `streams` object that lists the streams. The keys within each exchange’s `streams` object are the stream ids (used by the real-time data and historical data APIs), and the values are an object containing data about the stream.

All streams will contain a `primary_currency_code` -- often called the “base currency” -- and a `secondary_currency_code`, which is the currency being traded. Some streams, like Cryptsy, have other information provided by the exchange, but that information is not guaranteed across all exchanges and streams.

```
{
  "bitx": {
    "label": "BitX",
    "streams": {
      "bitx/zar/btc": {
        "primary_currency_code": "ZAR",
        "secondary_currency_code": "BTC"
      }
    }
  },
  "cryptsy": {
    "label": "Cryptsy",
    "streams": {
      "cryptsy/btc/42": {
        "primary_currency_name": "BitCoin",
        "primary_currency_code": "BTC",
        "secondary_currency_name": "42Coin",
        "secondary_currency_code": "42"
      },
      "cryptsy/btc/ac": {
        "primary_currency_name": "BitCoin",
        "primary_currency_code": "BTC",
        "secondary_currency_name": "AsiaCoin",
        "secondary_currency_code": "AC"
      },
      # All of the Cryptsy streams...
    }
  },
  # All the other exchanges...
}
```

##### subscribe(stream_id, callbacks)

Subscribe to a data stream.

* `stream_id`: `String`. Stream ids are in the form `exchange/first_currency/second_currency`, and they specify the exchange and the currencies being traded. A stream_id of `coinbase_exchange/usd/btc`, for instance, will denote the value of Bitcoin in U.S. Dollars on Coinbase Exchange.
* `callbacks`: `Object`, an object that contains callback functions for specific events. Currently, two events/functions are supported: `message`, `subscribe`. The `message` function will be called every time new data has arrived from the stream; the `subscribe` function will be called when the subscription is successful.

Example use of this function: 

```
FirstRally.DataStream.subscribe "coinbase/usd/btc", 
  message: (messsage) ->
    console.log "Message received on #{message.identifier}, sent at #{new Date(message.date)}. Price = #{message.value}"
  subscribe: () ->
    console.log "Successfully subscribed to coinbase/usd/btc!"
```

##### unsubscribe(stream_id) 

Unsubscribe from messages on a specific stream. This will prevent listening for new price events across the stream, and you’ll need to re-subscribe to that stream to begin receiving messages again.

* `stream_id`: `String`. Stream ids are in the form `exchange/first_currency/second_currency`, and they specify the exchange and the currencies being traded. A stream_id of `coinbase_exchange/usd/btc`, for instance, will denote the value of Bitcoin in U.S. Dollars on Coinbase Exchange.

### DataBatch

##### create(stream_id, start_date, end_date, done)

Request a set of historical data. This logs your request in our system *only*. Once we process your request, a batch file will be available for download.

* `stream_id`: `String`. Stream ids are in the form `exchange/first_currency/second_currency`, and they specify the exchange and the currencies being traded. A stream_id of `coinbase_exchange/usd/btc`, for instance, will denote the value of Bitcoin in U.S. Dollars on Coinbase Exchange.
* `start_date`: `Date`, the date specifying the lower bound of data to be included in the resultant batch file.
* `end_date`: `Date`, the date specifying the upper bound of data to be included in the resultant batch file.

### BatchFile

##### download(batch_file_id, done)

Download the batch file specified by `batch_file_id`.

* `batch_file_id`: `Integer`, the id of the batch file to download.
