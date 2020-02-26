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
