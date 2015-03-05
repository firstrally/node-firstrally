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

Most users will want to use this API wrapper to subscribe to real-time data streams. First Rally monitors hundreds of streams from dozens of exchanges. Streams are identified using the following naming scheme:

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
    # body contains an id of the data batch which you can used to check the 
    # status of the data batch and download the file once it has finished processing.
    # See DataBatch.status() for more information.
```

**CAUTION:** Requesting a data batch will subtract the price of that data batch from your account when successfully processed. Currently there is no mechanism to provide you a price quote via the API before accepting the charge, so call this function at your own risk. You will receive an error response from the server if your account does not have enough available credit. 

To download a successfully processed batch file, perform the following. Note that the API differs slightly here in that you’ll receive a single response object that you can then stream. See BatchFile.download() for more details.

```
fs = require "fs"

# Assume the batch file is 23. You can get the batch file's id
# by calling DataBatch.status()
batch_file_id = 23

FirstRally.BatchFile.download batch_file_id, (response) ->
  response.on 'error', (err) ->
    console.log(err)
  .pipe(fs.createWriteStream("data_file.json.gz"))
```

## API Methods

Public methods:

* Conversion.current
* DataStream.list
* User.login

Private methods (require authentication):

* User.update_profile
* User.change_password
* Notification.create
* Notification.delete
* DataStream.subscribe
* DataStream.unsubscribe
* DataBatch.create
* DataBatch.status
* BatchFile.download

##### Handling Responses

Each method takes a `done` parameter as the last argument. This is a callback function of the form `function(error, json)` which you can use to process the response. If error is `null`, your response was successful. 

Alternatively, you can pass a `done` callback that takes a single `response` object which you can use to stream the response. See the **Historical Data** section above for an example.

##### Handling Errors

When using the first form of the `done` callback, the first argument passed will be an `error` object. If `error` is null, your request was successful and there were no errors. However, if your request failed, the `error` object will not be null, and will be of type `FirstRally.Error`, which extends from the native `Error` object. An example error object (converted to json) looks like this:

```
{ [FirstRally.Error: Invalid password.]
  statusCode: 417,
  message: 'Invalid password.',
  original: [ { message: 'Invalid password' } ],
  name: 'FirstRally.Error' }
```

Note that this error object contains a few extra attributes you can use for processing the response. These are:

* `statusCode`: `Integer`, the HTTP error code for the response. This will be 400 or above.
* `message`: `String`, a English-formatted message you can use for printing, or understanding the error message. This is a single string containing all individual error messages.
* `original`: `Array`, an array of separate error messages originally sent by the server. The server can respond with more than one message (though most often won’t), and so you have access to the distinct error responses, if needed.

### Conversions

First Rally provides currency conversions to and from every currency we track, including both fiat and cryptocurrencies. Often conversions are the average trading value of a trading pair across all exchanges, where the currencies are traded directly (e.g., USD -> BTC). However, some conversions like NAUT -> TOP are indirect, where the calculation follows NAUT -> BTC -> LTC -> TOP. We call these “conversion chains”. Though conversions with longer conversion chains may not provide practical value in the trading process due to exchange fees, and may not be precise due to extra calculations, we feel these conversions are useful to achieve an approximate value when moving from one currency to another.

##### current([[from,] to,] done) *: Does Not Require Authentication*

Get the conversions for the specified currency/currencies.

* `from`: `String`, optional: the first currency code you’d like conversions for.
* `to`: `String`, optional; the second currency code for calculating the conversion.

Both the `from` parameter and the `to` parameter are optional parameters. When only `from` is passed, you’ll receive an object in the `done` callback that contains all the currencies `from` can convert to, as well as the conversion ratios. When `to` is passed, you’ll receive a single conversion from the `from` currency to the `to` currency.

If neither `from` nor `to` is passed, you’ll receive an object with **all** conversions, showing conversion ratios from every currency we track to every other currency we track. Note that this is a large response (in megabytes), and you’ll likely want to stream it. See the **Historical Data** section above for an example.

An example conversion response *from* USD *to* BTC looks like this:

```
{
  "result": {
    "conversion": 0.0036177106543686,
    "chain": "usd/btc"
  },
  "timestamp": 1425577229972
}
```

This response states that `1 USD` is equal to `0.0036177106543686 BTC` at the time of the conversion. The `timestamp` parameter specifies when this conversion was calculated, and the `chain` result shows how we calculated it. Chains with only two currencies represent a conversion that is directly traded across one or more exchanges.

### User

##### update_profile(profile, done)

Update your user's profile. Profile should be an `object` with the following keys:

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

Output is similar to the following. Notice that the top-most keys are the exchange ids, whose objects contain a label and a `streams` object that lists the streams. The keys within each exchange’s `streams` object are the stream ids (used by the real-time data and historical data APIs), and the values are an object containing data about the stream.

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

All streams will contain a `primary_currency_code` -- often called the “base currency” -- and a `secondary_currency_code`, which is the currency being traded. Some streams, like Cryptsy, have other information provided by the exchange, but that information is not guaranteed across all exchanges and streams.

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

The `done` callback will be passed an object representing the data batch you just created, which includes its id for checking its processing status at a later date. The object will look something like this:

```
{ id: 27,
  user_id: 2,
  job_id: 1478,
  exchange_identifier: 'coinbase/usd/btc',
  start_date: '2015-03-04T06:07:17.000Z',
  end_date: '2015-03-05T06:07:17.000Z',
  created_at: '2015-03-05T06:07:17.000Z',
  updated_at: '2015-03-05T06:07:17.000Z',
  deleted_at: null
}
```

##### status(data_batch_id, done)

Check on the status of a data batch. This takes a single argument:

* `data_batch_id`: `Integer`, the id of the data batch.

The done callback will be passed the same object as DataBatch.create(), except that if the data batch has been successfully processed, `batch_file` information will be included. If the batch has no yet been processed, no `batch_file` information will be returned. Example:

```
{ id: 27,
  user_id: 2,
  job_id: 1478,
  exchange_identifier: 'coinbase/usd/btc',
  start_date: '2015-03-04T06:07:17.000Z',
  end_date: '2015-03-05T06:07:17.000Z',
  created_at: '2015-03-05T06:07:17.000Z',
  updated_at: '2015-03-05T06:07:17.000Z',
  deleted_at: null,
  batch_file: { 
    id: 24, 
    file_name: 'coinbase_usd_btc_1425535637000.json.gz' 
  } 
}
```

### BatchFile

##### download(batch_file_id, done)

Download the batch file specified by `batch_file_id`.

* `batch_file_id`: `Integer`, the id of the batch file to download.

This method is slightly different from the other methods in that it returns large amounts of data, so you’ll want to stream the response. See **Historical Data** above for an example.