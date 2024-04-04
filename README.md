# Rivegs API
Welcome to the Rivegs API, a backend service for a Rivegs app built using NestJS, MongoDB, and other technologies.

## Getting Started
To get started with the Rivegs API, follow these steps:

- [NestJS](https://nestjs.com/): A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- [MongoDB](https://www.mongodb.com/): A NoSQL database for storing recipe data.
- [Cloudinary](https://cloudinary.com/): For storing and serving recipe images.
- [JWT](https://jwt.io/): JSON Web Token for authentication.
- [bcrypt](https://www.npmjs.com/package/bcrypt): A library for hashing passwords securely.
- [Mongoose](https://mongoosejs.com/): A MongoDB object modeling tool.
- [Jest](https://jestjs.io/): A JavaScript testing framework.
- [Supertest](https://github.com/visionmedia/supertest): A library for testing HTTP servers.
- [ESLint](https://eslint.org/): A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

Clone the repository:

1. Copy code:
`git clone https://github.com/Max-Hirning/Rivegs-api`

2. Install dependencies:
`npm install`

3. Set up your environment variables by creating a .env file in the root directory. Sample .env variables:
* `EMAIL=""` 
* `EMAIL_PASS=""` 
* `EMAIL_CODE_EXPIRES_IN="1d"` 
* `JWT_TOKEN_EXPIRES_IN="30d"` 
* `ADMIN_ID=""` 
* `ADMIN_EMAIL=""` 
* `ADMIN_PASSWORD=""` 
* `CLOUDINARY_CLOUDNAME=""` 
* `CLOUDINARY_APIKEY=""` 
* `CLOUDINARY_APISECRET=""` 
* `PORT=8000` 
* `ORIGIN_URL=""` 
* `SECRET_KEY=""` 
* `ORIGIN_API_URL=""` 
* `DB_URL=""`

5. Start the development server:
`npm run start:dev`

The API server will start at `http://localhost:${PORT}`.

## **[Postman](https://www.postman.com/maxitco/workspace/rivegs-api)**

## Support and Contributions
For support, questions, or feedback, please contact maxhirning25@gmail.com.

If you would like to contribute to the Rivegs API, fork the repository and create a new branch for your feature. Submit a pull request with detailed information about the changes.

## License
This project is licensed under the MIT License.


## Additional Commands
***I haven't written the tests yet.***
* Run unit tests:
`npm test`
* Run test coverage:
`npm run test:cov`
* Run linting:
`npm run lint`

Thank you for using the Rivegs API! We hope it helps you manage your recipes with ease. Happy coding!



## About the Author
Rivegs API is developed and maintained by Max Hirning. For more projects and updates, visit the [GitHub repository](https://github.com/Max-Hirning).
