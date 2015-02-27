# First Rally API

## Install (coming soon)

```
npm install firstrally
```

## Usage 

##### Require the package

```
FirstRally = require "firstrally-api"
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

FirstRally.User.update_profile user, (error, body) ->
  console.log error # Request error, if it exists. More on that below.
  console.log body # Body of the response
```
