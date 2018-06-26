# PHATE Web Portal QD Prototype

A quick and dirty prototype of the PHATE web application built to test what type of access child spawned python scripts had on a virtual file system where files are served from a multi processor environment and there are no guarantees on file existence in the particular server instance/frame.

Hypothetically this should not be an issue since we're handling everything in a single-threaded process and doing it all in sequence (with a well defined output/error catch), but this repo is built to test the various I/O configs for the PHATE data ingestion engine (mtx, 10X, etc. etc.) and see whether things lie unzipping, etc. cause issues on an actual cloud environment.

Currently built for testing on:
- Heroku
- EC2 (coming soon)

## Installation

```bash
$ git clone https://github.com/abhinayar/PHATE-VFSTest.git phate-vfstest
$ cd phate-vfstest # jump into the project
$ npm i # or yarn if you fancy
```

## Usage

1. Place the file you want to access in Python in the /spoof_uploads dir.
1. Place the script you wan tot run in /scripts
1. Edit the .safe_env file to reflect the python script name you are running
1. Push to github (will auto-deploy heroku, give it a few seconds - 1min. to do this)
1. Click "Run on Heroku" or "Run on LocalHost" depending on environment (coming soon -> ability to test uploaded files from FE, but I didn't want to get into that yet... one thing at a tme)
1. Watch for processing stream or error output
1. Repeat/tweak code
1. If code is cryptic check heroku error logs (if you have the Heroku CLI it's `heroku logs -n 2000` or whatever arbitrary number you choose.)

##

Shoot me a message on Slack or at abhishek.nayar@yale.edu with any questions.

Cheers,
Abhi
