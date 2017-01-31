# alexa-sample
This project contains source for a simple node app hosted in AWS lambda that interacts with Alexa

This project is based on the Skills Trivia sample from Amazon - https://developer.amazon.com/blogs/post/TxDJWS16KUPVKO/new-alexa-skills-kit-template-build-a-trivia-skill-in-under-an-hour

###To run this sample, you will need:
  1.  An Alexa Developer account - https://developer.amazon.com/edw/home.html#/
  2.  An AWS Lambda account - https://aws.amazon.com/lambda/ (Click on getting started)
  3.  A WISPr account - http://www.wispr.rocks/signup

###After you have created your accounts, clone, build, and zip the lambda function: 
  1.  clone this repo
  2.  run npm install
  3.  archive the node_modules and index.js files into a zip
  
###To deploy the skill, follow these instructions: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/steps-to-build-a-custom-skill
  1.  Where you define the voice commands, use the intent.json file
  2.  Where you define the lambda function, upload the zip you created above.
  3.  In the lambda function, define the environment variables:
      a.  SERVER_URL - the url to the WISPr API
      b.  USERNAME - the email address you received by signing up for a tiral
      c.  PASSWORD - the password you were given
     
