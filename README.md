# Crypto Portfolio CLI
Propine test assignment

## Usecases
- Given no parameters, return the latest portfolio value per token in USD
- Given a token, return the latest portfolio value for that token in USD
- Given a date, return the portfolio value per token in USD on that date - (Accumulate all transactions of all time in the past to that data)
- Given a date and a token, return the portfolio value of that token in USD on that date
- Note:
-- The csv file might be updated continuosly, so it needs to always keep track of new content
-- There may be working with many different files, then previous cache need to be flushed if any

## Features
- Get porfolio based on the given date and/or token name
- Caching previous calculated porfolio and token price with sqlite3
- List all tokens
- Set default csv path

## Usage

UPDATING...
