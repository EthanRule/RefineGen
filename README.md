# RefineGen
#### Image generator with AI context assistance. [link!](https://www.refinegen.com/)

## Core Features

#### Application client for refining prompts using an OpenAI feedback loop and image generation with OpenAI Dalle-3.
![generating](/app/public/docs/generating.png)
![dashboard](/app/public/docs/dashboard.png)

#### Storage with AWS S3.
![gallery](/app/public/docs/gallery.png)

#### Mobile first design 🤙
![mobile](/app/public/docs/mobile.png)

#### Payment handling with Stripe.
![purchase](/app/public/docs/purchase.png)
![checkout](/app/public/docs/checkout.png)

#### Homepage with NextAuth authentication and PostgreSQL database.
![homepage](/app/public/docs/homepage.png)
![footer](/app/public/docs/footer.png)
![auth](/app/public/docs/auth.png)

#### 150+ Tests mocking inputs for various API's and basic server logic tests.
![auth](/app/public/docs/tests.png)

### Running the code.

Please follow the instructions below to build and run this project:

1. Clone the repository.

2. Install the latest LTS version of Node: https://nodejs.org/en/download

3. Create a new file named .env in the root of the project.

4. Inside the .env file, obtain the following keys:

```
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
OPENAI_API_KEY=
DATABASE_URL
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
STRIPE_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
```

Then, in an .env.local file, place the

```
DATABASE_URL=
```

5. From the app directory run: `npm install`

6. From the app directory, run: `npm run dev`

7. If you would like to run the tests, run: `npm test`

Feel free to use and distribute this code without the need for credit.
