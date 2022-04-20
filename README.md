# Crypto Portfolio CLI
Propine test assignment

## Usecases
- Given no parameters, return the latest portfolio value per token in USD
- Given a token, return the latest portfolio value for that token in USD
- Given a date, return the portfolio value per token in USD on that date - (Accumulate all transactions of all time in the past to that data)
- Given a date and a token, return the portfolio value of that token in USD on that date
- Note:
  - The csv file might be updated continuosly, so it needs to always keep track of new content
  - There may be working with many different files, then previous cache need to be flushed if any

## Features
- Get porfolio based on the given date and/or token name
- Caching previous calculated porfolio to local temp file via sqlite3
- List all tokens
- Set default csv path

## Installation
Install package. (prequisite: node >= v12)
```sh
cd crypto-portfolio-cli
yarn install
// Run
yarn start -h
```
Install  binary.
```sh
npm install -g .
// uninstall
npm uninstall -g

// sample run (prepare .env)
% cryptop path ~/Downloads/transactions.csv   <-- should passing absolute path
OK
% cryptop --readable true
Target file: /Users/anhdv/Downloads/transactions.csv
Processed in 0.143 seconds
- BTC : $49,806,167,750,517,280.00
- ETH : $2,794,516,829,046,844.00
- XRP : $688,249,398,508.09
```

Source tree
```text
.
├── LICENSE
├── README.md
├── index.js
├── package.json
├── src
│   ├── actions      <-- main logic
│   ├── app.js 
│   ├── constants    <-- define all constants variables
│   ├── controllers  <-- define handler for command
│   ├── repositories <-- repository intteract to database
│   ├── services     <-- third parties library/framework/api 
│   ├── tests
│   ├── utils        <-- utility funtion
│   └── workers      <-- handle thread worker
├── yarn-error.log
└── yarn.lock
```
## Package dependencies
- [Commander] - Commandline framework
- [Chalk] - Terminal string styling
- [Sqlite3] - Lightweight database
- [Sequelize] - nodejs ORM interface

## Techical analysis
- For commandline parser, Commander give a well formed code structure with binding action just like API framework.  
- Database is to cache the result (and store some settings) since all the transaction data is historical data, it has no changes. It makes no senses to recalculate everytime running. 
Furthermore, HTTP request to external api to get price have rate limit, therefore the price also should be cached in a short time like 1 minute.
Sqlite3 is simple, lightweight and no dependencies. It stores db in a local file, suitable to be run on any PC as an CLI app. 
- **Solution to aggregate balance in large csv file**
  - **Solution 1**: Read stream reversed from bottom to top, save portfolio result accumulated everyday. So it takes only the first time to process through the whole file, after that portfolio can be retreived imediately from db Or only need to calculate for newly added rows then garther the result together. 
    + The problem with this approach is that cannot applying multithreading to handle cpu/disk IO intensive tasks since the data is accumulated over the time, for example the a portfolio this month needs the data from last month. 
  - **Solution 2**: only calculate the profit/loss of a single day and save that amount to db. It can easily to retrieve the portfolio of all time or the portfolio on any date by use db aggregate function. 
    + By storing data independently for each day, I can split the read stream data into serveral pieces and process each one on a new thread worker. (number of thread workers should depend on number of CPU cores)
    + The problem I have to solve is that if it's splited into 4 separated parts, there may have 3 broken rows and 3 incompletes day's data due to cutting based on bytes size. For broken rows, I extend some bytes on previous splitted part and trim the broken first row on the next splitted part.
    + For the incomplete day's data, gathering those days from worker thread's message to be merged on the main thread to make a completed day's data. 
    + By using 4 worker threads I can reduce the processing time from ~18 seconds to around ~4 seconds on my 4 cores laptop.
- **Solution to aggregate balance on a random date.**
  - The file logs the data ranging from year 1972 to 2019, let says the last run already cached for the date portfolio until year 2000. But now we want to get portfolio on a date of year 2001, obviously that we don't want to read stream from the year 2019 to 2000, we may need to seek the stream nears to year 2021 so that the stream only need to go through data of only 1 year from 2001 to 2020. 
  To do that I use binary search (for each offset read the first row to find the date value) to reach the right offset value.

## Performance tooling
- Read stream directly from buffer without using a middleware csv pipeline process like csv-parser, readline.
- Avoid use Bignumber library to deal with floating point. I use pow of 10 instead to handle precision.
- Use bulk insert to insert portfolio result for every days
- Parse date as integer number instead of datetime type 
---
## Unit tests (TBD)
## License

## Note
Tested on [Ubuntu 20, node -v 12.22, npm -v6.14] and [MacOs node -v14, npm -v6.14]
