# Coinscale API

This RESTful API backend serves Coinscale, a cryptocurrency trading simulator. For a general description of the application and documentation of the client-side code, please see [this repository](https://github.com/thomahau/coinscale-client). A deployed version of the app can be found at [https://coinscale.netlify.com/](https://coinscale.netlify.com/).

## Endpoints

### Create user

Creates new user and sends username in response.

- **URL:** /api/users
- **Method:** `POST`
- **URL params:** None
- **Data params:**

```
{
    username: [string],
    password: [string]
}
```

- **Success response example:** `{ username: "Satoshi Nakamoto" }`

---

### Log in

Authenticates existing user and returns JWT token.

- **URL:** /api/auth/login
- **Method:** `POST`
- **URL params:** None
- **Data params:**

```
{
    username: [string],
    password: [string]
}
```

- **Success response example:** `{ authToken: [string] }`

### Refresh auth token

Returns fresh JWT token.

- **URL:** /api/auth/refresh
- **Method:** `POST`
- **URL params:** None
- **Data params:** None

* **Success response example:** `{ authToken: [string] }`

---

### Show price data

Returns array of price data for a basket of cryptocurrencies in the 7-day interval leading up to query parameter {date}.

- **URL:** /api/prices?date={date}
- **Method:** `GET`
- **Query params:** `date=[string]`
- **Data params:** None

* **Success response example:**

```
[
    {
        currency: "BTC",
        name: "Bitcoin",
        current: "1017.20",
        sevenDaysAgo: "914.20"
    },
    ...
]
```

---

### Show portfolio

Returns json data for user's portfolio, or creates and returns default portfolio if one does not exist.

- **URL:** /api/portfolio
- **Method:** `GET`
- **URL params:** None
- **Data params:** None

* **Success response example:**

```
{
    balance: 20000,
    holdings: {}
}
```

### Update portfolio

Returns json data for user's portfolio, or creates and returns default portfolio if one does not exist.

- **URL:** /api/portfolio/:id
- **Method:** `PUT`
- **URL params:** `id=[integer]`
- **Data params:**

```
{
    balance: [number],
    holdings: {
        [string]: [number],
        ...
    }
}
```

- **Success response example:** N/A

---

### Show all transactions

Returns array of transactions for user

- **URL:** /api/transactions
- **Method:** `GET`
- **URL params:** None
- **Data params:** None

* **Success response example:**

```
[
    {
        id: "5b51ee16a0e0b72574d2c21d"
        date: "2017-01-01",
        type: "Buy",
        symbol: "BTC",
        price: "1017.20",
        amount: 1
    },
    ...
]
```

### Create transaction

Creates and returns new transaction.

- **URL:** /api/transactions
- **Method:** `POST`
- **URL params:** None
- **Data params:**

```
{
    date: "2017-01-01",
    type: "Buy",
    symbol: "BTC",
    price: 1017.20,
    amount: 1
}
```

- **Success response example:**

```
{
    id: "5b51ee16a0e0b72574d2c21d",
    date: "2017-01-01",
    type: "Buy",
    symbol: "BTC",
    price: 1017.20,
    amount: 1
}
```

---

### Users

`POST` `/api/users`
Create a new user. Sends username in response.

### Authentication

`POST` `/api/auth/login`
Authenticate and log in user. Sends JWT token in response.

`POST` `/api/auth/refresh`
Refresh JWT. Sends fresh token in response.

### Prices

`GET` `/api/prices?date={date}`
Get price data for a basket of cryptocurrencies in the 7-day interval leading up to query parameter {date}. Sends array of price data in response.

### Portfolio

`GET` `/api/portfolio`
Get user's portfolio, or create default portfolio if one does not exist. Sends portfolio object in response.

`PUT` `/api/portfolio/:id`
Update user's portfolio by passing new balance and holdings in request body.

### Transactions

`GET` `/api/transactions`
Get user's transactions. Sends array of transactions in response.

`POST` `/api/transactions`
Create new transaction. Sends newly created transaction in response.
