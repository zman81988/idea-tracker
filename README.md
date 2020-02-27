# Idea Tracker

An example application to show how to architect an integration with HubSpot.

## Disclaimer

While this app shows a general architecture for the integration piece, this app should not be used as is. It is intended to show useful integration patterns. It was not designed with UX, security or scaling in mind. While those things were considered, they weren't the focus.

### Dependencies

- [Docker](https://www.docker.com/)

### Stack used

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com/)
- [MongoDb](https://www.mongodb.com/)
- [React](https://reactjs.org/)

### Getting Started

- Make sure you have [Docker](https://www.docker.com/) installed
- Create a `.env` file using the [.env.template](./.env.template) file.
- Run `docker-compose up --build`

## Use Case

- This takes place in the Star Wars Universe
- The Idea Tracker app was purchased by a weapons manufacturer supplying both the Rebellion and the Empire (referred to as Factions in the app)
- When a user signs up to leave feedback about what kind of improvements they need to their weapons, they are associated to a Faction based on their email domain
- The manufacture can use that in conjunction with the CRM data to prioritize their road map

### Known Issues

- There is no login cookie, if you refresh the page, you are logged out
- You cannot update or delete Ideas and Users

## Planned Features

- Add company sync for Factions
- Check for existing property groups and properties instead of ignoring a 409 conflict
- Add Timeline API support for Ideas (the act of creating them)
- Add Webhooks to support bi-directional syncing
- Add CRM card support for Ideas
