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

##### Set your API key and Secret

```
FirstRally.set
  api_key: "... your api key ..."
  api_key_secret: "... your api key secret ..."
```

Both your api key and secret can be generated within your account page on [firstrally.com](http://firstrally.com)

##### Call the method of your choice

Here's an example of updating your profile information. Remember, each api key is associated with a specific user, so calling this method will update the information on your account.

```
user = 
  first_name: "Tim"
  last_name: "Coulter"
  email: "tim@timothyjcoulter.com"
  password: "passw0rd"

FirstRally.User.update_profile user, (error, body) ->
  console.log error # Request error, if it exists. More on that below.
  console.log body # Body of the response
```

## API Methods

* User.update_profile
* User.change_password
* User.login
* Notification.create
* Notification.delete
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

### DataBatch

##### create(stream_id, start_date, end_date, done)

Request a set of historical data. This logs your request in our system *only*. Once we process your request, a batch file will be available for download.

* `stream_id`: `String`. See description of `stream_id` under **Notification.create**.
* `start_date`: `Date`, the date specifying the lower bound of data to be included in the resultant batch file.
* `end_date`: `Date`, the date specifying the upper bound of data to be included in the resultant batch file.

### BatchFile

##### download(batch_file_id, done)

Download the batch file specified by `batch_file_id`.

* `batch_file_id`: `Integer`, the id of the batch file to download.
