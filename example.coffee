#!/usr/bin/env coffee

FirstRally = require "./src/api"

FirstRally.API.set
 api_key: "fec3388c5ed5471a158686533598d5b3"
 api_key_secret: "94dcb07e6b0a474addd8111c171d2adb54667d52aa5a6c5e1e68a7045b8cde99"

payload = 
  first_name: "Tim"
  last_name: "Coulter"
  email: "tim@timothyjcoulter.com"
  password: "password"

FirstRally.API.User.update_profile payload, (error, body) ->
  console.log error
  console.log body

