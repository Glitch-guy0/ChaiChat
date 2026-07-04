## updates
- this is a follow up on top the existing prd and mainly focused on the backend side operations

## auth / user recognition
- when user lands to flow 1 aka "/" route, on the frontend trigger POST: / for backend user authentication token generator
- on startup generate an unique string (this will be used to generate token and for verification)
- to identify the user: 
  - get the "user-agent" 
  - from the frontend generate and send a unique uuidv4 string as "new-user" header
  - based on this generate a jwt token using a private key.
  - jwt token will be as {user-agent: user-agent, userid: uuidv4, createdAt: timestamp}
  - expiry of 1hr
  - will store this as cookie["Authentication"] from response no need to handle from frontend.

## how session / conversations is stored
- will have a redis db to store this conversation
- key will be the json token based on this will store the conversation.
- expiry of the conversation will be 1 hr.


## persona System prompt
- this will be passed a file in project root
- location: {{project root}}/persona/[persona name].md
- load this file as it is and pass it as system prompt.